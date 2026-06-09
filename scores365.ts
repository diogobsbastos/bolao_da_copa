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
function odds1x2(g: any): any {
  const bo = Array.isArray(g?.bestOdds) ? g.bestOdds : [];
  const line = bo.find((x: any) => x?.lineTypeId === 1);
  if (!line || !Array.isArray(line.options)) return null;
  const dec = (nm: string) => { const o = line.options.find((o: any) => String(o?.name) === nm); return o?.rate?.decimal ?? null; };
  const casa = dec("1"), empate = dec("X"), fora = dec("2");
  if (casa == null && empate == null && fora == null) return null;
  return { casa, empate, fora, fonte: "mercado (365scores)", em: new Date().toISOString() };
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

export async function rotasScores365(app: FastifyInstance) {
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
}
