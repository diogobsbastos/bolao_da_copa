import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";
import { PAGINA } from "./admin_page.js";

const SECRET_KEYS = new Set(["api_football_key", "odds_api_key", "football_data_token", "llm_key", "api_futebol_token", "newsdata_api_key"]);
const ALL_KEYS = ["api_football_base", "api_football_key", "odds_api_key", "football_data_token", "google_client_id", "api_futebol_token", "newsdata_api_key", "llm_base", "llm_model", "llm_key", "corte_grade"];

async function admOk(req: FastifyRequest): Promise<boolean> {
  const t = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (expected && t === expected) return true;
  const u = await usuarioDaReq(req);
  return u?.papel === "admin";
}

async function getConfig(): Promise<Record<string, string>> {
  const { rows } = await pool.query("SELECT chave, valor FROM config");
  const o: Record<string, string> = {};
  for (const r of rows as Array<{ chave: string; valor: string }>) o[r.chave] = r.valor;
  return o;
}

export async function rotasAdmin(app: FastifyInstance) {
  app.get("/admin", async (_req, reply) => reply.type("text/html").send(PAGINA));
  app.get("/admin/", async (_req, reply) => reply.type("text/html").send(PAGINA));

  app.get("/admin/config", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const c = await getConfig();
    const out: Record<string, unknown> = {};
    for (const k of ALL_KEYS) {
      if (SECRET_KEYS.has(k)) out[k + "_set"] = Boolean(c[k]);
      else out[k] = c[k] ?? "";
    }
    return out;
  });

  app.post("/admin/config", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const body = (req.body ?? {}) as Record<string, string>;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const k of ALL_KEYS) {
        const v = body[k];
        if (v === undefined) continue;
        if (v === "" && k !== "corte_grade") continue;
        await client.query(
          "INSERT INTO config (chave, valor) VALUES ($1,$2) ON CONFLICT (chave) DO UPDATE SET valor=$2, atualizado_em=now()",
          [k, v]
        );
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      req.log.error(e);
      return reply.code(500).send({ erro: "falha ao salvar" });
    } finally {
      client.release();
    }
    return { ok: true };
  });

  app.get("/admin/status", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    let db = false;
    try { await pool.query("SELECT 1"); db = true; } catch { db = false; }
    const c = await getConfig();
    return { db, jogos_fonte: Boolean(c["football_data_token"]), odds_api: Boolean(c["odds_api_key"]), llm: Boolean(c["llm_base"]) };
  });

  app.get("/admin/ping", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const alvo = (req.query as any)?.alvo as string;
    const c = await getConfig();
    try {
      if (alvo === "db") { await pool.query("SELECT 1"); return { ok: true, detalhe: "banco respondeu" }; }
      if (typeof fetch !== "function") return { ok: false, detalhe: "fetch indisponivel" };
      if (alvo === "jogos") {
        const tk = c["football_data_token"];
        if (!tk) return { ok: false, detalhe: "sem token" };
        const r = await fetch("https://api.football-data.org/v4/competitions/WC", { headers: { "X-Auth-Token": tk } });
        const j: any = await r.json().catch(() => ({}));
        return { ok: r.ok, detalhe: r.ok ? ("ok: " + (j?.name || "World Cup")) : (j?.message || ("http " + r.status)) };
      }
      if (alvo === "odds") {
        const k = c["odds_api_key"];
        if (!k) return { ok: false, detalhe: "sem chave" };
        const r = await fetch("https://api.the-odds-api.com/v4/sports?apiKey=" + encodeURIComponent(k));
        return { ok: r.ok, detalhe: r.ok ? "ok" : ("http " + r.status) };
      }
      if (alvo === "noticias") {
        const k = c["newsdata_api_key"];
        if (!k) return { ok: false, detalhe: "sem chave" };
        const r = await fetch("https://newsdata.io/api/1/latest?apikey=" + encodeURIComponent(k) + "&language=pt&q=futebol");
        const j: any = await r.json().catch(() => ({}));
        const n = Array.isArray(j?.results) ? j.results.length : 0;
        return { ok: r.ok && j?.status === "success", detalhe: r.ok ? ("status " + (j?.status || "?") + ", " + n + " noticias") : (j?.results?.message || ("http " + r.status)) };
      }
      return reply.code(400).send({ ok: false, detalhe: "alvo invalido" });
    } catch (e: any) {
      return { ok: false, detalhe: String(e?.message ?? e) };
    }
  });

  app.get("/admin/usuarios", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const { rows } = await pool.query(
      `SELECT u.id, u.email, COALESCE(u.nome,'') AS nome, u.papel,
              COALESCE(c.saldo_colecionador,0) AS col, COALESCE(c.saldo_apostas,0) AS apo, COALESCE(c.saldo_arena,0) AS are
         FROM usuarios u LEFT JOIN usuarios_carteiras c ON c.usuario_id = u.id
        ORDER BY u.id`
    );
    return rows;
  });

  app.get("/admin/ranking", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const { rows } = await pool.query(
      `SELECT COALESCE(u.nome, u.email) AS nome, r.pontos_bolao AS pb, r.pontos_arena AS pa
         FROM ranking r JOIN usuarios u ON u.id = r.usuario_id
        ORDER BY r.pontos_bolao DESC, r.pontos_arena DESC LIMIT 100`
    );
    return rows;
  });

  app.get("/admin/jogos", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const { rows } = await pool.query(
      `SELECT id, fase, rodada, selecao_casa AS casa, selecao_visitante AS visit,
              to_char(inicio, 'DD/MM HH24:MI') AS inicio, status,
              placar_casa AS pc, placar_visitante AS pv
         FROM jogos ORDER BY inicio LIMIT 300`
    );
    return rows;
  });

  app.post("/admin/jogos/importar", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const c = await getConfig();
    const token = c["football_data_token"];
    if (!token) return reply.code(400).send({ erro: "configure o token da football-data.org" });
    if (typeof fetch !== "function") return reply.code(500).send({ erro: "fetch indisponivel" });
    let data: any;
    try {
      data = await fetch("https://api.football-data.org/v4/competitions/WC/matches", { headers: { "X-Auth-Token": token } }).then((r) => r.json());
    } catch (e: any) {
      return reply.code(502).send({ erro: "falha ao chamar football-data.org", detalhe: String(e?.message ?? e) });
    }
    const arr: any[] = Array.isArray(data?.matches) ? data.matches : [];
    if (!arr.length) return reply.send({ importados: 0, total: 0 });
    let n = 0;
    for (const f of arr) {
      const stage: string = f?.stage || "";
      const fase = /group/i.test(stage) ? "grupos" : "mata-mata";
      const rodada = typeof f?.matchday === "number" ? f.matchday : null;
      const status = f?.status === "FINISHED" ? "encerrado" : "agendado";
      await pool.query(
        `INSERT INTO jogos (api_fixture_id, fase, rodada, selecao_casa, selecao_visitante, inicio, status, placar_casa, placar_visitante)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (api_fixture_id) DO UPDATE SET fase=$2, rodada=$3, selecao_casa=$4, selecao_visitante=$5, inicio=$6, status=$7, placar_casa=$8, placar_visitante=$9`,
        [f?.id, fase, rodada, f?.homeTeam?.name ?? "A definir", f?.awayTeam?.name ?? "A definir", f?.utcDate, status, f?.score?.fullTime?.home ?? null, f?.score?.fullTime?.away ?? null]
      );
      n++;
    }
    return { importados: n, total: arr.length };
  });
}
