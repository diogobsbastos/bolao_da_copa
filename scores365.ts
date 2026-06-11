import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";
import { apurarJogo, apurarPendentes } from "./pontuacao.js";

const S365 = "https://webws.365scores.com/web";
const COMP = 5930; // FIFA World Cup 2026
const HDRS = { "accept": "application/json", "user-agent": "Mozilla/5.0", "accept-language": "en" };

const norm = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
// mapeia o nome do 365scores (normalizado) -> forma normalizada do NOSSO nome em ingles
const ALIAS: Record<string, string> = {
  usa: "unitedstates", drcongo: "congodr", capeverde: "capeverdeislands", caboverde: "capeverdeislands", capverde: "capeverdeislands", turkiye: "turkey",
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

export async function atualizarDadosJogo(jogoId: number): Promise<any> {
  const j = (await pool.query("SELECT id, odds->>'gid' AS gid FROM jogos WHERE id=$1", [jogoId])).rows[0] as any;
  if (!j?.gid) return { ok: false, erro: "sem gid (jogo distante ou nao mapeado)" };
  const gj = await s365(`/game?appTypeId=5&langId=1&userCountryId=21&timezoneName=America/Sao_Paulo&gameId=${j.gid}`);
  const g = gj?.game; if (!g) return { ok: false, erro: "sem game no 365" };
  const base: any = extrai365(g);
  const hcId = g.homeCompetitor?.id, acId = g.awayCompetitor?.id;
  try { const r = await s365(`/stats/?appTypeId=5&langId=1&competitors=${hcId},${acId}&games=${j.gid}`); base.golsLideres = golsLideres(r, g.homeCompetitor?.countryId, g.awayCompetitor?.countryId); } catch {}
  const cache = new Map<number, any>();
  try { base.casa.ultimas5 = await ultimas5(hcId, base.casa.recentIds, cache); } catch {}
  try { base.visitante.ultimas5 = await ultimas5(acId, base.visitante.recentIds, cache); } catch {}
  try {
    const od = odds1x2(g);
    if (od) {
      const ourCasa = (await pool.query("SELECT selecao_casa FROM jogos WHERE id=$1", [jogoId])).rows[0]?.selecao_casa as string;
      const invert = ourCasa ? !casaLado(al(ourCasa), String(g.homeCompetitor?.name || "")) : false;
      const odd = invert ? { ...od, casa: od.fora, fora: od.casa } : od;
      await pool.query("UPDATE jogos SET odds = COALESCE(odds,'{}'::jsonb) || $1::jsonb WHERE id=$2", [JSON.stringify(odd), jogoId]);
    }
  } catch {}
  await pool.query("UPDATE jogos SET dados365=$1 WHERE id=$2", [JSON.stringify(base), jogoId]);
  try { const lu = await lineupsDoJogo(j.gid); if (lu) await pool.query("UPDATE jogos SET lineup_casa=$1, lineup_visitante=$2, lineup_em=now() WHERE id=$3", [JSON.stringify(lu.home?.lineup ?? null), JSON.stringify(lu.away?.lineup ?? null), jogoId]); } catch {}
  return { ok: true, jogo: jogoId, gid: j.gid };
}
export async function coletarResultadoJogo(jogoId: number): Promise<any> {
  const j = (await pool.query("SELECT id, selecao_casa, selecao_visitante, odds->>'gid' AS gid, inicio FROM jogos WHERE id=$1", [jogoId])).rows[0] as any;
  if (!j?.gid) return { ok: false, erro: "sem gid" };
  return await processarResultadoJogo(j);
}
export async function confirmarAgenda(): Promise<any> {
  const jogos = (await pool.query("SELECT id, inicio, odds->>'gid' AS gid FROM jogos WHERE odds->>'gid' IS NOT NULL AND inicio IS NOT NULL AND inicio > now() - interval '6 hours' AND inicio < now() + interval '3 days'")).rows as any[];
  let ajustados = 0;
  for (const j of jogos) {
    try {
      const gj = await s365(`/game?appTypeId=5&langId=1&userCountryId=21&timezoneName=America/Sao_Paulo&gameId=${j.gid}`);
      const g = gj?.game; if (!g) continue;
      const st = g.startTime || g.gameTime || g.statusTime || null; if (!st) continue;
      const novo = new Date(st); if (isNaN(novo.getTime())) continue;
      if (Math.abs(novo.getTime() - new Date(j.inicio).getTime()) > 60000) { await pool.query("UPDATE jogos SET inicio=$1 WHERE id=$2", [novo.toISOString(), j.id]); ajustados++; }
    } catch {}
    await sleep(120);
  }
  await setCfg("agenda_conferida_em", JSON.stringify({ em: new Date().toISOString(), conferidos: jogos.length, ajustados }));
  return { ok: true, conferidos: jogos.length, ajustados };
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
  await agendarResultados().catch(() => {});
  console.log("[refresh-diario] dados365:", JSON.stringify(dados));
  console.log("[refresh-diario]", hoje, "odds:", (odds?.comOdds ?? JSON.stringify(odds)), "lineups:", (lineups?.comLineup ?? JSON.stringify(lineups)));
  return { hoje, odds, lineups };
}
// Agendador interno (sem crontab do SO): roda no boot se ainda não rodou hoje + checa de hora em hora.
function statusFinal365(g: any): boolean {
  const txt = String(g?.statusText || g?.shortStatusText || g?.gameStatusText || "").toLowerCase();
  if (/end|final|\bft\b|aet|\bpen\b|encerr|terminad/.test(txt)) return true;
  const sg = Number(g?.statusGroup); if (sg === 3 || sg === 4) return true;
  return false;
}

// Coletor de RESULTADOS REAIS: por jogo com gid e sem resultado, busca o placar final no 365scores,
// grava em jogos.resultado_casa/visitante (orientacao pelo nome) e dispara a apuracao (pontos+token).
// Processa UM jogo: busca o placar final no 365, e se o jogo ja terminou grava resultado_* + status='final' e apura.
async function coletarGolsDoJogo(g: any, jogoId: number): Promise<void> {
  try {
    const evs: any[] = Array.isArray(g?.events) ? g.events : (Array.isArray(g?.actualGameEvents) ? g.actualGameEvents : (Array.isArray(g?.gameEvents) ? g.gameEvents : []));
    try { const ja = await cfg("eventos_probe"); if (!ja && evs.length) await setCfg("eventos_probe", JSON.stringify({ jogo: jogoId, em: new Date().toISOString(), sample: evs.slice(0, 6) }).slice(0, 7000)); } catch {}
    const goalRe = /goal/i, badRe = /own|miss|saved|cancel|disallow|var/i;
    const resolve = async (pid: any, nome: string): Promise<number | null> => {
      if (pid != null) { try { const r = (await pool.query("SELECT jogador_id FROM jogadores_365 WHERE athlete_id=$1", [pid])).rows[0] as any; if (r?.jogador_id) return r.jogador_id; } catch {} }
      if (nome) { try { const r = (await pool.query("SELECT id FROM jogadores WHERE lower(nome)=lower($1) LIMIT 1", [nome])).rows[0] as any; if (r?.id) return r.id; } catch {} }
      return null;
    };
    const out: any[] = [];
    for (const e of evs) {
      const tn = String(e?.type?.name ?? e?.eventType ?? e?.typeName ?? e?.name ?? "");
      const sub = String(e?.subType ?? e?.type?.subTypeName ?? "");
      if (!goalRe.test(tn) || badRe.test(sub) || badRe.test(tn)) continue;
      const pid = e?.playerId ?? e?.athleteId ?? e?.player?.id ?? e?.scorerId ?? null;
      const nome = String(e?.playerName ?? e?.player?.name ?? e?.scorerName ?? "");
      out.push({ tipo: "gol", athlete_id: pid, nome, jogador_id: await resolve(pid, nome) });
      const apid = e?.assistPlayerId ?? e?.assistId ?? e?.assist?.id ?? null;
      const anome = String(e?.assistPlayerName ?? e?.assist?.name ?? "");
      if (apid != null || anome) out.push({ tipo: "assist", athlete_id: apid, nome: anome, jogador_id: await resolve(apid, anome) });
    }
    await pool.query("UPDATE jogos SET gols_evt=$1 WHERE id=$2", [JSON.stringify(out), jogoId]);
  } catch {}
}

async function processarResultadoJogo(j: { id: number; selecao_casa: string; selecao_visitante: string; gid: string; inicio: any }): Promise<{ jogo: number; estado: string; placar?: string; tokens?: number }> {
  const gj = await s365(`/game?appTypeId=5&langId=1&userCountryId=21&timezoneName=America/Sao_Paulo&gameId=${j.gid}`);
  const g = gj?.game; if (!g) return { jogo: j.id, estado: "sem game" };
  const hs = numScore(g.homeCompetitor?.score), ascore = numScore(g.awayCompetitor?.score);
  if (hs == null || ascore == null) return { jogo: j.id, estado: "sem placar" };
  const velho = j.inicio ? (Date.now() - new Date(j.inicio).getTime()) > 150 * 60 * 1000 : false;
  if (!statusFinal365(g) && !velho) return { jogo: j.id, estado: "em andamento" };
  const homeNome = String(g.homeCompetitor?.name || "");
  let rc: number, rv: number;
  if (casaLado(al(j.selecao_casa), homeNome)) { rc = hs; rv = ascore; }
  else if (casaLado(al(j.selecao_visitante), homeNome)) { rc = ascore; rv = hs; }
  else return { jogo: j.id, estado: "orientacao nao casou" };
  await pool.query("UPDATE jogos SET resultado_casa=$2, resultado_visitante=$3, resultado_em=now(), status='final' WHERE id=$1 AND resultado_casa IS NULL", [j.id, rc, rv]);
  await coletarGolsDoJogo(g, j.id).catch(() => {});
  const ap = await apurarJogo(j.id);
  return { jogo: j.id, estado: "final", placar: rc + "-" + rv, tokens: ap.tokens };
}

// Varredura manual (botao admin): olha todos os jogos com gid ja terminados e ainda sem resultado.
export async function coletarResultados(force = false): Promise<any> {
  const jogos = (await pool.query(
    "SELECT id, selecao_casa, selecao_visitante, odds->>'gid' AS gid, inicio FROM jogos WHERE odds->>'gid' IS NOT NULL AND resultado_casa IS NULL AND (inicio < now() - interval '100 minutes' OR $1) ORDER BY inicio NULLS LAST, id",
    [force]
  )).rows as any[];
  let capturados = 0; const detalhe: any[] = [];
  for (const j of jogos) {
    try { const r = await processarResultadoJogo(j); detalhe.push(r); if (r.estado === "final") capturados++; await sleep(150); }
    catch (e: any) { detalhe.push({ jogo: j.id, erro: String(e?.message ?? e).slice(0, 80) }); }
  }
  const status = { em: new Date().toISOString(), olhados: jogos.length, capturados, apurados: capturados, detalhe };
  await setCfg("resultados_status", JSON.stringify(status));
  if (capturados) console.log("[resultados] varredura:", capturados, "capturados/apurados");
  return status;
}

// ===== Agendamento POR HORARIO de cada jogo (sem crontab do SO) =====
// Para cada jogo: 1a checagem em inicio + GRACE_MIN; se ainda nao terminou (prorrogacao/penaltis), re-tenta a cada RETRY_MIN ate MAX_TENTATIVAS.
const GRACE_MIN = 115;        // ~apito final de um jogo de 90'
const RETRY_MIN = 5;
const MAX_TENTATIVAS = 16;    // ~80 min de janela extra (cobre prorrogacao + penaltis do mata-mata)
const armados = new Set<number>();

async function checarJogoAgendado(id: number, tentativa: number): Promise<void> {
  let j: any = null;
  try { j = (await pool.query("SELECT id, selecao_casa, selecao_visitante, odds->>'gid' AS gid, inicio FROM jogos WHERE id=$1 AND resultado_casa IS NULL AND odds->>'gid' IS NOT NULL", [id])).rows[0]; } catch {}
  if (!j) { armados.delete(id); return; } // ja capturado / sem gid
  try {
    const r = await processarResultadoJogo(j);
    if (r.estado === "final") { armados.delete(id); console.log("[resultados] jogo", id, "FINAL", r.placar, "tokens", r.tokens); return; }
  } catch (e: any) { console.log("[resultados] erro jogo", id, String(e?.message ?? e).slice(0, 80)); }
  if (tentativa + 1 < MAX_TENTATIVAS) setTimeout(() => { checarJogoAgendado(id, tentativa + 1).catch(() => {}); }, RETRY_MIN * 60 * 1000);
  else armados.delete(id); // desiste; o re-arme horario pega de novo se preciso
}

// Arma os timers dos jogos que terminam nas proximas ~26h (evita overflow do setTimeout). Boot faz catch-up dos que ja passaram.
export async function agendarResultados(): Promise<void> {
  let jogos: any[] = [];
  try { jogos = (await pool.query("SELECT id, inicio FROM jogos WHERE odds->>'gid' IS NOT NULL AND resultado_casa IS NULL AND apurado=false AND inicio IS NOT NULL AND inicio < now() + interval '26 hours' ORDER BY inicio")).rows as any[]; } catch { return; }
  const agora = Date.now(); let n = 0;
  for (const j of jogos) {
    if (armados.has(j.id)) continue;
    const delay = (new Date(j.inicio).getTime() + GRACE_MIN * 60 * 1000) - agora;
    armados.add(j.id); n++;
    if (delay <= 0) checarJogoAgendado(j.id, 0).catch(() => {});                       // ja deveria ter terminado -> checa agora
    else setTimeout(() => { checarJogoAgendado(j.id, 0).catch(() => {}); }, delay);    // agenda pro apito
  }
  if (n) console.log("[resultados] agendados", n, "jogo(s) pelo horario");
}

export function agendadorDiario(): void {
  setTimeout(() => { refreshDiario(false).catch((e: any) => console.log("[refresh-diario] erro boot", String(e?.message ?? e))); }, 4000);
  setInterval(() => { refreshDiario(false).catch(() => {}); }, 60 * 60 * 1000);
  setTimeout(() => { agendarResultados().catch((e: any) => console.log("[resultados] erro boot", String(e?.message ?? e))); }, 12000); // boot: arma timers + catch-up
  setInterval(() => { agendarResultados().catch(() => {}); }, 60 * 60 * 1000); // de hora em hora: arma a proxima janela de jogos
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

export async function probeAthlete(ath: string | number): Promise<void> {
  try {
    const prof = await s365(`/athletes/?appTypeId=5&langId=1&athletes=${ath}&withStats=true`);
    const comps = Array.isArray(prof?.competitions) ? prof.competitions : [];
    const clubId = (prof?.athletes || [])[0]?.clubId;
    console.log("[stat-c] competicoes do atleta:", JSON.stringify(comps.map((c: any) => ({ id: c.id, n: c.name })).slice(0, 8)), "clubId", clubId);
    const tryp = async (label: string, path: string) => { try { const r = await s365(path); const j = JSON.stringify(r || {}); console.log("[stat-c]", label, "len", j.length, "stats?", /statistic|appearance|rating|participa|"saves"/i.test(j), j.length > 50 ? ("SAMPLE " + j.slice(0, 350)) : "vazio"); } catch (e: any) { console.log("[stat-c]", label, "erro", String(e?.message ?? e).slice(0, 50)); } };
    const cid = comps[0]?.id;
    if (cid) {
      await tryp("ath+comp", `/stats/?appTypeId=5&langId=1&athletes=${ath}&competitions=${cid}`);
      await tryp("club+ath+comp", `/stats/?appTypeId=5&langId=1&competitors=${clubId}&athletes=${ath}&competitions=${cid}`);
      await tryp("club+comp", `/stats/?appTypeId=5&langId=1&competitors=${clubId}&competitions=${cid}`);
      await tryp("comp-only", `/stats/?appTypeId=5&langId=1&competitions=${cid}&athletes=${ath}&isCalculated=true`);
    } else console.log("[stat-c] sem competicoes no perfil");
  } catch (e: any) { console.log("[stat-c] erro", String(e?.message ?? e).slice(0, 120)); }
}

export async function mapearGameIds(): Promise<any> {
  const janelas = [["11/06/2026", "16/06/2026"], ["15/06/2026", "20/06/2026"], ["19/06/2026", "25/06/2026"], ["24/06/2026", "29/06/2026"]];
  const games = new Map<number, any>();
  for (const [ini, fim] of janelas) {
    try {
      const data = await s365(`/games/fixtures/?appTypeId=5&langId=1&timezoneName=America/Sao_Paulo&userCountryId=21&competitions=${COMP}&startDate=${ini}&endDate=${fim}`);
      const gs: any[] = Array.isArray(data?.games) ? data.games : (Array.isArray(data?.fixtures) ? data.fixtures : []);
      for (const g of gs) if (g?.id) games.set(g.id, g);
    } catch {}
    await sleep(300);
  }
  const meus = (await pool.query("SELECT id, selecao_casa, selecao_visitante FROM jogos WHERE selecao_casa<>'A definir' AND selecao_visitante<>'A definir'")).rows as any[];
  const byKey = new Map<string, any>();
  for (const m of meus) byKey.set(norm(m.selecao_casa) + "|" + norm(m.selecao_visitante), m);
  let casados = 0; const naoCasados: string[] = [];
  for (const g of games.values()) {
    const h = al(g?.homeCompetitor?.name || ""), a = al(g?.awayCompetitor?.name || "");
    let m = byKey.get(h + "|" + a); if (!m) m = byKey.get(a + "|" + h);
    if (m && g?.id) { await pool.query("UPDATE jogos SET odds = COALESCE(odds,'{}'::jsonb) || jsonb_build_object('gid', $1::bigint) WHERE id=$2", [g.id, m.id]); casados++; }
    else { naoCasados.push((g?.homeCompetitor?.name || "?") + " x " + (g?.awayCompetitor?.name || "?")); }
  }
  await setCfg("gids_map_em", JSON.stringify({ em: new Date().toISOString(), jogos365: games.size, casados, naoCasados: naoCasados.slice(0, 40) }));
  console.log("[mapear-gids]", games.size, "jogos do 365,", casados, "casados/gravados");
  return { ok: true, jogos365: games.size, casados };
}
export function mapearGameIdsSeFlag(): void { (async () => { try { if ((await cfg("mapear_gids")) === "go") { await setCfg("mapear_gids", ""); await mapearGameIds(); } } catch {} })(); }


let RODANDO_J365 = false;
export async function coletarJogadores365(): Promise<any> {
  if (RODANDO_J365) return { ok: false, erro: "ja esta rodando" };
  RODANDO_J365 = true;
  const setStatus = (o: any) => setCfg("jogadores365_status", JSON.stringify({ ...o, em: new Date().toISOString() }));
  try {
    await setStatus({ rodando: true, fase: "mapeando times", feitos: 0, total: 0, times: 0 });
    const jogos = (await pool.query("SELECT odds->>'gid' gid FROM jogos WHERE odds->>'gid' IS NOT NULL")).rows as any[];
    const comps = new Map<number, string>();
    let gi = 0;
    for (const j of jogos) {
      try {
        const gj = await s365(`/game?appTypeId=5&langId=1&userCountryId=21&timezoneName=America/Sao_Paulo&gameId=${j.gid}`);
        const g = gj?.game;
        if (g) { if (g.homeCompetitor) comps.set(g.homeCompetitor.id, g.homeCompetitor.name); if (g.awayCompetitor) comps.set(g.awayCompetitor.id, g.awayCompetitor.name); }
      } catch {}
      gi++; if (gi % 5 === 0) await setStatus({ rodando: true, fase: "mapeando times", feitos: gi, total: jogos.length, times: comps.size });
      await sleep(140 + Math.random() * 180);
    }
    const ids = [...comps.keys()];
    await setStatus({ rodando: true, fase: "convocados por selecao", feitos: 0, total: ids.length, times: ids.length, salvos: 0 });
    let n = 0, ti = 0;
    for (const cid of ids) {
      try {
        const r = await s365(`/squads/?appTypeId=5&langId=1&competitors=${cid}`);
        const squads = Array.isArray(r?.squads) ? r.squads : [];
        for (const sq of squads) {
          const sel = comps.get(sq.competitorId) || "";
          for (const a of (Array.isArray(sq.athletes) ? sq.athletes : [])) {
            await pool.query("INSERT INTO jogadores_365 (athlete_id,nome,short_name,selecao,selecao_id,posicao,posicao_det,posicao_ord,idade,clube_id,num_camisa,raw,atualizado_em) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now()) ON CONFLICT (athlete_id) DO UPDATE SET nome=$2,short_name=$3,selecao=$4,selecao_id=$5,posicao=$6,posicao_det=$7,posicao_ord=$8,idade=$9,clube_id=$10,num_camisa=$11,raw=$12,atualizado_em=now()",
              [a.id, a.name, a.shortName, sel, a.nationalTeamId ?? sq.competitorId, a.position?.name ?? "", a.formationPosition?.name ?? "", a.formationPosition?.order ?? null, a.age ?? null, a.clubId ?? null, a.jerseyNum ?? a.jerseyNumber ?? null, JSON.stringify(a)]);
            n++;
          }
        }
      } catch {}
      ti++; await setStatus({ rodando: true, fase: "convocados por selecao", feitos: ti, total: ids.length, times: ids.length, salvos: n });
      await sleep(350 + Math.random() * 320);
    }
    try { await pool.query("UPDATE jogadores_365 g SET jogador_id=j.id FROM jogadores j WHERE g.jogador_id IS NULL AND lower(j.nome)=lower(g.nome)"); } catch {}
    await setCfg("jogadores365_em", new Date().toISOString());
    await setStatus({ rodando: false, fase: "concluido", feitos: ids.length, total: ids.length, times: ids.length, salvos: n });
    await setCfg("coletar_jogadores365", "");
    console.log("[jogadores365] CONCLUIDO", n, "convocados de", ids.length, "selecoes");
    return { ok: true, atletas: n, times: ids.length };
  } finally { RODANDO_J365 = false; }
}
export async function coletarTime365(cid: number, selNome?: string): Promise<any> {
  let n = 0;
  try {
    const r = await s365(`/squads/?appTypeId=5&langId=1&competitors=${cid}`);
    const squads = Array.isArray(r?.squads) ? r.squads : [];
    for (const sq of squads) {
      const sel = selNome || sq?.competitorName || "";
      for (const a of (Array.isArray(sq.athletes) ? sq.athletes : [])) {
        await pool.query("INSERT INTO jogadores_365 (athlete_id,nome,short_name,selecao,selecao_id,posicao,posicao_det,posicao_ord,idade,clube_id,num_camisa,raw,atualizado_em) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now()) ON CONFLICT (athlete_id) DO UPDATE SET nome=$2,short_name=$3,selecao=$4,selecao_id=$5,posicao=$6,posicao_det=$7,posicao_ord=$8,idade=$9,clube_id=$10,num_camisa=$11,raw=$12,atualizado_em=now()",
          [a.id, a.name, a.shortName, sel, a.nationalTeamId ?? sq.competitorId, a.position?.name ?? "", a.formationPosition?.name ?? "", a.formationPosition?.order ?? null, a.age ?? null, a.clubId ?? null, a.jerseyNum ?? a.jerseyNumber ?? null, JSON.stringify(a)]);
        n++;
      }
    }
  } catch (e: any) { console.log("[time365] erro", String(e?.message ?? e).slice(0, 100)); }
  console.log("[time365] competitor", cid, "->", n, "jogadores");
  return { ok: true, jogadores: n };
}
export function coletarTime365SeFlag(): void { (async () => { try { const v = await cfg("coletar_time_365"); if (v) { await setCfg("coletar_time_365", ""); const [id, ...rest] = v.split("|"); await coletarTime365(Number(id.trim()), rest.join("|").trim() || undefined); } } catch {} })(); }
export function coletarJogadores365SeFlag(): void { (async () => { try { if ((await cfg("coletar_jogadores365")) === "go" && !RODANDO_J365) { coletarJogadores365().catch((e: any) => console.log("[jogadores365] erro", String(e?.message ?? e))); } } catch {} })(); }

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
  app.post("/admin/bolao/coletar", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); return await coletarResultados(true); });
  app.post("/admin/bolao/apurar", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); return await apurarPendentes(); });
  app.post("/admin/resultados/mapear-gids", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); return await mapearGameIds(); });
  app.get("/admin/bolao/status", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); let st: any = {}; try { st = JSON.parse((await cfg("resultados_status")) || "{}"); } catch {} const pend = Number(((await pool.query("SELECT count(*) n FROM jogos WHERE resultado_casa IS NOT NULL AND apurado=false")).rows[0] as any)?.n || 0); const apur = Number(((await pool.query("SELECT count(*) n FROM jogos WHERE apurado=true")).rows[0] as any)?.n || 0); return { ok: true, status: st, jogosApurados: apur, aguardandoApuracao: pend }; });
  app.post("/admin/bolao/resultado", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); const b = (req.body ?? {}) as any; const id = Number(b.jogo_id), rc = Number(b.rc), rv = Number(b.rv); if (!Number.isInteger(id) || !Number.isInteger(rc) || !Number.isInteger(rv) || rc < 0 || rv < 0) return reply.code(400).send({ erro: "dados invalidos" }); await pool.query("UPDATE jogos SET resultado_casa=$2, resultado_visitante=$3, resultado_em=now(), status='final', apurado=false WHERE id=$1", [id, rc, rv]); const ap = await apurarJogo(id); return { ok: true, apuracao: ap }; });
  // Sonda de boot (verificação): se config.lineup_probe tiver gids (csv), loga a estrutura crua.
  (async () => { try { const g = await cfg("lineup_probe"); if (g) for (const id of g.split(",").map((s) => s.trim()).filter(Boolean)) await probeLineup(id); } catch {} })();
  mapearGameIdsSeFlag();
  coletarJogadores365SeFlag();
  coletarTime365SeFlag();
  (async () => { try { const g = await cfg("game_probe"); if (g) for (const id of g.split(",").map((s) => s.trim()).filter(Boolean)) await probeGame(id); } catch {} })();
  (async () => { try { const g = await cfg("athlete_probe"); if (g) for (const id of g.split(",").map((s) => s.trim()).filter(Boolean)) await probeAthlete(id); } catch {} })();
}
