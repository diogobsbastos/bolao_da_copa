import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";

async function admOk(req: FastifyRequest): Promise<boolean> {
  const t = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (expected && t === expected) return true;
  const u = await usuarioDaReq(req);
  return u?.papel === "admin";
}

const N = (v: any) => (v === null || v === undefined || v === "" ? 0 : Number(v));
const EH_IMAGEM = (modelo: string, precoImg: number) => precoImg > 0 || /image|imagen|nano[- ]?banana/i.test(modelo || "");

let migrado = false;
export async function migrarCustos(): Promise<void> {
  if (migrado) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS precos_modelos (
      id SERIAL PRIMARY KEY, modelo TEXT UNIQUE NOT NULL, provedor TEXT DEFAULT '',
      preco_in NUMERIC DEFAULT 0, preco_out NUMERIC DEFAULT 0, preco_cache NUMERIC DEFAULT 0,
      arquivado BOOLEAN DEFAULT false, atualizado TIMESTAMPTZ DEFAULT now());
    ALTER TABLE precos_modelos ADD COLUMN IF NOT EXISTS preco_imagem NUMERIC DEFAULT 0;
    CREATE TABLE IF NOT EXISTS gastos_log (
      id SERIAL PRIMARY KEY, ts TIMESTAMPTZ DEFAULT now(), origem TEXT DEFAULT '', modelo TEXT DEFAULT '',
      processo TEXT DEFAULT '', tokens_in INT DEFAULT 0, tokens_out INT DEFAULT 0, tokens_cache INT DEFAULT 0,
      custo_usd NUMERIC DEFAULT 0, custo_brl NUMERIC DEFAULT 0, tempo NUMERIC DEFAULT 0);
    ALTER TABLE gastos_log ADD COLUMN IF NOT EXISTS imagens INT DEFAULT 0;
    CREATE TABLE IF NOT EXISTS custos_meta (chave TEXT PRIMARY KEY, valor TEXT);
    INSERT INTO custos_meta (chave, valor) VALUES ('dolar_brl','5.20') ON CONFLICT (chave) DO NOTHING;
    INSERT INTO custos_meta (chave, valor) VALUES ('dolar_atualizado','') ON CONFLICT (chave) DO NOTHING;
  `);
  try {
    await pool.query(`INSERT INTO precos_modelos (modelo, provedor)
      SELECT DISTINCT modelo, provedor FROM llm_provedores WHERE modelo <> ''
      ON CONFLICT (modelo) DO NOTHING`);
  } catch {}
  migrado = true;
}

export async function garantirPreco(modelo: string, provedor = ""): Promise<void> {
  if (!modelo) return;
  await migrarCustos();
  await pool.query(
    "INSERT INTO precos_modelos (modelo, provedor) VALUES ($1,$2) ON CONFLICT (modelo) DO UPDATE SET provedor=COALESCE(NULLIF(precos_modelos.provedor,''),$2)",
    [modelo, provedor]
  );
}

export async function dolarAtual(): Promise<number> {
  const { rows } = await pool.query("SELECT valor FROM custos_meta WHERE chave='dolar_brl'");
  const v = N((rows as any[])[0]?.valor);
  return v > 0 ? v : 5.2;
}

// registra uma operacao: TEXTO cobra por 1M tokens; IMAGEM cobra por imagem gerada.
export async function registrarGasto(o: {
  modelo: string; tokens_in?: number; tokens_out?: number; tokens_cache?: number; imagens?: number;
  processo?: string; origem?: string; tempo?: number;
}): Promise<void> {
  try {
    const modelo = o.modelo || "";
    const tin = N(o.tokens_in), tout = N(o.tokens_out), tcache = N(o.tokens_cache);
    let imgs = N(o.imagens);
    await garantirPreco(modelo);
    const { rows } = await pool.query("SELECT preco_in, preco_out, preco_cache, preco_imagem FROM precos_modelos WHERE modelo=$1", [modelo]);
    const pr = (rows as any[])[0] || {};
    const ehImg = EH_IMAGEM(modelo, N(pr.preco_imagem));
    if (ehImg && imgs === 0) imgs = 1; // toda chamada a modelo de imagem gera 1 imagem
    const custoUsd = ehImg
      ? imgs * N(pr.preco_imagem)
      : (tin / 1e6) * N(pr.preco_in) + (tout / 1e6) * N(pr.preco_out) + (tcache / 1e6) * N(pr.preco_cache);
    const dolar = await dolarAtual();
    await pool.query(
      "INSERT INTO gastos_log (origem, modelo, processo, tokens_in, tokens_out, tokens_cache, imagens, custo_usd, custo_brl, tempo) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
      [o.origem || "backend", modelo, o.processo || "", tin, tout, tcache, imgs, custoUsd, custoUsd * dolar, N(o.tempo)]
    );
  } catch (e) {
    console.error("registrarGasto falhou:", (e as any)?.message ?? e);
  }
}

async function buscarDolarVivo(): Promise<number> {
  if (typeof fetch !== "function") throw new Error("fetch indisponivel");
  try {
    const r = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL");
    const j: any = await r.json().catch(() => ({}));
    const bid = N(j?.USDBRL?.bid);
    if (bid > 0) return bid;
  } catch {}
  const r2 = await fetch("https://open.er-api.com/v6/latest/USD");
  const j2: any = await r2.json().catch(() => ({}));
  const brl = N(j2?.rates?.BRL);
  if (brl > 0) return brl;
  throw new Error("nenhuma fonte de cotacao respondeu");
}

const LITELLM_URL = "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
const norm = (s: string) => String(s || "").toLowerCase().replace(/^[a-z0-9_-]+\//, "");
async function baixarCatalogo(): Promise<Record<string, any>> {
  if (typeof fetch !== "function") throw new Error("fetch indisponivel");
  const r = await fetch(LITELLM_URL);
  if (!r.ok) throw new Error("catalogo http " + r.status);
  const j: any = await r.json();
  const idx: Record<string, any> = {};
  for (const k of Object.keys(j)) {
    if (k === "sample_spec") continue;
    const v = j[k];
    const item = {
      in: N(v.input_cost_per_token) * 1e6,
      out: N(v.output_cost_per_token) * 1e6,
      cache: N(v.cache_read_input_token_cost ?? v.cache_creation_input_token_cost) * 1e6,
      img: N(v.output_cost_per_image),
    };
    idx[k.toLowerCase()] = item;
    idx[norm(k)] = item;
  }
  return idx;
}

export async function rotasCustos(app: FastifyInstance) {
  await migrarCustos();

  app.get("/admin/custos/dados", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    await migrarCustos();
    const meta = await pool.query("SELECT chave, valor FROM custos_meta");
    const m: any = {}; (meta.rows as any[]).forEach((r) => (m[r.chave] = r.valor));
    const precos = await pool.query("SELECT modelo, provedor, preco_in, preco_out, preco_cache, preco_imagem, arquivado, atualizado FROM precos_modelos ORDER BY arquivado, provedor, modelo");
    const ativos = await pool.query("SELECT DISTINCT modelo, em_uso, papel FROM llm_provedores");
    const ativaMap: any = {}; (ativos.rows as any[]).forEach((r) => (ativaMap[r.modelo] = { ativo: true, em_uso: r.em_uso, papel: r.papel }));
    const modelos = (precos.rows as any[]).map((p) => ({
      modelo: p.modelo, provedor: p.provedor,
      preco_in: N(p.preco_in), preco_out: N(p.preco_out), preco_cache: N(p.preco_cache), preco_imagem: N(p.preco_imagem),
      arquivado: p.arquivado, atualizado: p.atualizado,
      ativo: !!ativaMap[p.modelo]?.ativo, em_uso: !!ativaMap[p.modelo]?.em_uso,
      papel: ativaMap[p.modelo]?.papel || "",
    }));
    const ag = await pool.query(
      "SELECT count(*)::int ops, COALESCE(sum(tokens_in),0)::bigint tin, COALESCE(sum(tokens_out),0)::bigint tout, COALESCE(sum(tokens_cache),0)::bigint tcache, COALESCE(sum(imagens),0)::int imgs, COALESCE(sum(custo_brl),0) gasto, COALESCE(sum(tempo),0) tempo FROM gastos_log"
    );
    const a = (ag.rows as any[])[0];
    const ops = N(a.ops);
    const log = await pool.query("SELECT to_char(ts,'YYYY-MM-DD HH24:MI') quando, origem, modelo, processo, tokens_in, tokens_out, tokens_cache, imagens, custo_brl, tempo FROM gastos_log ORDER BY ts DESC LIMIT 300");
    return {
      dolar: N(m.dolar_brl) || 5.2,
      dolar_em: m.dolar_atualizado || "",
      modelos,
      resumo: {
        ops, tin: N(a.tin), tout: N(a.tout), tcache: N(a.tcache), imgs: N(a.imgs),
        total: N(a.tin) + N(a.tout) + N(a.tcache),
        gasto: N(a.gasto), medio: ops ? N(a.gasto) / ops : 0, tempo: N(a.tempo),
      },
      log: (log.rows as any[]).map((r) => ({ ...r, custo_brl: N(r.custo_brl), tempo: N(r.tempo) })),
    };
  });

  app.post("/admin/precos/salvar", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    const modelo = String(b.modelo ?? "").trim();
    if (!modelo) return reply.code(400).send({ erro: "modelo" });
    await pool.query(
      "INSERT INTO precos_modelos (modelo, provedor, preco_in, preco_out, preco_cache, preco_imagem, atualizado) VALUES ($1,$2,$3,$4,$5,$6,now()) ON CONFLICT (modelo) DO UPDATE SET provedor=$2, preco_in=$3, preco_out=$4, preco_cache=$5, preco_imagem=$6, atualizado=now()",
      [modelo, String(b.provedor ?? ""), N(b.preco_in), N(b.preco_out), N(b.preco_cache), N(b.preco_imagem)]
    );
    return { ok: true };
  });

  app.post("/admin/precos/arquivar", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    await pool.query("UPDATE precos_modelos SET arquivado=$2 WHERE modelo=$1", [String(b.modelo ?? ""), !!b.arquivado]);
    return { ok: true };
  });

  app.post("/admin/precos/del", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    await pool.query("DELETE FROM precos_modelos WHERE modelo=$1", [String(((req.body ?? {}) as any).modelo ?? "")]);
    return { ok: true };
  });

  app.post("/admin/precos/catalogo", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    try {
      const idx = await baixarCatalogo();
      const { rows } = await pool.query("SELECT modelo FROM precos_modelos WHERE arquivado=false");
      let atualizados = 0; const faltando: string[] = [];
      for (const r of rows as any[]) {
        const mod = String(r.modelo);
        const hit = idx[mod.toLowerCase()] || idx[norm(mod)];
        if (hit && (hit.in > 0 || hit.out > 0 || hit.img > 0)) {
          await pool.query("UPDATE precos_modelos SET preco_in=$2, preco_out=$3, preco_cache=$4, preco_imagem=$5, atualizado=now() WHERE modelo=$1", [mod, hit.in, hit.out, hit.cache, hit.img]);
          atualizados++;
        } else { faltando.push(mod); }
      }
      return { ok: true, atualizados, faltando, total: (rows as any[]).length };
    } catch (e: any) {
      return reply.code(502).send({ ok: false, erro: String(e?.message ?? e).slice(0, 160) });
    }
  });

  app.post("/admin/precos/dolar", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    try {
      let valor = N(b.valor);
      if (b.atualizar) valor = await buscarDolarVivo();
      if (!(valor > 0)) return reply.code(400).send({ ok: false, erro: "valor invalido" });
      const quando = new Date().toISOString().slice(0, 16).replace("T", " ");
      await pool.query("INSERT INTO custos_meta (chave,valor) VALUES ('dolar_brl',$1) ON CONFLICT (chave) DO UPDATE SET valor=$1", [String(valor)]);
      await pool.query("INSERT INTO custos_meta (chave,valor) VALUES ('dolar_atualizado',$1) ON CONFLICT (chave) DO UPDATE SET valor=$1", [quando]);
      return { ok: true, valor, quando };
    } catch (e: any) {
      return reply.code(500).send({ ok: false, erro: String(e?.message ?? e).slice(0, 140) });
    }
  });

  app.post("/admin/custos/zerar", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    await pool.query("TRUNCATE gastos_log");
    return { ok: true };
  });
}
