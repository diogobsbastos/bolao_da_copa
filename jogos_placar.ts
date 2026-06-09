import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";
import { chamarLLM } from "./llm.js";
import { PAGINA_JOGOS } from "./jogos_placar_page.js";
import { PAGINA_CLASS } from "./classificacao_page.js";

const TIMES: Record<string, { pt: string; iso: string }> = {
  "Algeria": { pt: "Argélia", iso: "dz" }, "Argentina": { pt: "Argentina", iso: "ar" },
  "Australia": { pt: "Austrália", iso: "au" }, "Austria": { pt: "Áustria", iso: "at" },
  "Belgium": { pt: "Bélgica", iso: "be" }, "Bosnia-Herzegovina": { pt: "Bósnia e Herzegovina", iso: "ba" },
  "Brazil": { pt: "Brasil", iso: "br" }, "Canada": { pt: "Canadá", iso: "ca" },
  "Cape Verde Islands": { pt: "Cabo Verde", iso: "cv" }, "Colombia": { pt: "Colômbia", iso: "co" },
  "Congo DR": { pt: "Congo (RD)", iso: "cd" }, "Croatia": { pt: "Croácia", iso: "hr" },
  "Curaçao": { pt: "Curaçao", iso: "cw" }, "Czechia": { pt: "Tchéquia", iso: "cz" },
  "Ecuador": { pt: "Equador", iso: "ec" }, "Egypt": { pt: "Egito", iso: "eg" },
  "England": { pt: "Inglaterra", iso: "gb-eng" }, "France": { pt: "França", iso: "fr" },
  "Germany": { pt: "Alemanha", iso: "de" }, "Ghana": { pt: "Gana", iso: "gh" },
  "Haiti": { pt: "Haiti", iso: "ht" }, "Iran": { pt: "Irã", iso: "ir" },
  "Iraq": { pt: "Iraque", iso: "iq" }, "Ivory Coast": { pt: "Costa do Marfim", iso: "ci" },
  "Japan": { pt: "Japão", iso: "jp" }, "Jordan": { pt: "Jordânia", iso: "jo" },
  "Mexico": { pt: "México", iso: "mx" }, "Morocco": { pt: "Marrocos", iso: "ma" },
  "Netherlands": { pt: "Holanda", iso: "nl" }, "New Zealand": { pt: "Nova Zelândia", iso: "nz" },
  "Norway": { pt: "Noruega", iso: "no" }, "Panama": { pt: "Panamá", iso: "pa" },
  "Paraguay": { pt: "Paraguai", iso: "py" }, "Portugal": { pt: "Portugal", iso: "pt" },
  "Qatar": { pt: "Catar", iso: "qa" }, "Saudi Arabia": { pt: "Arábia Saudita", iso: "sa" },
  "Scotland": { pt: "Escócia", iso: "gb-sct" }, "Senegal": { pt: "Senegal", iso: "sn" },
  "South Africa": { pt: "África do Sul", iso: "za" }, "South Korea": { pt: "Coreia do Sul", iso: "kr" },
  "Spain": { pt: "Espanha", iso: "es" }, "Sweden": { pt: "Suécia", iso: "se" },
  "Switzerland": { pt: "Suíça", iso: "ch" }, "Tunisia": { pt: "Tunísia", iso: "tn" },
  "Turkey": { pt: "Turquia", iso: "tr" }, "United States": { pt: "Estados Unidos", iso: "us" },
  "Uruguay": { pt: "Uruguai", iso: "uy" }, "Uzbekistan": { pt: "Uzbequistão", iso: "uz" },
};
function timePT(en: string) { return TIMES[en] || { pt: en || "?", iso: "" }; }

const FIFA_RANK: Record<string, number> = {
  "Argentina": 1, "Spain": 2, "France": 3, "England": 4, "Brazil": 5, "Portugal": 6, "Netherlands": 7,
  "Belgium": 8, "Germany": 9, "Croatia": 10, "Morocco": 11, "Colombia": 12, "Uruguay": 13, "United States": 14,
  "Switzerland": 15, "Japan": 16, "Senegal": 17, "Mexico": 18, "Iran": 19, "South Korea": 20, "Ecuador": 21,
  "Austria": 22, "Australia": 23, "Turkey": 24, "Sweden": 25, "Canada": 26, "Egypt": 27, "Norway": 28,
  "Panama": 29, "Scotland": 30, "Tunisia": 31, "Ivory Coast": 32, "Paraguay": 33, "Qatar": 34, "Saudi Arabia": 35,
  "Algeria": 36, "Ghana": 37, "Iraq": 38, "Cape Verde Islands": 39, "Jordan": 40, "South Africa": 41,
  "Uzbekistan": 42, "Bosnia-Herzegovina": 43, "Congo DR": 44, "Curaçao": 45, "Haiti": 46, "New Zealand": 47,
};
function rankOf(en: string): number { return FIFA_RANK[en] || 50; }

const norm = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
const ODDS_ALIAS: Record<string, string> = {
  usa: "United States", unitedstates: "United States", southkorea: "South Korea", korearepublic: "South Korea",
  czechrepublic: "Czechia", bosniaandherzegovina: "Bosnia-Herzegovina", ivorycoast: "Ivory Coast",
  cotedivoire: "Ivory Coast", drcongo: "Congo DR", congodr: "Congo DR", capeverde: "Cape Verde Islands", turkiye: "Turkey",
};
const TODOS = new Set(Object.keys(TIMES));
function matchEn(nome: string, validos: Set<string>): string | null {
  const n = norm(nome);
  if (ODDS_ALIAS[n] && validos.has(ODDS_ALIAS[n])) return ODDS_ALIAS[n];
  for (const en of validos) if (norm(en) === n) return en;
  for (const en of validos) { const ne = norm(en); if (ne.includes(n) || n.includes(ne)) return en; }
  return null;
}
function igual(a: string, en: string): boolean {
  const na = norm(a), ne = norm(en);
  return na === ne || ODDS_ALIAS[na] === en || (ODDS_ALIAS[ne] ? norm(ODDS_ALIAS[ne]) === na : false);
}

async function admOk(req: FastifyRequest): Promise<boolean> {
  const t = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (expected && t === expected) return true;
  const u = await usuarioDaReq(req);
  return u?.papel === "admin";
}
async function getCfg(chave: string): Promise<string> {
  try { const { rows } = await pool.query("SELECT valor FROM config WHERE chave=$1", [chave]); return (rows as any[])[0]?.valor ?? ""; } catch { return ""; }
}
async function setCfg(chave: string, valor: string): Promise<void> {
  try { await pool.query("INSERT INTO config (chave, valor) VALUES ($1,$2) ON CONFLICT (chave) DO UPDATE SET valor=$2, atualizado_em=now()", [chave, valor]); } catch {}
}

// Copa 2022 via StatsBomb Open Data (gratis, sem chave). comp 43 / season 106.
let CACHE2022: any[] | null = null;
async function copa2022(): Promise<any[]> {
  if (CACHE2022) return CACHE2022;
  try {
    const r = await fetch("https://raw.githubusercontent.com/statsbomb/open-data/master/data/matches/43/106.json");
    const j: any = await r.json().catch(() => []);
    const ms = Array.isArray(j) ? j : [];
    if (ms.length) CACHE2022 = ms;
    return ms;
  } catch { return []; }
}

// Noticias das selecoes (NewsData.io) — entram no prompt do palpite. Cache 12h por selecao.
type NewsItem = { title: string; link: string; fonte: string };
const CACHE_NEWS = new Map<string, { t: number; linhas: string[] }>();
async function newsRaw(nomePT: string): Promise<{ status: string; total: number; items: NewsItem[]; msg: string }> {
  const key = await getCfg("newsdata_api_key");
  if (!key) return { status: "sem-chave", total: 0, items: [], msg: "" };
  try {
    const url = "https://newsdata.io/api/1/latest?apikey=" + encodeURIComponent(key) + "&language=pt&category=sports&q=" + encodeURIComponent('"' + nomePT + '"');
    const r = await fetch(url);
    const j: any = await r.json().catch(() => ({}));
    const arr: any[] = Array.isArray(j?.results) ? j.results : [];
    const seen = new Set<string>(); const items: NewsItem[] = [];
    for (const a of arr) {
      const title = String(a?.title || "").trim(); if (!title) continue;
      const k = title.toLowerCase(); if (seen.has(k)) continue; seen.add(k);
      items.push({ title, link: String(a?.link || ""), fonte: String(a?.source_name || a?.source_id || "") });
      if (items.length >= 5) break;
    }
    const msg = (j?.results && !Array.isArray(j?.results)) ? String(j?.results?.message || "") : String(j?.message || "");
    return { status: String(j?.status || r.status), total: Number(j?.totalResults || arr.length), items, msg };
  } catch (e: any) { return { status: "erro", total: 0, items: [], msg: String(e?.message ?? e).slice(0, 120) }; }
}
async function noticiasTime(nomePT: string, en: string): Promise<string[]> {
  const c = CACHE_NEWS.get(en);
  if (c && Date.now() - c.t < 12 * 3600 * 1000) return c.linhas;
  const d = await newsRaw(nomePT);
  const linhas = d.items.map((i) => i.title).slice(0, 4);
  if (linhas.length) CACHE_NEWS.set(en, { t: Date.now(), linhas });
  return linhas;
}

async function oddsGet(path: string): Promise<{ data: any; rest: string | null }> {
  const key = await getCfg("odds_api_key");
  if (!key) throw new Error("odds_api_key nao configurada");
  const sep = path.indexOf("?") >= 0 ? "&" : "?";
  const r = await fetch("https://api.the-odds-api.com/v4" + path + sep + "apiKey=" + key);
  const data: any = await r.json().catch(() => ({}));
  if (r.status >= 400) throw new Error("Odds " + r.status + ": " + String(data?.message || JSON.stringify(data)).slice(0, 120));
  return { data, rest: r.headers.get("x-requests-remaining") };
}
async function wcSportKey(): Promise<string | null> {
  const c = await getCfg("odds_sport_wc"); if (c) return c;
  const { data } = await oddsGet("/sports?all=true");
  const lista: any[] = Array.isArray(data) ? data : [];
  const sp = lista.find((s) => /world[_ ]?cup/i.test(s?.key || "") && /soccer/i.test(s?.key || s?.group || ""))
    || lista.find((s) => /world cup/i.test(s?.title || "") && /soccer/i.test(s?.group || ""));
  if (sp?.key) { await setCfg("odds_sport_wc", sp.key); return sp.key; }
  return null;
}

// ===== PALPITE DA CASA (LLM com fallback por ranking) =====
function palpiteDet(rkC: number, rkV: number) {
  const d = rkV - rkC; const ad = Math.abs(d);
  let pc: number, pv: number, fav: string;
  if (ad < 4) { pc = 1; pv = 1; fav = "empate"; }
  else {
    const gf = Math.min(3, 1 + Math.round(ad / 12)), gc = Math.max(0, 1 - Math.round(ad / 22));
    if (d > 0) { pc = gf; pv = gc; fav = "casa"; } else { pc = gc; pv = gf; fav = "fora"; }
  }
  return { fav, pc, pv, conf: Math.min(85, 45 + ad), txt: "Por ranking FIFA (#" + rkC + " x #" + rkV + ")", fonte: "ranking" };
}
function parseBlocoJSON(s: string): any {
  try { const m = String(s).match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; } catch { return null; }
}
function jitter(pc: number, pv: number): [number, number] {
  const r = Math.random(); let a = pc, b = pv;
  if (r < 0.55) return [a, b];
  if (r < 0.8) a = Math.max(0, a + (Math.random() < 0.5 ? 1 : -1));
  else b = Math.max(0, b + (Math.random() < 0.5 ? 1 : -1));
  return [a, b];
}

const LET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
function mapaGrupos(rows: any[]): Map<string, string> {
  const adj = new Map<string, Set<string>>(); const primeiro = new Map<string, number>();
  const liga = (a: string, b: string) => { if (!adj.has(a)) adj.set(a, new Set()); adj.get(a)!.add(b); };
  for (const j of rows) {
    const a = j.selecao_casa, b = j.selecao_visitante; if (!a || !b || a === "A definir" || b === "A definir") continue;
    liga(a, b); liga(b, a);
    const t = j.inicio ? new Date(j.inicio).getTime() : Infinity;
    for (const x of [a, b]) if (!primeiro.has(x) || t < primeiro.get(x)!) primeiro.set(x, t);
  }
  const visto = new Set<string>(); const comps: string[][] = [];
  for (const t of adj.keys()) {
    if (visto.has(t)) continue;
    const comp: string[] = []; const pilha = [t];
    while (pilha.length) { const x = pilha.pop()!; if (visto.has(x)) continue; visto.add(x); comp.push(x); for (const n of adj.get(x) || []) if (!visto.has(n)) pilha.push(n); }
    comps.push(comp);
  }
  comps.sort((c1, c2) => Math.min(...c1.map((t) => primeiro.get(t) ?? Infinity)) - Math.min(...c2.map((t) => primeiro.get(t) ?? Infinity)));
  const mapa = new Map<string, string>();
  comps.forEach((comp, gi) => { const L = LET[gi] || String(gi + 1); for (const t of comp) mapa.set(t, L); });
  return mapa;
}
function calcClassificacao(rows: any[]) {
  const mapa = mapaGrupos(rows);
  const porGrupo: Record<string, Record<string, any>> = {};
  for (const [en, L] of mapa) { if (!porGrupo[L]) porGrupo[L] = {}; const p = timePT(en); porGrupo[L][en] = { en, pt: p.pt, iso: p.iso, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, p: 0 }; }
  for (const j of rows) {
    const a = j.selecao_casa, b = j.selecao_visitante; const L = mapa.get(a);
    if (!L || mapa.get(b) !== L) continue;
    if (j.placar_casa == null || j.placar_visitante == null) continue;
    const ga = j.placar_casa, gb = j.placar_visitante; const A = porGrupo[L][a], B = porGrupo[L][b];
    A.j++; B.j++; A.gp += ga; A.gc += gb; B.gp += gb; B.gc += ga;
    if (ga > gb) { A.v++; A.p += 3; B.d++; } else if (ga < gb) { B.v++; B.p += 3; A.d++; } else { A.e++; B.e++; A.p++; B.p++; }
  }
  return Object.keys(porGrupo).sort().map((L) => ({
    grupo: "Grupo " + L,
    times: Object.values(porGrupo[L]).map((x: any) => { x.sg = x.gp - x.gc; return x; })
      .sort((x: any, y: any) => y.p - x.p || y.sg - x.sg || y.gp - x.gp || x.pt.localeCompare(y.pt)),
  }));
}

function filtroEscopo(b: any, args: any[]): string {
  if (b?.escopo === "rodada" && b?.fase === "grupos" && b?.rodada) { args.push(Number(b.rodada)); return " AND fase='grupos' AND rodada=$" + args.length; }
  return "";
}

export async function rotasJogosPlacar(app: FastifyInstance) {
  app.get("/admin/jogos-placar", async (_req, reply) => reply.header("cache-control", "no-store").type("text/html").send(PAGINA_JOGOS));
  app.get("/admin/classificacao", async (_req, reply) => reply.header("cache-control", "no-store").type("text/html").send(PAGINA_CLASS));

  app.get("/admin/jogos-placar/dados", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    let rows: any[] = [];
    try {
      rows = (await pool.query(
        `SELECT id, fase, rodada, selecao_casa, selecao_visitante, inicio, status,
                placar_casa, placar_visitante, odds, palpite_ia FROM jogos ORDER BY inicio NULLS LAST, id`)).rows as any[];
    } catch (e: any) { return reply.code(500).send({ erro: String(e?.message ?? e).slice(0, 160) }); }
    const mapa = mapaGrupos(rows.filter((j) => j.fase === "grupos"));
    const jogos = rows.map((j) => {
      const c = timePT(j.selecao_casa), v = timePT(j.selecao_visitante);
      const grupo = j.fase === "grupos" ? (mapa.get(j.selecao_casa) || "") : "";
      return {
        id: j.id, fase: j.fase, rodada: j.rodada, status: j.status, inicio: j.inicio, grupo,
        casa: { en: j.selecao_casa, pt: c.pt, iso: c.iso }, visitante: { en: j.selecao_visitante, pt: v.pt, iso: v.iso },
        placar_casa: j.placar_casa, placar_visitante: j.placar_visitante, odds: j.odds || null, palpite: j.palpite_ia || null,
      };
    });
    return { jogos };
  });

  app.get("/admin/classificacao/dados", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    try {
      const rows = (await pool.query(
        `SELECT selecao_casa, selecao_visitante, inicio, placar_casa, placar_visitante
           FROM jogos WHERE fase='grupos' AND selecao_casa<>'A definir' AND selecao_visitante<>'A definir'`)).rows as any[];
      return { grupos: calcClassificacao(rows) };
    } catch (e: any) { return reply.code(500).send({ erro: String(e?.message ?? e).slice(0, 160) }); }
  });

  // Stats: ranking FIFA + desempenho na Copa 2022 (StatsBomb). Placar sempre do ponto de vista do time (meu x dele).
  app.get("/admin/jogos-placar/stats", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const en = String((req.query as any)?.en ?? "").trim();
    if (!en) return reply.code(400).send({ erro: "time?" });
    try {
      const ms = await copa2022();
      const ult = ms.filter((m) => igual(m?.home_team?.home_team_name || "", en) || igual(m?.away_team?.away_team_name || "", en))
        .sort((a, b) => String(a.match_date || "").localeCompare(String(b.match_date || "")))
        .map((m) => {
          const hn = m?.home_team?.home_team_name || "", an = m?.away_team?.away_team_name || "";
          const souCasa = igual(hn, en);
          const meu = souCasa ? m.home_score : m.away_score, dele = souCasa ? m.away_score : m.home_score;
          let res = "-"; if (meu != null && dele != null) res = meu > dele ? "V" : meu < dele ? "D" : "E";
          const advNome = souCasa ? an : hn; const advEn = matchEn(advNome, TODOS);
          const ap = advEn ? timePT(advEn) : { pt: advNome, iso: "" };
          return { data: m?.match_date || null, adversario: ap, placar: (meu ?? "-") + "x" + (dele ?? "-"), res, fase: m?.competition_stage?.name || "" };
        });
      const p = timePT(en);
      return { ok: true, time: { en, pt: p.pt, iso: p.iso }, ranking: FIFA_RANK[en] || null, ultimaCopa: ult, temFonte2022: ms.length > 0 };
    } catch (e: any) { return { ok: false, erro: String(e?.message ?? e).slice(0, 160) }; }
  });

  app.get("/admin/jogos-placar/noticias", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const en = String((req.query as any)?.en ?? "").trim();
    if (!en) return reply.code(400).send({ erro: "time?" });
    const p = timePT(en);
    const key = await getCfg("newsdata_api_key");
    if (!key) return { ok: true, semChave: true, noticias: [], time: { en, pt: p.pt, iso: p.iso } };
    const d = await newsRaw(p.pt);
    return { ok: true, noticias: d.items.slice(0, 3), time: { en, pt: p.pt, iso: p.iso }, debug: { status: d.status, total: d.total, msg: d.msg } };
  });

  // Gera o palpite da casa (LLM + noticias, fallback ranking) e grava em jogos.palpite_ia. Batch (custo so aqui).
  app.post("/admin/jogos-placar/gerar-palpites", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    const args: any[] = [];
    let q = "SELECT id, selecao_casa, selecao_visitante FROM jogos WHERE selecao_casa<>'A definir' AND selecao_visitante<>'A definir'";
    q += filtroEscopo(b, args);
    if (!b.refazer) q += " AND palpite_ia IS NULL";
    q += " ORDER BY inicio NULLS LAST, id";
    let jogos: any[] = [];
    try { jogos = (await pool.query(q, args)).rows as any[]; } catch (e: any) { return { ok: false, erro: String(e?.message ?? e).slice(0, 160) }; }
    let gerados = 0, viaIA = 0, viaRanking = 0, comNoticia = 0; let semLLM = false;
    for (const j of jogos) {
      const rkC = rankOf(j.selecao_casa), rkV = rankOf(j.selecao_visitante);
      const cP = timePT(j.selecao_casa).pt, vP = timePT(j.selecao_visitante).pt;
      let pal: any = null;
      if (!semLLM) {
        try {
          const nc = await noticiasTime(cP, j.selecao_casa), nv = await noticiasTime(vP, j.selecao_visitante);
          if (nc.length || nv.length) comNoticia++;
          const ctxNews = (nc.length || nv.length)
            ? (" Noticias recentes -> " + cP + ": " + (nc.join(" | ") || "sem destaque") + ". " + vP + ": " + (nv.join(" | ") || "sem destaque") + ".")
            : "";
          const prompt = "Voce e um analista de futebol. Jogo da Copa do Mundo 2026: " + cP + " (ranking FIFA #" + rkC + ") x " + vP +
            " (ranking FIFA #" + rkV + ")." + ctxNews + " Considerando a forca (ranking) e as noticias (lesoes, fase, escalacao), preveja o placar mais provavel. " +
            "Responda SOMENTE com JSON valido, sem texto extra: " +
            '{"favorito":"casa|fora|empate","placar_casa":N,"placar_visitante":N,"confianca":70,"resumo":"ate 12 palavras em pt-br"}';
          const txt = await chamarLLM(prompt, "texto", { origem: "jogos", processo: "palpite_jogo" });
          const o = parseBlocoJSON(txt);
          if (o && o.placar_casa != null && o.placar_visitante != null) {
            pal = {
              fav: String(o.favorito || "").toLowerCase() || "-",
              pc: Math.max(0, Math.min(9, Math.round(+o.placar_casa))),
              pv: Math.max(0, Math.min(9, Math.round(+o.placar_visitante))),
              conf: Math.max(0, Math.min(100, Math.round(+o.confianca || 50))),
              txt: String(o.resumo || "").slice(0, 90), fonte: (nc.length || nv.length) ? "ia+news" : "ia",
            };
            viaIA++;
          }
        } catch (e: any) { if (/nenhuma LLM/i.test(String(e?.message ?? e))) semLLM = true; }
      }
      if (!pal) { pal = palpiteDet(rkC, rkV); viaRanking++; }
      pal.em = new Date().toISOString();
      await pool.query("UPDATE jogos SET palpite_ia=$1 WHERE id=$2", [JSON.stringify(pal), j.id]);
      gerados++;
    }
    return { ok: true, gerados, viaIA, viaRanking, comNoticia, semLLM };
  });

  // Le palpite_ia do banco e preenche o placar com randomico leve. NAO recalcula nada.
  app.post("/admin/jogos-placar/auto-palpite", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    const args: any[] = [];
    let q = "SELECT id, palpite_ia FROM jogos WHERE selecao_casa<>'A definir' AND palpite_ia IS NOT NULL";
    q += filtroEscopo(b, args);
    let jogos: any[] = [];
    try { jogos = (await pool.query(q, args)).rows as any[]; } catch (e: any) { return { ok: false, erro: String(e?.message ?? e).slice(0, 160) }; }
    let preenchidos = 0;
    for (const j of jogos) {
      const p = j.palpite_ia; if (!p) continue;
      const [pc, pv] = jitter(Number(p.pc) || 0, Number(p.pv) || 0);
      await pool.query("UPDATE jogos SET placar_casa=$1, placar_visitante=$2, status='encerrado' WHERE id=$3", [pc, pv, j.id]);
      preenchidos++;
    }
    return { ok: true, preenchidos, semPalpite: jogos.length === 0 };
  });

  app.post("/admin/jogos-placar/auto", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    try {
      const wk = await wcSportKey();
      if (!wk) return { ok: false, erro: "Copa nao encontrada na The-Odds-API (mercado ainda nao aberto)" };
      const { data, rest } = await oddsGet("/sports/" + wk + "/odds?regions=eu&markets=h2h&oddsFormat=decimal");
      const eventos: any[] = Array.isArray(data) ? data : [];
      if (!eventos.length) return { ok: true, atualizados: 0, eventos: 0, restantes: rest };
      const args: any[] = [];
      let q = "SELECT id, selecao_casa, selecao_visitante FROM jogos WHERE selecao_casa<>'A definir'";
      q += filtroEscopo(b, args);
      const jogos = (await pool.query(q, args)).rows as any[];
      const validos = new Set<string>(); for (const j of jogos) { validos.add(j.selecao_casa); validos.add(j.selecao_visitante); }
      let atualizados = 0;
      for (const ev of eventos) {
        const ch = matchEn(ev?.home_team || "", validos), cv = matchEn(ev?.away_team || "", validos);
        if (!ch || !cv) continue;
        const bk = (ev?.bookmakers || [])[0]; const mk = (bk?.markets || []).find((m: any) => m?.key === "h2h");
        if (!mk) continue;
        const out = mk.outcomes || [];
        const oc = (nome: string) => out.find((o: any) => o?.name === nome)?.price ?? null;
        const odds = { casa: oc(ev.home_team), empate: oc("Draw"), fora: oc(ev.away_team), casas: (ev?.bookmakers || []).length, fonte: bk?.title || "mercado", em: new Date().toISOString() };
        const jg = jogos.find((j) => (j.selecao_casa === ch && j.selecao_visitante === cv) || (j.selecao_casa === cv && j.selecao_visitante === ch));
        if (!jg) continue;
        await pool.query("UPDATE jogos SET odds=$1 WHERE id=$2", [JSON.stringify(odds), jg.id]); atualizados++;
      }
      return { ok: true, atualizados, eventos: eventos.length, restantes: rest };
    } catch (e: any) { return { ok: false, erro: String(e?.message ?? e).slice(0, 200) }; }
  });

  app.post("/admin/jogos-placar/placar", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    const id = Number(b.id);
    if (!Number.isFinite(id)) return reply.code(400).send({ erro: "id invalido" });
    const pc = b.placar_casa === "" || b.placar_casa == null ? null : Number(b.placar_casa);
    const pv = b.placar_visitante === "" || b.placar_visitante == null ? null : Number(b.placar_visitante);
    if ((pc != null && (!Number.isInteger(pc) || pc < 0 || pc > 99)) || (pv != null && (!Number.isInteger(pv) || pv < 0 || pv > 99)))
      return reply.code(400).send({ erro: "placar invalido" });
    const status = pc != null && pv != null ? "encerrado" : "agendado";
    try {
      await pool.query("UPDATE jogos SET placar_casa=$1, placar_visitante=$2, status=$3 WHERE id=$4", [pc, pv, status, id]);
      return { ok: true, status };
    } catch (e: any) { return reply.code(500).send({ ok: false, erro: String(e?.message ?? e).slice(0, 160) }); }
  });
}
