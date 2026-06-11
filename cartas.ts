import type { FastifyInstance, FastifyRequest } from "fastify";
import { readFile, writeFile, readdir, unlink, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";
import { registrarGasto } from "./custos.js";
import { PAGINA } from "./cartas_page.js";

const pexec = promisify(execFile);
const DIR = "/home/ubuntu/bolao-copa26/figurinhas";
const RAIZ = "/home/ubuntu/bolao-copa26";

// pasta (PT) -> palavra-chave do nome football-data (EN)
const ALIAS: Record<string, string> = {
  AFRICA: "south africa", ALEMANHA: "germany", ARABIA: "saudi", ARGELIA: "algeria",
  ARGENTINA: "argentina", AUSTRALIA: "australia", AUSTRIA: "austria", BELGICA: "belgium",
  BOSNIA: "bosnia", BRASIL: "brazil", CANADA: "canada", CONGO: "congo", CROACIA: "croatia",
  CURACAO: "cura", EGYTO: "egypt", EGITO: "egypt", EQUADOR: "ecuador", ESCOCIA: "scotland",
  ESPANHA: "spain", GANA: "ghana", HAITI: "haiti", HOLANDA: "netherlands", INGLATERRA: "england",
  IRAN: "iran", IRAQUE: "iraq", JAPAN: "japan", JAPAO: "japan", JORDANIA: "jordan", KOREA: "korea",
  COREIA: "korea", MARFIM: "ivoir", MARROCOS: "morocco", MBIA: "colombia", COLOMBIA: "colombia",
  NORUEGA: "norway", PANAMA: "panama", PARAGUAI: "paraguay", PORTUGAL: "portugal", QATAR: "qatar",
  SENEGAL: "senegal", SUECIA: "sweden", SUICA: "switz", TCHEQUIA: "czech", TUNISIA: "tunisia",
  TURQUIA: "turk", URUGUAI: "uruguay", USA: "united stat", UZBEQUISTAO: "uzbek", VERDE: "verde",
  XICO: "mexico", MEXICO: "mexico", ZELANDIA: "zealand",
};

async function admOk(req: FastifyRequest): Promise<boolean> {
  const t = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (expected && t === expected) return true;
  const u = await usuarioDaReq(req);
  return u?.papel === "admin";
}

const PROMPT_BASE = `Crie uma figurinha de colecionador profissional da Panini Copa do Mundo 2026, VERTICAL, com dimensoes e template IDENTICOS a imagem de referencia anexada.

MANTENHA INTEGRALMENTE o template do time da referencia (borda, numero "26", logo FIFA, coluna lateral com bandeira/sigla, logo Panini). NENHUMA alteracao nesses elementos.

SUBSTITUA o retrato central por uma SILHUETA CINZA SOLIDA de um jogador (cabeca e ombros, SEM rosto, SEM feicoes), preservando iluminacao/sombras/posicao, vestindo a MESMA camisa oficial da selecao.

ALTA DEFINICAO E NITIDEZ MAXIMA: alta resolucao, foco perfeito; escudo, marca esportiva e textura da camisa nitidos, sem desfoque.

NAS DUAS TARJAS INFERIORES: apague APENAS O TEXTO, mantendo as tarjas com a MESMA COR e formato, apenas VAZIAS. NAO pinte de preto, NAO coloque retangulos por cima, NAO mude a cor. NAO escreva nada.

Acabamento de colecionador, impressao profissional. Nao adicione bordas, textos ou elementos novos.`;

const ESTILO_DEF = { nome_caps: true, nome_bold: true, nome_cor: "#ffffff", nome_tam: 100, nome_dx: 0, nome_dy: 0, pos_caps: true, pos_bold: false, pos_cor: "#ffffff", pos_tam: 100, pos_dx: 0, pos_dy: 0 };
const ctam = (v: any) => { const n = Number(v); return Number.isFinite(n) ? Math.max(40, Math.min(220, Math.round(n))) : 100; };
const cdxy = (v: any) => { const n = Number(v); return Number.isFinite(n) ? Math.max(-40, Math.min(40, Math.round(n * 2) / 2)) : 0; };

const nomeArq = (tipo: string) => (tipo === "goleiro" ? "_base_goleiro.png" : "_base_jogador.png");
const slug = (s: string) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "").toUpperCase().slice(0, 40) || "JOGADOR";
const norm = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");

// Fabrica guarda bases/cartas numa SUBPASTA _fab (recortes do figurinhas_admin fazem readdir
// filtrando .png da RAIZ; subpasta nao aparece la).
const fabDir = (t: string) => join(DIR, t, "_fab");
const baseFab = (t: string, tipo: string) => join(fabDir(t), nomeArq(tipo));
const cartaArq = (nome: string) => "_carta_" + slug(nome) + ".png";
const cartaFab = (t: string, nome: string) => join(fabDir(t), cartaArq(nome));

// move pra _fab qualquer png que NAO seja tile de recorte (\d+.png): _base, _carta e tentativas locais.
async function migrarFab(time: string): Promise<void> {
  const root = join(DIR, time); const fab = fabDir(time);
  try { await mkdir(fab, { recursive: true }); } catch {}
  let fs: string[] = [];
  try { fs = await readdir(root); } catch { return; }
  for (const f of fs) {
    if (/\.png$/i.test(f) && !/^\d+\.png$/.test(f)) {
      try { const b = await readFile(join(root, f)); await writeFile(join(fab, f), b); await unlink(join(root, f)); } catch {}
    }
  }
}

function posPT(p: string): { txt: string; gk: boolean } {
  const s = String(p || "").toLowerCase();
  if (/goalkeeper|goleiro|keeper/.test(s)) return { txt: "Goleiro", gk: true };
  if (/defen|back|zagueiro|lateral/.test(s)) return { txt: "Defensor", gk: false };
  if (/midfield|meia|volante/.test(s)) return { txt: "Meia", gk: false };
  if (/offen|forward|wing|striker|atacante/.test(s)) return { txt: "Atacante", gk: false };
  return { txt: p ? String(p) : "Jogador", gk: false };
}

async function getCfg(chave: string, def = ""): Promise<string> {
  try { const { rows } = await pool.query("SELECT valor FROM config WHERE chave=$1", [chave]); return (rows as any[])[0]?.valor ?? def; } catch { return def; }
}
async function setCfg(chave: string, valor: string): Promise<void> {
  await pool.query("INSERT INTO config (chave, valor) VALUES ($1,$2) ON CONFLICT (chave) DO UPDATE SET valor=$2, atualizado_em=now()", [chave, valor]);
}
async function getEstilo(): Promise<any> {
  try { const v = await getCfg("estilo_carta"); if (v) return { ...ESTILO_DEF, ...JSON.parse(v) }; } catch {}
  return { ...ESTILO_DEF };
}
async function normalizarBase(time: string, tipo: string): Promise<void> {
  const p = baseFab(time, tipo);
  try { await pexec("python3", [join(RAIZ, "normalizar_base.py"), p, p], { timeout: 60000, maxBuffer: 8 * 1024 * 1024 }); } catch {}
}
async function provImagem(): Promise<any | null> {
  let { rows } = await pool.query("SELECT * FROM llm_provedores WHERE em_uso=true AND papel='imagem' ORDER BY id LIMIT 1");
  if (!rows.length || !(rows[0] as any).api_key) ({ rows } = await pool.query("SELECT * FROM llm_provedores WHERE papel='imagem' AND api_key<>'' ORDER BY id LIMIT 1"));
  if (!rows.length) ({ rows } = await pool.query("SELECT * FROM llm_provedores WHERE papel='imagem' ORDER BY id LIMIT 1"));
  return (rows as any[])[0] ?? null;
}
async function provImagemPara(fin: string): Promise<any | null> {
  try { const id = await getCfg("img_uso_" + fin); if (id) { const r: any = (await pool.query("SELECT * FROM llm_provedores WHERE id=$1", [Number(id)])).rows[0]; if (r && r.api_key) return r; } } catch {}
  return provImagem();
}
async function gerarImagemGemini(prov: any, prompt: string, refB64: string): Promise<{ b64: string }> {
  if (typeof fetch !== "function") throw new Error("fetch indisponivel");
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(prov.modelo) + ":generateContent?key=" + encodeURIComponent(prov.api_key);
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "image/png", data: refB64 } }] }] }) });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error?.message || ("http " + r.status));
  const parts: any[] = j?.candidates?.[0]?.content?.parts || [];
  for (const p of parts) { const d = p.inlineData || p.inline_data; if (d?.data) return { b64: d.data }; }
  throw new Error("o modelo nao retornou imagem");
}

async function gerarImagemNvidia(prov: any, prompt: string, refB64: string): Promise<{ b64: string }> {
  if (typeof fetch !== "function") throw new Error("fetch indisponivel");
  const url = "https://ai.api.nvidia.com/v1/genai/" + prov.modelo;
  const body: any = { prompt, cfg_scale: 3.5, width: 1024, height: 1024, seed: 0, steps: 50 };
  if (refB64) body.image = "data:image/png;base64," + refB64;
  const r = await fetch(url, { method: "POST", headers: { authorization: "Bearer " + (prov.api_key || ""), accept: "application/json", "content-type": "application/json" }, body: JSON.stringify(body) });
  const txt = await r.text();
  let j: any = null; try { j = JSON.parse(txt); } catch {}
  if (!r.ok) throw new Error("NVIDIA http " + r.status + ": " + txt.slice(0, 200));
  let b64 = "";
  if (j) { if (Array.isArray(j.artifacts) && j.artifacts[0]) b64 = j.artifacts[0].base64 || j.artifacts[0].b64_json || ""; else if (Array.isArray(j.data) && j.data[0]) b64 = j.data[0].b64_json || j.data[0].b64 || ""; else if (typeof j.image === "string") b64 = j.image; else if (typeof j.b64_json === "string") b64 = j.b64_json; }
  if (b64.indexOf("data:") === 0) b64 = b64.split(",").pop() as string;
  if (!b64) throw new Error("NVIDIA: resposta sem imagem (" + txt.slice(0, 160) + ")");
  return { b64 };
}
async function gerarImagem(prov: any, prompt: string, refB64: string): Promise<{ b64: string }> {
  const b = String(prov.base_url || "").toLowerCase();
  const mm = String(prov.modelo || "").toLowerCase();
  if (b.includes("nvidia") || mm.indexOf("black-forest") === 0 || mm.includes("flux")) return gerarImagemNvidia(prov, prompt, refB64);
  return gerarImagemGemini(prov, prompt, refB64);
}
async function tilesDoTime(time: string) {
  let tipo: any = {}, ocr: any = {}, arquivos: string[] = [];
  try { tipo = JSON.parse(await readFile(join(DIR, time, "_tipo.json"), "utf-8")); } catch {}
  try { ocr = JSON.parse(await readFile(join(DIR, time, "_ocr5.json"), "utf-8")); } catch {}
  try { arquivos = (await readdir(join(DIR, time))).filter((f) => /^\d+\.png$/.test(f)).sort(); } catch {}
  return arquivos.map((f) => ({ file: f, tipo: tipo[f] || "", nome: ocr[f] || "" }));
}
async function existe(p: string): Promise<boolean> { try { await readFile(p); return true; } catch { return false; } }

async function selecaoDoFolder(folder: string): Promise<{ selecao: string; selecoes: string[] }> {
  let selecoes: string[] = [];
  try { selecoes = (await pool.query("SELECT DISTINCT selecao FROM jogadores WHERE selecao IS NOT NULL AND selecao<>'' ORDER BY selecao")).rows.map((r: any) => r.selecao); } catch {}
  let sel = "";
  try {
    const r = await pool.query("SELECT selecao, count(*) c FROM jogadores WHERE figurinha ILIKE $1 GROUP BY selecao ORDER BY c DESC LIMIT 1", [folder + "%"]);
    sel = (r.rows[0] as any)?.selecao || "";
  } catch {}
  if (!sel) {
    const cands = [ALIAS[folder.toUpperCase()] || "", folder].filter(Boolean).map(norm);
    for (const k of cands) {
      const hit = selecoes.find((s) => norm(s) === k) || selecoes.find((s) => norm(s).includes(k)) || selecoes.find((s) => k.includes(norm(s)));
      if (hit) { sel = hit; break; }
    }
  }
  return { selecao: sel, selecoes };
}

async function comporUm(time: string, nome: string, posicao: string, gk: boolean, estilo?: any): Promise<{ ok: boolean; arq?: string; erro?: string }> {
  const tipo = gk ? "goleiro" : "jogador";
  const base = baseFab(time, tipo);
  if (!(await existe(base))) return { ok: false, erro: "sem molde " + tipo };
  const arq = cartaArq(nome);
  const out = cartaFab(time, nome);
  try {
    const cfg = { nome, posicao, ...(estilo || {}) };
    const { stdout } = await pexec("python3", [join(RAIZ, "compor_nome.py"), base, out, JSON.stringify(cfg)], { timeout: 60000, maxBuffer: 4 * 1024 * 1024 });
    const j: any = JSON.parse(String(stdout || "").trim().split("\n").pop() || "{}");
    if (!j.ok) return { ok: false, erro: j.erro || "falhou" };
    return { ok: true, arq };
  } catch (e: any) { return { ok: false, erro: String(e?.message ?? e).slice(0, 80) }; }
}

export async function rotasCartas(app: FastifyInstance) {
  app.get("/admin/cartas", async (_req, reply) => reply.header("cache-control", "no-store").type("text/html").send(PAGINA));

  app.get("/admin/cartas/prompt", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    return { prompt: (await getCfg("prompt_fig_base")) || PROMPT_BASE };
  });
  app.post("/admin/cartas/prompt", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const p = String(((req.body ?? {}) as any).prompt ?? "");
    if (p.trim()) await setCfg("prompt_fig_base", p);
    return { ok: true };
  });

  app.get("/admin/cartas/estilo", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    return { estilo: await getEstilo() };
  });
  app.post("/admin/cartas/estilo", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    const e = {
      nome_caps: !!b.nome_caps, nome_bold: !!b.nome_bold, nome_cor: String(b.nome_cor || "#ffffff").slice(0, 9), nome_tam: ctam(b.nome_tam), nome_dx: cdxy(b.nome_dx), nome_dy: cdxy(b.nome_dy),
      pos_caps: !!b.pos_caps, pos_bold: !!b.pos_bold, pos_cor: String(b.pos_cor || "#ffffff").slice(0, 9), pos_tam: ctam(b.pos_tam), pos_dx: cdxy(b.pos_dx), pos_dy: cdxy(b.pos_dy),
    };
    await setCfg("estilo_carta", JSON.stringify(e));
    return { ok: true, estilo: e };
  });

  app.get("/admin/cartas/times", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    let dirs: string[] = [];
    try { const ents = await readdir(DIR, { withFileTypes: true }); dirs = ents.filter((e) => e.isDirectory() && e.name !== "cards").map((e) => e.name).sort(); } catch {}
    return { times: dirs };
  });

  app.get("/admin/cartas/estado", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const time = String((req.query as any)?.time ?? "").trim();
    if (!time || time.includes("/") || time.includes("..")) return reply.code(400).send({ erro: "time invalido" });
    await migrarFab(time);
    const sel = String((req.query as any)?.selecao ?? "").trim();
    const m = await selecaoDoFolder(time);
    const selecao = sel || m.selecao;
    let jogadores: any[] = [];
    let geradas = 0;
    if (selecao) {
      try {
        const r = await pool.query(
          `SELECT j.nome, COALESCE(j.posicao,'') posicao
             FROM jogadores j
            WHERE j.selecao=$1 AND (j.figurinha IS NULL OR j.figurinha='')
            ORDER BY j.posicao, j.nome`, [selecao]);
        jogadores = (r.rows as any[]).map((x) => { const pp = posPT(x.posicao); return { nome: x.nome, posicao: pp.txt, gk: pp.gk }; });
      } catch {}
      try { for (const j of jogadores) { if (await existe(cartaFab(time, j.nome))) geradas++; } } catch {}
    }
    return {
      tiles: await tilesDoTime(time),
      tem_jogador: await existe(baseFab(time, "jogador")),
      tem_goleiro: await existe(baseFab(time, "goleiro")),
      selecao, detectada: m.selecao, selecoes: m.selecoes, jogadores, geradas,
    };
  });

  app.post("/admin/cartas/subir", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    const time = String(b.time ?? "").trim();
    const tipo = b.tipo === "goleiro" ? "goleiro" : "jogador";
    if (!time || time.includes("/") || time.includes("..")) return reply.code(400).send({ erro: "time invalido" });
    let data = String(b.imagem ?? ""); const i = data.indexOf("base64,"); if (i >= 0) data = data.slice(i + 7);
    if (!data) return reply.code(400).send({ erro: "sem imagem" });
    try {
      await mkdir(fabDir(time), { recursive: true });
      await writeFile(baseFab(time, tipo), Buffer.from(data, "base64"));
      await normalizarBase(time, tipo);
      return { ok: true, url: "/fig/cartabase/" + encodeURIComponent(time) + "/" + tipo + ".png?v=" + Date.now() };
    } catch (e: any) { return reply.code(500).send({ ok: false, erro: String(e?.message ?? e).slice(0, 160) }); }
  });

  app.post("/admin/cartas/apagar-base", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    const time = String(b.time ?? "").trim();
    const tipo = b.tipo === "goleiro" ? "goleiro" : "jogador";
    if (!time || time.includes("/") || time.includes("..")) return reply.code(400).send({ erro: "time invalido" });
    try { await unlink(baseFab(time, tipo)); return { ok: true }; }
    catch (e: any) { return reply.code(500).send({ ok: false, erro: String(e?.message ?? e).slice(0, 120) }); }
  });

  app.post("/admin/cartas/nano", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    const time = String(b.time ?? "").trim();
    const tipo = b.tipo === "goleiro" ? "goleiro" : "jogador";
    const ref = /^\d+\.png$/.test(String(b.ref)) ? String(b.ref) : (tipo === "goleiro" ? "02.png" : "08.png");
    if (!time || time.includes("/") || time.includes("..")) return reply.code(400).send({ erro: "time invalido" });
    const prov = await provImagemPara("molde");
    if (!prov) return reply.code(400).send({ erro: "configure o Motor de Imagem (Gemini ou NVIDIA FLUX)" });
    req.log.info("NANO_MOTOR id=" + (prov as any).id + " modelo=" + prov.modelo + " base=" + prov.base_url + " key=" + (prov.api_key ? "sim" : "VAZIA"));
    try {
      const refB64 = (await readFile(join(DIR, time, ref))).toString("base64");
      const prompt = (await getCfg("prompt_fig_base")) || PROMPT_BASE;
      const t0 = Date.now();
      const out = await gerarImagem(prov, prompt, refB64);
      await mkdir(fabDir(time), { recursive: true });
      await writeFile(baseFab(time, tipo), Buffer.from(out.b64, "base64"));
      await normalizarBase(time, tipo);
      await registrarGasto({ modelo: prov.modelo, imagens: 1, processo: "base_" + tipo + ":" + time, origem: "cartas", tempo: (Date.now() - t0) / 1000 });
      return { ok: true, url: "/fig/cartabase/" + encodeURIComponent(time) + "/" + tipo + ".png?v=" + Date.now(), ref };
    } catch (e: any) { return reply.code(502).send({ ok: false, erro: "[motor: " + prov.modelo + " | chave:" + (prov.api_key ? "sim" : "NAO") + "] " + String(e?.message ?? e).slice(0, 170) }); }
  });

  app.post("/admin/cartas/lote", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    const time = String(b.time ?? "").trim();
    const jogadores = Array.isArray(b.jogadores) ? b.jogadores : [];
    if (!time || time.includes("/") || time.includes("..")) return reply.code(400).send({ erro: "time invalido" });
    const estilo = await getEstilo();
    const resultados: any[] = [];
    for (const j of jogadores.slice(0, 60)) {
      const nome = String(j?.nome ?? "").trim();
      if (!nome) continue;
      const gk = !!j?.gk;
      const r = await comporUm(time, nome, String(j?.posicao ?? ""), gk, estilo);
      resultados.push({ nome, gk, ok: r.ok, erro: r.erro, url: r.ok ? ("/fig/cartafinal/" + encodeURIComponent(time) + "/" + r.arq + "?v=" + Date.now()) : "" });
    }
    return { ok: true, resultados, total: resultados.length, feitos: resultados.filter((x) => x.ok).length };
  });

  // Envia as cartas geradas do time pro plantel: atribuicao COMPLETA (marca jogadores.figurinha = REAL).
  app.post("/admin/cartas/enviar-escalacao", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    const time = String(b.time ?? "").trim();
    if (!time || time.includes("/") || time.includes("..")) return reply.code(400).send({ erro: "time invalido" });
    await migrarFab(time);
    const sel = String(b.selecao ?? "").trim() || (await selecaoDoFolder(time)).selecao;
    if (!sel) return reply.code(400).send({ erro: "elenco nao detectado" });
    let rows: any[] = [];
    try {
      rows = (await pool.query(
        "SELECT id, nome FROM jogadores WHERE selecao=$1 AND (figurinha IS NULL OR figurinha='') ORDER BY id", [sel])).rows as any[];
    } catch (e: any) { return reply.code(500).send({ ok: false, erro: String(e?.message ?? e).slice(0, 160) }); }
    let enviados = 0; const semCarta: string[] = [];
    for (const j of rows) {
      const src = cartaFab(time, j.nome);
      if (!(await existe(src))) { semCarta.push(j.nome); continue; }
      const img = "cards/" + j.id + ".png";
      try {
        await mkdir(join(DIR, "cards"), { recursive: true });
        await writeFile(join(DIR, "cards", j.id + ".png"), await readFile(src));
        await pool.query("DELETE FROM figurinhas WHERE jogador_id=$1 AND tipo='jogador'", [j.id]);
        await pool.query("UPDATE jogadores SET figurinha=$1 WHERE id=$2", [img, j.id]);
        await pool.query(
          "INSERT INTO figurinhas (tipo, selecao, nome, jogador_id, imagem, raridade, origem) SELECT 'jogador', selecao, nome, id, $1, 'evento', 'fabrica' FROM jogadores WHERE id=$2",
          [img, j.id]);
        enviados++;
      } catch {}
    }
    return { ok: true, enviados, sem_carta: semCarta, total: rows.length, selecao: sel };
  });

  app.get("/fig/cartabase/:time/:tipo", async (req, reply) => {
    const time = String((req.params as any).time || ""); const tipo = String((req.params as any).tipo || "").replace(/\.png$/i, "");
    if (time.includes("/") || time.includes("..")) return reply.code(400).send({ erro: "invalido" });
    try { const buf = await readFile(baseFab(time, tipo)); return reply.header("cache-control", "no-cache").type("image/png").send(buf); }
    catch { return reply.code(404).send({ erro: "sem base" }); }
  });
  app.get("/fig/cartafinal/:time/:arq", async (req, reply) => {
    const time = String((req.params as any).time || ""); const arq = String((req.params as any).arq || "");
    if (time.includes("/") || time.includes("..") || !/^_carta_[A-Z0-9_]+\.png$/.test(arq)) return reply.code(400).send({ erro: "invalido" });
    try { const buf = await readFile(join(fabDir(time), arq)); return reply.header("cache-control", "no-cache").type("image/png").send(buf); }
    catch { return reply.code(404).send({ erro: "nao encontrada" }); }
  });
}
