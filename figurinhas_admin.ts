import { PAGINA } from "./figurinhas_admin_page.js";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { readdir, copyFile, readFile, writeFile, access, rm, stat, mkdir } from "node:fs/promises";
import { join, basename } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";

const pexec = promisify(execFile);
const APP = "/home/ubuntu/bolao-copa26";
const FIGDIR = join(APP, "figurinhas");

const MAP: Record<string, string> = {
  "AFRICA": "South Africa", "ALEMANHA": "Germany", "ARABIA": "Saudi Arabia", "ARGELIA": "Algeria",
  "ARGENTINA": "Argentina", "AUSTRALIA": "Australia", "AUSTRIA": "Austria", "BELGICA": "Belgium",
  "BOSNIA": "Bosnia-Herzegovina", "BRASIL": "Brazil", "CABO VERDE": "Cape Verde Islands", "CANADA": "Canada",
  "COLÔMBIA": "Colombia", "CONGO": "Congo DR", "CROACIA": "Croatia", "CURACAO": "Curaçao", "EGYTO": "Egypt",
  "EQUADOR": "Ecuador", "ESCOCIA": "Scotland", "ESPANHA": "Spain", "FRANÇA": "France", "GANA": "Ghana",
  "HAITI": "Haiti", "HOLANDA": "Netherlands", "INGLATERRA": "England", "IRAN": "Iran", "IRAQUE": "Iraq",
  "JAPAN": "Japan", "JORDANIA": "Jordan", "KOREA": "South Korea", "MARFIM": "Ivory Coast", "MARROCOS": "Morocco",
  "MÉXICO": "Mexico", "NORUEGA": "Norway", "NOVA ZELANDIA": "New Zealand", "PANAMA": "Panama", "PARAGUAI": "Paraguay",
  "PORTUGAL": "Portugal", "QATAR": "Qatar", "SENEGAL": "Senegal", "SUECIA": "Sweden", "SUICA": "Switzerland",
  "TCHEQUIA": "Czechia", "TUNISIA": "Tunisia", "TURQUIA": "Turkey", "URUGUAI": "Uruguay", "USA": "United States",
  "UZBEQUISTAO": "Uzbekistan",
};
const SEL2FOLDER: Record<string, string> = {};
for (const [folder, sel] of Object.entries(MAP)) SEL2FOLDER[sel] = folder;

const PT: Record<string, string> = {
  "South Africa": "África do Sul", "Germany": "Alemanha", "Saudi Arabia": "Arábia Saudita", "Algeria": "Argélia",
  "Argentina": "Argentina", "Australia": "Austrália", "Austria": "Áustria", "Belgium": "Bélgica",
  "Bosnia-Herzegovina": "Bósnia e Herzegovina", "Brazil": "Brasil", "Cape Verde Islands": "Cabo Verde", "Canada": "Canadá",
  "Colombia": "Colômbia", "Congo DR": "Congo (RD)", "Croatia": "Croácia", "Curaçao": "Curaçao", "Egypt": "Egito",
  "Ecuador": "Equador", "Scotland": "Escócia", "Spain": "Espanha", "France": "França", "Ghana": "Gana",
  "Haiti": "Haiti", "Netherlands": "Holanda", "England": "Inglaterra", "Iran": "Irã", "Iraq": "Iraque",
  "Japan": "Japão", "Jordan": "Jordânia", "South Korea": "Coreia do Sul", "Ivory Coast": "Costa do Marfim", "Morocco": "Marrocos",
  "Mexico": "México", "Norway": "Noruega", "New Zealand": "Nova Zelândia", "Panama": "Panamá", "Paraguay": "Paraguai",
  "Portugal": "Portugal", "Qatar": "Catar", "Senegal": "Senegal", "Sweden": "Suécia", "Switzerland": "Suíça",
  "Czechia": "Tchéquia", "Tunisia": "Tunísia", "Turkey": "Turquia", "Uruguay": "Uruguai", "United States": "Estados Unidos",
  "Uzbekistan": "Uzbequistão",
};
function selPt(s: string): string { return PT[s] || s; }

const ISO: Record<string, string> = {
  "South Africa": "za", "Germany": "de", "Saudi Arabia": "sa", "Algeria": "dz", "Argentina": "ar", "Australia": "au",
  "Austria": "at", "Belgium": "be", "Bosnia-Herzegovina": "ba", "Brazil": "br", "Cape Verde Islands": "cv", "Canada": "ca",
  "Colombia": "co", "Congo DR": "cd", "Croatia": "hr", "Curaçao": "cw", "Egypt": "eg", "Ecuador": "ec", "Scotland": "gb-sct",
  "Spain": "es", "France": "fr", "Ghana": "gh", "Haiti": "ht", "Netherlands": "nl", "England": "gb-eng", "Iran": "ir",
  "Iraq": "iq", "Japan": "jp", "Jordan": "jo", "South Korea": "kr", "Ivory Coast": "ci", "Morocco": "ma", "Mexico": "mx",
  "Norway": "no", "New Zealand": "nz", "Panama": "pa", "Paraguay": "py", "Portugal": "pt", "Qatar": "qa", "Senegal": "sn",
  "Sweden": "se", "Switzerland": "ch", "Czechia": "cz", "Tunisia": "tn", "Turkey": "tr", "Uruguay": "uy",
  "United States": "us", "Uzbekistan": "uz",
};
function flag(s: string): string { const c = ISO[s]; return c ? ("https://flagcdn.com/w160/" + c + ".png") : ""; }

const COR: Record<string, string> = {
  "South Africa": "#007749", "Germany": "#111111", "Saudi Arabia": "#1A7A3D", "Algeria": "#0A7B3E",
  "Argentina": "#5BA4D6", "Australia": "#0C8A42", "Austria": "#D32F2F", "Belgium": "#C8102E",
  "Bosnia-Herzegovina": "#1E4F9C", "Brazil": "#009C3B", "Cape Verde Islands": "#1A3C9C", "Canada": "#D52B1E",
  "Colombia": "#E8B500", "Congo DR": "#1E7FD6", "Croatia": "#D32F2F", "Curaçao": "#1E3FA0", "Egypt": "#C8102E",
  "Ecuador": "#E0B500", "Scotland": "#1166B5", "Spain": "#C60B1E", "France": "#1E50A2", "Ghana": "#1E7A3E",
  "Haiti": "#1E3FA0", "Netherlands": "#EA7200", "England": "#C8102E", "Iran": "#1E9F4A", "Iraq": "#1E8A4A",
  "Japan": "#BC002D", "Jordan": "#1E7A3E", "South Korea": "#1E50A2", "Ivory Coast": "#FF7A00", "Morocco": "#C1272D",
  "Mexico": "#1E7A45", "Norway": "#BA0C2F", "New Zealand": "#111111", "Panama": "#1E5FA8", "Paraguay": "#D52B1E",
  "Portugal": "#0A7A3E", "Qatar": "#8A1538", "Senegal": "#1E8A4A", "Sweden": "#2A6BB0", "Switzerland": "#D52B1E",
  "Czechia": "#1E4F84", "Tunisia": "#D32F2F", "Turkey": "#E30A17", "Uruguay": "#4AA3DE", "United States": "#3C3B6E",
  "Uzbekistan": "#1EB53A",
};
function cor(s: string): string { return COR[s] || "#4361ee"; }

const POS_PT: Record<string, string> = { "Goalkeeper": "Goleiro", "Defence": "Defensor", "Midfield": "Meia", "Offence": "Atacante" };
const POS_ORD: Record<string, number> = { "Goalkeeper": 0, "Defence": 1, "Midfield": 2, "Offence": 3 };
function posPt(p: string): string { return POS_PT[p] || p || ""; }

function normS(s: string): string { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
function bigrS(s: string): string[] { s = s.replace(/ /g, ""); const r: string[] = []; for (let i = 0; i < s.length - 1; i++) r.push(s.substr(i, 2)); return r; }
function diceS(a: string, b: string): number { if (!a || !b) return 0; if (a === b) return 1; const A = bigrS(a), B = bigrS(b); if (!A.length || !B.length) return 0; const used: Record<number, boolean> = {}; let m = 0; for (let i = 0; i < A.length; i++) { for (let j = 0; j < B.length; j++) { if (!used[j] && A[i] === B[j]) { used[j] = true; m++; break; } } } return 2 * m / (A.length + B.length); }
function scoreNome(a: string, b: string): number { const ka = normS(a), kb = normS(b); const full = diceS(ka.replace(/ /g, ""), kb.replace(/ /g, "")); const ta = ka.split(" ").filter((w) => w.length > 2), tb = kb.split(" ").filter((w) => w.length > 2); let tp = 0; for (const x of ta) for (const y of tb) { const d = diceS(x, y); if (d > tp) tp = d; } return Math.max(full, tp * 0.9); }

async function admOk(req: FastifyRequest): Promise<boolean> {
  const t = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (expected && t === expected) return true;
  const u = await usuarioDaReq(req);
  return u?.papel === "admin";
}
function fileOk(f: string): boolean { return /^[\w.\-() ]+\.png$/i.test(f); }

async function caminhoFig(folder: string, file: string): Promise<string> {
  const n = join(FIGDIR, folder, "norm", file);
  try { await access(n); return n; } catch { return join(FIGDIR, folder, file); }
}
async function lerJson(folder: string, name: string): Promise<Record<string, string>> {
  try { return JSON.parse(await readFile(join(FIGDIR, folder, name), "utf8")); } catch { return {}; }
}
async function versao(folder: string): Promise<number> {
  try { const s = await stat(join(FIGDIR, folder, "_tipo.json")); return Math.floor(s.mtimeMs); } catch { return 0; }
}
async function limparTime(sel: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE jogadores SET figurinha=NULL WHERE selecao=$1", [sel]);
    await client.query("DELETE FROM figurinhas WHERE tipo='jogador' AND selecao=$1", [sel]);
    await client.query("COMMIT");
  } catch { await client.query("ROLLBACK"); } finally { client.release(); }
}
async function prepDaPasta(folder: string): Promise<void> {
  let precisa = false;
  try { await access(join(FIGDIR, folder, "_ocr5.json")); } catch { precisa = true; }
  try { await access(join(FIGDIR, folder, "_tipo.json")); } catch { precisa = true; }
  if (precisa) {
    try { await pexec("python3", [join(APP, "prep_folder.py"), folder], { timeout: 175000, cwd: APP }); } catch { /* ignora */ }
  }
}

// casa as figurinhas (pelo nome) de uma selecao; preenche so os vazios. retorna quantas novas.
async function casarSelecao(sel: string): Promise<number> {
  const folder = SEL2FOLDER[sel];
  if (!folder) return 0;
  const ocrMap = await lerJson(folder, "_ocr5.json");
  const tipoMap = await lerJson(folder, "_tipo.json");
  const { rows: squad } = await pool.query("SELECT id, nome FROM jogadores WHERE selecao=$1", [sel]);
  const { rows: exist } = await pool.query("SELECT jogador_id, COALESCE(origem,'') AS origem FROM figurinhas WHERE tipo='jogador' AND selecao=$1", [sel]);
  const ocupados = new Set<number>((exist as any[]).map((e) => Number(e.jogador_id)));
  const usadosF = new Set<string>((exist as any[]).map((e) => e.origem).filter(Boolean));
  const livres = (squad as any[]).filter((s) => !ocupados.has(Number(s.id)));
  const cand: Array<{ score: number; file: string; jid: number }> = [];
  for (const [file, txt] of Object.entries(ocrMap)) {
    if (!txt || usadosF.has(file) || tipoMap[file] === "escudo" || tipoMap[file] === "time") continue;
    let best: any = null, bs = 0;
    for (const s of livres) { const sc = scoreNome(txt, s.nome); if (sc > bs) { bs = sc; best = s; } }
    if (best) cand.push({ score: bs, file, jid: best.id });
  }
  cand.sort((a, b) => b.score - a.score);
  const CUT = 0.6; const usedJ = new Set<number>(), usedF = new Set<string>();
  const matched: Array<{ file: string; jid: number }> = [];
  for (const c of cand) { if (c.score < CUT) break; if (usedJ.has(c.jid) || usedF.has(c.file)) continue; usedJ.add(c.jid); usedF.add(c.file); matched.push({ file: c.file, jid: c.jid }); }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const m of matched) {
      await copyFile(await caminhoFig(folder, m.file), join(FIGDIR, "cards", m.jid + ".png"));
      const imagem = "cards/" + m.jid + ".png";
      await client.query("UPDATE jogadores SET figurinha=$1 WHERE id=$2", [imagem, m.jid]);
      await client.query("DELETE FROM figurinhas WHERE jogador_id=$1 AND tipo='jogador'", [m.jid]);
      await client.query(`INSERT INTO figurinhas (tipo, selecao, nome, jogador_id, imagem, raridade, origem) SELECT 'jogador', selecao, nome, id, $1, 'comum', $2 FROM jogadores WHERE id=$3`, [imagem, m.file, m.jid]);
    }
    await client.query("COMMIT");
  } catch { await client.query("ROLLBACK"); } finally { client.release(); }
  return matched.length;
}

export async function rotasFigsAdmin(app: FastifyInstance) {
  app.get("/fig/raw/:folder/:file", async (req, reply) => {
    const p = req.params as { folder: string; file: string };
    const folder = p.folder; const file = basename(p.file);
    if (!(folder in MAP) || !fileOk(file)) return reply.code(400).send({ erro: "invalido" });
    try {
      const buf = await readFile(await caminhoFig(folder, file));
      return reply.header("cache-control", "public, max-age=86400").type("image/png").send(buf);
    } catch { return reply.code(404).send({ erro: "nao encontrada" }); }
  });

  app.get("/fig/orig/:folder/:file", async (req, reply) => {
    const p = req.params as { folder: string; file: string };
    const folder = p.folder; const file = basename(p.file);
    if (!(folder in MAP) || !fileOk(file)) return reply.code(400).send({ erro: "invalido" });
    try {
      const buf = await readFile(join(FIGDIR, folder, file));
      return reply.header("cache-control", "public, max-age=86400").type("image/png").send(buf);
    } catch { return reply.code(404).send({ erro: "nao encontrada" }); }
  });

  app.get("/admin/figs/selecoes", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const { rows } = await pool.query(
      `SELECT j.selecao, count(*)::int AS qtd,
              count(*) FILTER (WHERE f.raridade IS NOT NULL AND f.raridade <> 'gerada')::int AS reais
         FROM jogadores j LEFT JOIN figurinhas f ON f.jogador_id = j.id AND f.tipo='jogador'
        GROUP BY j.selecao`
    );
    const cnt: Record<string, { qtd: number; reais: number }> = {};
    for (const r of rows as any[]) cnt[r.selecao] = { qtd: r.qtd, reais: r.reais };
    const out = Object.keys(MAP).map((fo) => {
      const sel = MAP[fo]; const c = cnt[sel] || { qtd: 0, reais: 0 };
      return { selecao: sel, selecao_pt: selPt(sel), folder: fo, bandeira: flag(sel), cor: cor(sel), qtd: c.qtd, reais: c.reais };
    }).sort((a, b) => a.selecao_pt.localeCompare(b.selecao_pt, "pt"));
    return out;
  });

  app.get("/admin/figs/faltantes", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const { rows } = await pool.query(
      `SELECT j.selecao, j.nome, COALESCE(j.posicao,'') AS posicao, j.figurinha,
              COALESCE(f.raridade,'') AS raridade, COALESCE(f.origem,'') AS origem
         FROM jogadores j LEFT JOIN figurinhas f ON f.jogador_id = j.id AND f.tipo='jogador'
        WHERE NOT (j.figurinha IS NOT NULL AND j.figurinha <> '' AND f.raridade IS NOT NULL AND f.raridade <> '' AND f.raridade <> 'gerada')
        ORDER BY j.selecao, j.nome`
    );
    const out = (rows as any[]).map((j) => {
      let motivo = "indefinido";
      if (!j.figurinha || j.figurinha === "") motivo = "sem corte atribuido (nenhum tile casado pelo nome)";
      else if (!j.raridade || j.raridade === "gerada") motivo = "so base/placeholder, falta a figurinha real";
      const gk = /goleir|goalkeeper|^gk$/i.test(String(j.posicao));
      return { selecao_en: j.selecao, selecao: selPt(j.selecao), nome: j.nome, posicao: posPt(j.posicao), goleiro: gk, figurinha: j.figurinha || null, raridade: j.raridade || null, motivo };
    });
    return { ok: true, total: out.length, faltantes: out };
  });

  app.get("/admin/figs/dados", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const sel = String((req.query as any)?.selecao ?? "");
    const folder = SEL2FOLDER[sel];
    if (!folder) return reply.code(400).send({ erro: "selecao sem pasta" });
    await prepDaPasta(folder);
    let files: string[] = [];
    try { files = (await readdir(join(FIGDIR, folder))).filter((f) => /\.png$/i.test(f)).sort(); } catch { files = []; }
    const ocrMap = await lerJson(folder, "_ocr5.json");
    const tipoMap = await lerJson(folder, "_tipo.json");
    const v = await versao(folder);
    const { rows: jrows } = await pool.query(
      `SELECT j.id, j.nome, COALESCE(j.posicao,'') AS posicao, j.figurinha,
              COALESCE(f.raridade,'') AS raridade, COALESCE(f.origem,'') AS origem
         FROM jogadores j LEFT JOIN figurinhas f ON f.jogador_id = j.id AND f.tipo='jogador'
        WHERE j.selecao = $1`, [sel]
    );
    const usados: Record<string, { id: number; nome: string }> = {};
    let jogadores = (jrows as any[]).map((j) => {
      if (j.origem) usados[j.origem] = { id: j.id, nome: j.nome };
      const real = Boolean(j.figurinha) && j.raridade !== "" && j.raridade !== "gerada";
      return { id: j.id, nome: j.nome, posicao: j.posicao, posicao_pt: posPt(j.posicao), ordem: POS_ORD[j.posicao] ?? 9, figurinha: real ? j.figurinha : null, real };
    });
    jogadores.sort((a, b) => (a.ordem - b.ordem) || a.nome.localeCompare(b.nome, "pt"));
    const ef = encodeURIComponent(folder);
    let escudoFile: string | null = null, timeFile: string | null = null;
    for (const f of files) { const t = tipoMap[f]; if (t === "escudo" && !escudoFile) escudoFile = f; if (t === "time" && !timeFile) timeFile = f; }
    const raw = files.map((f) => {
      const u = usados[f];
      return {
        file: f, tipo: tipoMap[f] || "jogador",
        url: "/fig/raw/" + ef + "/" + encodeURIComponent(f) + "?v=" + v,
        jogador_id: u?.id ?? null, jogador_nome: u?.nome ?? null, ocr: (ocrMap[f] || ""),
      };
    });
    const escudo = escudoFile ? "/fig/raw/" + ef + "/" + encodeURIComponent(escudoFile) + "?v=" + v : null;
    const foto = timeFile ? "/fig/orig/" + ef + "/" + encodeURIComponent(timeFile) + "?v=" + v : null;
    const { rows: jogos } = await pool.query(
      `SELECT to_char(inicio,'DD/MM') AS data, selecao_casa AS casa, selecao_visitante AS visit,
              placar_casa AS pc, placar_visitante AS pv, status
         FROM jogos WHERE selecao_casa=$1 OR selecao_visitante=$1 ORDER BY inicio LIMIT 12`, [sel]
    );
    return { selecao: sel, selecao_pt: selPt(sel), folder, bandeira: flag(sel), cor: cor(sel), escudo, foto, jogos, v, raw, jogadores };
  });

  app.post("/admin/figs/marcar", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as { selecao?: string; file?: string; tipo?: string };
    const folder = SEL2FOLDER[String(b.selecao ?? "")];
    const file = basename(String(b.file ?? ""));
    const tipo = String(b.tipo ?? "");
    if (!folder || !fileOk(file) || !["jogador", "escudo", "time"].includes(tipo)) return reply.code(400).send({ erro: "parametros invalidos" });
    const tipoMap = await lerJson(folder, "_tipo.json");
    tipoMap[file] = tipo;
    await writeFile(join(FIGDIR, folder, "_tipo.json"), JSON.stringify(tipoMap), "utf8");
    return { ok: true };
  });

  app.post("/admin/figs/cortar", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as { selecao?: string; pdf_base64?: string };
    const sel = String(b.selecao ?? "");
    const folder = SEL2FOLDER[sel];
    if (!folder) return reply.code(400).send({ erro: "selecao invalida" });
    const b64 = String(b.pdf_base64 ?? "").replace(/^data:[^,]*,/, "");
    if (!b64) return reply.code(400).send({ erro: "sem pdf" });
    const dir = join(FIGDIR, folder);
    try { await mkdir(dir, { recursive: true }); } catch { /* */ }
    const pdfPath = join(dir, "album.pdf");
    try { await writeFile(pdfPath, Buffer.from(b64, "base64")); }
    catch (e: any) { return reply.code(500).send({ erro: "falha ao salvar pdf", detalhe: String(e?.message ?? e) }); }
    try {
      const { stdout } = await pexec("python3", [join(APP, "cortar_pdf.py"), pdfPath, folder], { timeout: 175000, cwd: APP });
      let r: any = {};
      try { r = JSON.parse((String(stdout).trim().split("\n").filter(Boolean).pop()) || "{}"); } catch { r = {}; }
      if (r.erro) return reply.code(500).send(r);
      await limparTime(sel);
      return { ok: true, ...r };
    } catch (e: any) {
      return reply.code(500).send({ erro: "falha no corte", detalhe: String(e?.message ?? e) });
    }
  });

  app.post("/admin/figs/atribuir", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as { jogador_id?: number; folder?: string; file?: string };
    const jid = Number(b.jogador_id); const folder = String(b.folder ?? ""); const file = basename(String(b.file ?? ""));
    if (!jid || !(folder in MAP) || !fileOk(file)) return reply.code(400).send({ erro: "parametros invalidos" });
    try { await copyFile(await caminhoFig(folder, file), join(FIGDIR, "cards", jid + ".png")); }
    catch (e: any) { return reply.code(500).send({ erro: "falha ao copiar", detalhe: String(e?.message ?? e) }); }
    const imagem = "cards/" + jid + ".png";
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("UPDATE jogadores SET figurinha=NULL WHERE id IN (SELECT jogador_id FROM figurinhas WHERE tipo='jogador' AND origem=$1 AND jogador_id<>$2 AND selecao=(SELECT selecao FROM jogadores WHERE id=$2))", [file, jid]);
      await client.query("DELETE FROM figurinhas WHERE tipo='jogador' AND origem=$1 AND jogador_id<>$2 AND selecao=(SELECT selecao FROM jogadores WHERE id=$2)", [file, jid]);
      await client.query("UPDATE jogadores SET figurinha=$1 WHERE id=$2", [imagem, jid]);
      await client.query("DELETE FROM figurinhas WHERE jogador_id=$1 AND tipo='jogador'", [jid]);
      await client.query(`INSERT INTO figurinhas (tipo, selecao, nome, jogador_id, imagem, raridade, origem) SELECT 'jogador', selecao, nome, id, $1, 'comum', $2 FROM jogadores WHERE id=$3`, [imagem, file, jid]);
      await client.query("COMMIT");
    } catch (e: any) { await client.query("ROLLBACK"); return reply.code(500).send({ erro: "falha no banco", detalhe: String(e?.message ?? e) }); }
    finally { client.release(); }
    return { ok: true, imagem };
  });

  app.post("/admin/figs/remover", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const jid = Number(((req.body ?? {}) as any).jogador_id);
    if (!jid) return reply.code(400).send({ erro: "parametros invalidos" });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("UPDATE jogadores SET figurinha=NULL WHERE id=$1", [jid]);
      await client.query("DELETE FROM figurinhas WHERE jogador_id=$1 AND tipo='jogador'", [jid]);
      await client.query("COMMIT");
    } catch (e: any) { await client.query("ROLLBACK"); return reply.code(500).send({ erro: "falha no banco", detalhe: String(e?.message ?? e) }); }
    finally { client.release(); }
    return { ok: true };
  });

  app.post("/admin/figs/auto", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const sel = String(((req.body ?? {}) as any).selecao ?? "");
    if (!SEL2FOLDER[sel]) return reply.code(400).send({ erro: "selecao invalida" });
    const novas = await casarSelecao(sel);
    const { rows: tot } = await pool.query("SELECT count(*)::int AS t FROM jogadores WHERE selecao=$1", [sel]);
    return { ok: true, novas, total: (tot as any[])[0]?.t ?? 0 };
  });

  app.post("/admin/figs/auto_todos", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    let total = 0; const detalhe: Record<string, number> = {};
    for (const sel of Object.values(MAP)) {
      try { const n = await casarSelecao(sel); total += n; detalhe[sel] = n; } catch { /* */ }
    }
    return { ok: true, total, times: Object.keys(detalhe).length };
  });

  app.post("/admin/figs/reocr", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const folder = SEL2FOLDER[String(((req.body ?? {}) as any).selecao ?? "")];
    if (!folder) return reply.code(400).send({ erro: "selecao invalida" });
    try { await pexec("python3", [join(APP, "prep_folder.py"), folder, "ocr"], { timeout: 175000, cwd: APP }); }
    catch (e: any) { return reply.code(500).send({ erro: "falha no OCR", detalhe: String(e?.message ?? e) }); }
    return { ok: true };
  });

  app.get("/admin/figurinhas", async (_req, reply) => reply.type("text/html").send(PAGINA));
}
