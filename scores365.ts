import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";

const S365 = "https://webws.365scores.com/web";
const COMP = 5930; // FIFA World Cup 2026
const HDRS = { "accept": "application/json", "user-agent": "Mozilla/5.0", "accept-language": "en" };

const norm = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
// mapeia o nome do 365scores (normalizado) -> forma normalizada do NOSSO nome em ingles
const ALIAS: Record<string, string> = {
  usa: "unitedstates", drcongo: "congodr", capeverde: "capeverdeislands", turkiye: "turkey",
  cotedivoire: "ivorycoast", korearepublic: "southkorea", czechrepublic: "czechia",
};
const al = (n: string) => ALIAS[norm(n)] || norm(n);

async function cfg(k: string): Promise<string> { try { const { rows } = await pool.query("SELECT valor FROM config WHERE chave=$1", [k]); return (rows as any[])[0]?.valor ?? ""; } catch { return ""; } }
async function setCfg(k: string, v: string): Promise<void> { try { await pool.query("INSERT INTO config (chave,valor) VALUES ($1,$2) ON CONFLICT (chave) DO UPDATE SET valor=$2, atualizado_em=now()", [k, v]); } catch {} }
async function admOk(req: FastifyRequest): Promise<boolean> { const t = req.headers["x-admin-token"]; const e = process.env.ADMIN_TOKEN ?? ""; if (e && t === e) return true; const u = await usuarioDaReq(req); return u?.papel === "admin"; }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function s365(path: string): Promise<any> {
  const r = await fetch(S365 + path, { headers: HDRS });
  return await r.json().catch(() => ({}));
}
function slug365(x: any): string { return String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
function game365Url(g: any): string {
  const h = g?.homeCompetitor, a = g?.awayCompetitor; const comp = g?.competitionId, gid = g?.id;
  const hn = h?.nameForURL, an = a?.nameForURL; const cs = String(comp) === "5930" ? "fifa-world-cup" : slug365(g?.competitionDisplayName);
  if (hn && an && h?.id && a?.id && comp && gid) {
    return "https://www.365scores.com/pt-br/football/match/" + cs + "-" + comp + "/" + hn + "-" + an + "-" + a.id + "-" + h.id + "-" + comp + "#id=" + gid;
  }
  return "https://www.365scores.com/pt-br/football/match/g-" + (gid || "") + "#id=" + (gid || "");
}
function odds1x2(g: any): any {
  const bo = Array.isArray(g?.bestOdds) ? g.bestOdds : [];
  const line = bo.find((x: any) => x?.lineTypeId === 1);
  if (!line || !Array.isArray(line.options)) return null;
  const dec = (nm: string) => { const o = line.options.find((o: any) => String(o?.name) === nm); return o?.rate?.decimal ?? null; };
  const casa = dec("1"), empate = dec("X"), fora = dec("2");
  if (casa == null && empate == null && fora == null) return null;
  return { casa, empate, fora, fonte: "mercado (365scores)", gid: g?.id || null, url: game365Url(g), em: new Date().toISOString() };
}

export async function syncOdds(): Promise<any> {
  const data = await s365(`/games/fixtures/?appTypeId=5&langId=1&timezoneName=America/Sao_Paulo&userCountryId=21&competitions=${COMP}&startDate=11/06/2026&endDate=19/07/2026`);
  const games: any[] = Array.isArray(data?.games) ? data.games : (Array.isArray(data?.fixtures) ? data.fixtures : []);
  const meus = (await pool.query("SELECT id, selecao_casa, selecao_visitante, status FROM jogos WHERE selecao_casa<>'A definir' AND selecao_visitante<>'A definir'")).rows as any[];
  const byKey = new Map<string, any>();
  for (const m of meus) byKey.set(norm(m.selecao_casa) + "|" + norm(m.selecao_visitante), m);
  const matched: { jogoId: number; gameId: number; invert: boolean }[] = [];
  for (const g of games) {
    const h = al(g?.homeCompetitor?.name || ""), a = al(g?.awayCompetitor?.name || "");
    let m = byKey.get(h + "|" + a); let invert = false;
    if (!m) { m = byKey.get(a + "|" + h); invert = !!m; }
    if (m && g?.id) matched.push({ jogoId: m.id, gameId: g.id, invert });
  }
  let comOdds = 0, comGame = 0; const sample: any[] = [];
  for (const it of matched) {
    try {
      const gj = await s365(`/game?appTypeId=5&langId=1&userCountryId=21&timezoneName=America/Sao_Paulo&gameId=${it.gameId}`);
      if (gj?.game) comGame++;
      const od = odds1x2(gj?.game);
      if (sample.length < 3) sample.push({ gameId: it.gameId, temGame: !!gj?.game, temOdds: !!od });
      if (od) { const odd = it.invert ? { ...od, casa: od.fora, fora: od.casa } : od; await pool.query("UPDATE jogos SET odds=$1 WHERE id=$2", [JSON.stringify(odd), it.jogoId]); comOdds++; }
    } catch {}
    await sleep(120);
  }
  const status = { em: new Date().toISOString(), jogos365: games.length, casados: matched.length, comGame, comOdds, sample };
  await setCfg("scores365_status", JSON.stringify(status));
  return status;
}
export async function syncOddsSeFlag(): Promise<void> { try { if ((await cfg("scores365_sync")) !== "go") return; await syncOdds(); await setCfg("scores365_sync", ""); } catch {} }

// ===== ESCALAÇÃO (lineup) via 365scores — grátis, sem IA =====
// Estrutura: game.homeCompetitor.lineups / awayCompetitor.lineups -> { formation, isProbable, status, members[] }.
// members[]: status==1 = titular (11). Cada um: id (cruza com game.members[].id p/ nome), formation.shortName (posição),
// yardFormation {x,y} (coordenadas do campo, guardadas p/ campo visual futuro).
function parseSide(comp: any, byId: Map<number, any>): { formacao: string; confirmada: boolean; titulares: any[] } | null {
  const lu = comp?.lineups;
  const ms: any[] = Array.isArray(lu?.members) ? lu.members : [];
  const tit = ms.filter((m: any) => Number(m?.status) === 1);
  if (!lu || !tit.length) return null;
  const titulares = tit.map((m: any) => {
    const gm = byId.get(Number(m?.id)) || {};
    const yf = m?.yardFormation || m?.position || {};
    return {
      nome: String(gm?.name || m?.name || ""),
      posicao: String(m?.formation?.shortName || m?.position?.name || m?.position?.shortName || ""),
      x: (yf?.x ?? null), y: (yf?.y ?? null),
    };
  });
  return { formacao: String(lu?.formation || ""), confirmada: !lu?.isProbable, titulares };
}

// Busca 1x o jogo e devolve os DOIS lados parseados + nomes (1 fetch por jogo).
export async function lineupsDoJogo(gid: string | number): Promise<{ home: { name: string; lineup: any }; away: { name: string; lineup: any } } | null> {
  const gj = await s365(`/game?appTypeId=5&langId=1&userCountryId=21&timezoneName=America/Sao_Paulo&gameId=${gid}`);
  const g = gj?.game;
  if (!g) return null;
  const byId = new Map<number, any>();
  for (const m of (Array.isArray(g?.members) ? g.members : [])) byId.set(Number(m?.id), m);
  return {
    home: { name: String(g?.homeCompetitor?.name || ""), lineup: parseSide(g?.homeCompetitor, byId) },
    away: { name: String(g?.awayCompetitor?.name || ""), lineup: parseSide(g?.awayCompetitor, byId) },
  };
}
function casaLado(alvo: string, nome: string): boolean { const a = al(nome); return a === alvo || (!!a && (a.includes(alvo) || alvo.includes(a))); }

// Pega a escalação do lado (home/away) que casa com o nosso nome em inglês (enNome). null = não divulgada / não achou.
export async function escalacao365(gid: string | number, enNome: string): Promise<{ formacao: string; confirmada: boolean; titulares: any[] } | null> {
  const x = await lineupsDoJogo(gid);
  if (!x) return null;
  const alvo = al(enNome);
  if (casaLado(alvo, x.home.name)) return x.home.lineup;
  if (casaLado(alvo, x.away.name)) return x.away.lineup;
  return null;
}

// Puxa a escalação de TODOS os jogos com gid e GRAVA no banco (jogos.lineup_casa/visitante/lineup_em). 1 fetch por jogo.
export async function syncLineups(): Promise<any> {
  const jogos = (await pool.query("SELECT id, odds->>'gid' AS gid FROM jogos WHERE odds->>'gid' IS NOT NULL ORDER BY inicio NULLS LAST")).rows as any[];
  let ok = 0, comLineup = 0;
  for (const j of jogos) {
    try {
      const x = await lineupsDoJogo(j.gid);
      if (x) {
        ok++;
        const lc = x.home.lineup ? JSON.stringify(x.home.lineup) : null;
        const lv = x.away.lineup ? JSON.stringify(x.away.lineup) : null;
        if (lc || lv) comLineup++;
        await pool.query("UPDATE jogos SET lineup_casa=$1, lineup_visitante=$2, lineup_em=now() WHERE id=$3", [lc, lv, j.id]);
      }
    } catch {}
    await sleep(150);
  }
  const status = { em: new Date().toISOString(), jogos: jogos.length, ok, comLineup };
  await setCfg("lineups_status", JSON.stringify(status));
  return status;
}

// Refresh diário (guardado por data America/Sao_Paulo): puxa odds + lineups 1x/dia. Tudo grava no banco; jogadores só leem.
function hojeSP(): string { return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }); }
function extrai365(g: any): any {
  const comp = (c: any) => ({ nome: c?.name || "", cid: c?.id ?? null, score: c?.score ?? null, recentIds: Array.isArray(c?.recentMatches) ? c.recentMatches.slice(0, 8) : [], rankings: c?.rankings ?? null });
  const pl = (p: any) => p ? { nome: p.name, posicao: p.positionName || p.positionShortName || "", stats: (Array.isArray(p.stats) ? p.stats : []).map((s: any) => ({ nome: s.name, valor: s.value })) } : null;
  const craques = (Array.isArray(g?.topPerformers?.categories) ? g.topPerformers.categories : []).map((c: any) => ({ categoria: c.name, casa: pl(c.homePlayer), visitante: pl(c.awayPlayer) }));
  return {
    venue: g?.venue ? { nome: g.venue.name, capacidade: g.venue.capacity } : null,
    grupo: g?.groupName || "", rodada: g?.roundName || "", competicao: g?.competitionDisplayName || "",
    tv: Array.isArray(g?.tvNetworks) ? g.tvNetworks.map((t: any) => t?.name).filter(Boolean) : [],
    casa: comp(g?.homeCompetitor), visitante: comp(g?.awayCompetitor), craques,
    colhidoEm: new Date().toISOString(),
  };
}
function numScore(x: any): number | null { const n = Number(x); return (Number.isFinite(n) && n >= 0) ? n : null; }
async function resolveJogo365(id: number, cache: Map<number, any>): Promise<any> {
  if (cache.has(id)) return cache.get(id);
  let v: any = null;
  try {
    const gj = await s365(`/game?appTypeId=5&langId=1&userCountryId=21&timezoneName=America/Sao_Paulo&gameId=${id}`);
    const g = gj?.game;
    if (g) v = { homeId: g.homeCompetitor?.id, homeName: g.homeCompetitor?.name, homeScore: numScore(g.homeCompetitor?.score), awayId: g.awayCompetitor?.id, awayName: g.awayCompetitor?.name, awayScore: numScore(g.awayCompetitor?.score), data: g.startTime || null };
  } catch {}
  cache.set(id, v); await sleep(120); return v;
}
async function ultimas5(teamId: number, recentIds: number[], cache: Map<number, any>): Promise<any[]> {
  const out: any[] = [];
  for (const rid of (recentIds || [])) {
    if (out.length >= 5) break;
    const rg = await resolveJogo365(Number(rid), cache);
    if (!rg) continue;
    let adv = "", gp: number | null = null, gc: number | null = null;
    if (rg.homeId === teamId) { adv = rg.awayName; gp = rg.homeScore; gc = rg.awayScore; }
    else if (rg.awayId === teamId) { adv = rg.homeName; gp = rg.awayScore; gc = rg.homeScore; }
    else continue;
    if (gp == null || gc == null) continue;
    out.push({ adversario: adv, gp, gc, res: gp > gc ? "V" : (gp < gc ? "D" : "E"), data: rg.data });
  }
  return out;
}
function golsLideres(r: any, hcCty: any, acCty: any): any[] {
  const a = r?.stats?.athletesStats; if (!Array.isArray(a)) return [];
  const gols = a.find((x: any) => /goal/i.test(x?.name || "")) || a[0];
  const rows = Array.isArray(gols?.rows) ? gols.rows : [];
  return rows.slice(0, 8).map((row: any) => { const cty = row?.entity?.countryId; return { nome: row?.entity?.name, lado: (cty === hcCty ? "casa" : (cty === acCty ? "visitante" : "")), gols: (row?.stats || []).find((s: any) => s?.typeId === 1)?.value ?? null, pos: row?.entity?.positionName || "" }; });
}
export async function coletarDados365(): Promise<any> {
  try { const st = await s365(`/standings/?appTypeId=5&langId=1&competitions=${COMP}&live=false`); if (st?.standings) await setCfg("standings365", JSON.stringify(st.standings)); } catch {}
  const jogos = (await pool.query("SELECT id, odds->>'gid' gid FROM jogos WHERE odds->>'gid' IS NOT NULL")).rows as any[];
  const cache = new Map<number, any>();
  let n = 0;
  for (const j of jogos) {
    try {
      const gj = await s365(`/game?appTypeId=5&langId=1&userCountryId=21&timezoneName=America/Sao_Paulo&gameId=${j.gid}`);
      const g = gj?.game; if (!g) continue;
      const base: any = extrai365(g);
      const hcId = g.homeCompetitor?.id, acId = g.awayCompetitor?.id;
      try { const r = await s365(`/stats/?appTypeId=5&langId=1&competitors=${hcId},${acId}&games=${j.gid}`); base.golsLideres = golsLideres(r, g.homeCompetitor?.countryId, g.awayCompetitor?.countryId); } catch {}
      base.casa.ultimas5 = await ultimas5(hcId, base.casa.recentIds, cache);
      base.visitante.ultimas5 = await ultimas5(acId, base.visitante.recentIds, cache);
      await pool.query("UPDATE jogos SET dados365=$1 WHERE id=$2", [JSON.stringify(base), j.id]); n++;
    } catch {}
    await sleep(120);
  }
  await setCfg("dados365_em", new Date().toISOString());
  console.log("[coletar365]", n, "jogos com dados365 (com ultimas5 + golsLideres)");
  return { ok: true, jogos: n };
}

export async function coletarSeFlag(): Promise<void> { try { if ((await cfg("coletar365")) !== "go") return; await setCfg("coletar365", ""); await coletarDados365(); } catch {} }

export async function refreshDiario(force = false): Promise<any> {
  const hoje = hojeSP();
  if (!force && (await cfg("last_daily_refresh")) === hoje) return { skip: true, hoje };
  const odds = await syncOdds().catch((e: any) => ({ erro: String(e?.message ?? e) }));
  const lineups = await syncLineups().catch((e: any) => ({ erro: String(e?.message ?? e) }));
  const dados = await coletarDados365().catch((e: any) => ({ erro: String(e?.message ?? e) }));
  await mapearGameIds().catch(() => {});
  await coletarJogadores365().catch((e: any) => console.log("[jogadores365] erro diario", String(e?.message ?? e)));
  await setCfg("last_daily_refresh", hoje);
  console.log("[refresh-diario] dados365:", JSON.stringify(dados));
  console.log("[refresh-diario]", hoje, "odds:", (odds?.comOdds ?? JSON.stringify(odds)), "lineups:", (lineups?.comLineup ?? JSON.stringify(lineups)));
  return { hoje, odds, lineups };
}
// Agendador interno (sem crontab do SO): roda no boot se ainda não rodou hoje + checa de hora em hora.
export function agendadorDiario(): void {
  setTimeout(() => { refreshDiario(false).catch((e: any) => console.log("[refresh-diario] erro boot", String(e?.message ?? e))); }, 4000);
  setInterval(() => { refreshDiario(false).catch(() => {}); }, 60 * 60 * 1000);
}

// Diagnóstico: loga a estrutura crua das lineups de um (ou vários) gid no boot, se config.lineup_probe estiver setado.
export async function probeLineup(gid: string | number): Promise<void> {
  try {
    const gj = await s365(`/game?appTypeId=5&langId=1&userCountryId=21&timezoneName=America/Sao_Paulo&gameId=${gid}`);
    const g = gj?.game;
    if (!g) { console.log("[lineup-probe] gid", gid, "sem game"); return; }
    const dump = (c: any) => { const lu = c?.lineups; const ms = Array.isArray(lu?.members) ? lu.members : []; return { name: c?.name, temLineup: !!lu, luKeys: lu ? Object.keys(lu) : [], formation: lu?.formation, isProbable: lu?.isProbable, status: lu?.status, nMembers: ms.length, member0: ms[0] || null }; };
    const byId = new Map<number, any>();
    for (const m of (Array.isArray(g?.members) ? g.members : [])) byId.set(Number(m?.id), m);
    const ph = parseSide(g?.homeCompetitor, byId), pa = parseSide(g?.awayCompetitor, byId);
    const resumo = (c: any, ps: any) => ({ time: c?.name, formacao: ps?.formacao, confirmada: ps?.confirmada, n: ps?.titulares?.length, titulares: (ps?.titulares || []).map((t: any) => t.nome + " (" + t.posicao + ")") });
    console.log("[lineup-probe] gid", gid, "PARSED-HOME", JSON.stringify(resumo(g?.homeCompetitor, ph)), "PARSED-AWAY", JSON.stringify(resumo(g?.awayCompetitor, pa)));
    console.log("[url-probe] gid", gid, "gameKeys", JSON.stringify(Object.keys(g||{})), "urlfields", JSON.stringify({ url: g?.url, nameForURL: g?.nameForURL, homeNFU: g?.homeCompetitor?.nameForURL, awayNFU: g?.awayCompetitor?.nameForURL, homeId: g?.homeCompetitor?.id, awayId: g?.awayCompetitor?.id, compId: g?.competitionId }));
  } catch (e: any) { console.log("[lineup-probe] erro", String(e?.message ?? e).slice(0, 160)); }
}


export async function probeGame(gid: string | number): Promise<void> {
  try {
    const gj = await s365(`/game?appTypeId=5&langId=1&userCountryId=21&timezoneName=America/Sao_Paulo&gameId=${gid}`);
    const g = gj?.game;
    if (!g) { console.log("[game-probe]", gid, "sem game"); return; }
    const pick = (o: any, k: string) => { if (!o || o[k] === undefined) return "-"; const val = o[k]; return (typeof val === "object") ? ("obj:" + JSON.stringify(val).slice(0, 500)) : String(val); };
    const hc = g.homeCompetitor || {}, ac = g.awayCompetitor || {};
    console.log("[game-probe] GAMEKEYS", JSON.stringify(Object.keys(g)));
    console.log("[game-probe] COMPKEYS", JSON.stringify(Object.keys(hc)));
    for (const k of ["statistics", "stats", "previousMeetings", "h2h", "headToHead", "standings", "predictions", "winningChances", "actualPlayTime", "venue", "topPerformers", "events", "widgets"]) console.log("[game-probe] g." + k, pick(g, k));
    for (const k of ["recentMatches", "lastMatches", "form", "statistics", "stats", "standings", "ranking"]) console.log("[game-probe] hc." + k, pick(hc, k));
    const tryp = async (label: string, path: string) => { try { const r = await s365(path); console.log("[probe-ep]", label, "KEYS", JSON.stringify(Object.keys(r || {})), "SAMPLE", JSON.stringify(r).slice(0, 900)); } catch (e: any) { console.log("[probe-ep]", label, "erro", String(e?.message ?? e).slice(0, 90)); } };
    const comp = g.competitionId; const rec = (hc.recentMatches || []).slice(0, 5).join(",");
    await tryp("stats-games", `/stats/?appTypeId=5&langId=1&games=${gid}`);
    try { const r = await s365(`/stats/?appTypeId=5&langId=1&competitors=${hc.id},${ac.id}&games=${gid}`); const st = r?.stats || {}; console.log("[stats-full] STATSKEYS", JSON.stringify(Object.keys(st))); for (const k of Object.keys(st)) { const v = (st as any)[k]; console.log("[stats-full]", k, Array.isArray(v) ? ("arr["+v.length+"] " + JSON.stringify(v).slice(0,700)) : JSON.stringify(v).slice(0,700)); } } catch (e: any) { console.log("[stats-full] erro", String(e?.message ?? e).slice(0,90)); }
    await tryp("h2h-game", `/games/headToHead/?appTypeId=5&langId=1&gameId=${gid}`);
    await tryp("recent-games", `/games/?appTypeId=5&langId=1&games=${rec}`);
    await tryp("recent-fixtures", `/games/fixtures/?appTypeId=5&langId=1&games=${rec}`);
  } catch (e: any) { console.log("[game-probe] erro", String(e?.message ?? e).slice(0, 200)); }
}

export async function probeAthlete(comp: string | number): Promise<void> {
  try {
    const tryp = async (label: string, path: string) => { try { const r = await s365(path); const k = Object.keys(r || {}); const arr = (r && (r.squads || r.athletes || r.members || r.competitors)); console.log("[squad-probe]", label, "KEYS", JSON.stringify(k), "n", Array.isArray(arr) ? arr.length : (arr ? "obj" : 0), "SAMPLE", JSON.stringify(r).slice(0, 350)); } catch (e: any) { console.log("[squad-probe]", label, "erro", String(e?.message ?? e).slice(0, 70)); } };
    await tryp("squads-s", `/squads/?appTypeId=5&langId=1&competitors=${comp}`);
    await tryp("comp-squad", `/competitors/squads/?appTypeId=5&langId=1&competitors=${comp}`);
    await tryp("squad-comp", `/squads/?appTypeId=5&langId=1&competitor=${comp}&competition=5930`);
    await tryp("competitor-full", `/competitors/?appTypeId=5&langId=1&competitors=${comp}`);
    await tryp("ath-by-comp", `/athletes/?appTypeId=5&langId=1&competitors=${comp}`);
    await tryp("roster", `/competitors/roster/?appTypeId=5&langId=1&competitor=${comp}`);
  } catch (e: any) { console.log("[squad-probe] erro", String(e?.message ?? e).slice(0, 120)); }
}
export async function rotasScores365(app: FastifyInstance) {
  app.post("/admin/jogadores365/coletar", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); await setCfg("coletar_jogadores365", "go"); coletarJogadores365SeFlag(); return { ok: true, iniciado: true }; });
  app.get("/admin/jogadores365/status", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); let st: any = {}; try { st = JSON.parse((await cfg("jogadores365_status")) || "{}"); } catch {} const tot = Number(((await pool.query("SELECT count(*) n FROM jogadores_365")).rows[0] as any)?.n || 0); const comDet = Number(((await pool.query("SELECT count(*) n FROM jogadores_365 WHERE length(posicao_det)>0")).rows[0] as any)?.n || 0); return { ok: true, status: st, totalBanco: tot, comPosicaoDetalhada: comDet }; });
  app.post("/admin/jogadores365/limpar", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); await pool.query("DELETE FROM config WHERE chave='jogadores365_status'"); return { ok: true }; });
  app.post("/admin/scores365/coletar", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); return await coletarDados365(); });
  app.post("/admin/scores365/odds", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); return await syncOdds(); });
  app.get("/admin/scores365/status", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); try { return { ok: true, status: JSON.parse((await cfg("scores365_status")) || "{}") }; } catch { return { ok: true, status: {} }; } });
  app.get("/admin/scores365/ping", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    try {
      const j = await s365("/game?appTypeId=5&langId=1&userCountryId=21&timezoneName=America/Sao_Paulo&gameId=4627866");
      const g = j?.game; if (!g) return { ok: false, detalhe: "sem resposta" };
      const od = odds1x2(g);
      return { ok: true, detalhe: (g?.homeCompetitor?.name || "?") + " x " + (g?.awayCompetitor?.name || "?") + (od ? (" · odds " + od.casa + "/" + od.empate + "/" + od.fora) : " · sem odds") };
    } catch (e: any) { return { ok: false, detalhe: String(e?.message ?? e).slice(0, 120) }; }
  });
  // Diagnóstico de escalação: GET /admin/scores365/lineup?gid=4627866&en=Mexico
  app.get("/admin/scores365/lineup", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const gid = String((req.query as any)?.gid ?? "").trim();
    const en = String((req.query as any)?.en ?? "").trim();
    if (!gid || !en) return reply.code(400).send({ erro: "gid e en?" });
    try { const r = await escalacao365(gid, en); return { ok: true, gid, en, escalacao: r }; }
    catch (e: any) { return { ok: false, erro: String(e?.message ?? e).slice(0, 160) }; }
  });
  // Puxa lineups de todos os jogos e grava no banco (manual/teste).
  app.post("/admin/scores365/lineups", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); return await syncLineups(); });
  app.get("/admin/scores365/lineups", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); try { return { ok: true, status: JSON.parse((await cfg("lineups_status")) || "{}") }; } catch { return { ok: true, status: {} }; } });
  // Força o refresh diário agora (odds + lineups).
  app.post("/admin/scores365/refresh", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); return await refreshDiario(true); });
  // Sonda de boot (verificação): se config.lineup_probe tiver gids (csv), loga a estrutura crua.
  (async () => { try { const g = await cfg("lineup_probe"); if (g) for (const id of g.split(",").map((s) => s.trim()).filter(Boolean)) await probeLineup(id); } catch {} })();
  mapearGameIdsSeFlag();
  coletarJogadores365SeFlag();
  (async () => { try { const g = await cfg("game_probe"); if (g) for (const id of g.split(",").map((s) => s.trim()).filter(Boolean)) await probeGame(id); } catch {} })();
  (async () => { try { const g = await cfg("athlete_probe"); if (g) for (const id of g.split(",").map((s) => s.trim()).filter(Boolean)) await probeAthlete(id); } catch {} })();
}
