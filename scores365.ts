import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";

const S365 = "https://webws.365scores.com/web";
const COMP = 5930; // FIFA World Cup 2026
const HDRS = { "accept": "application/json", "user-agent": "Mozilla/5.0", "accept-language": "en" };

const norm = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
const ALIAS: Record<string, string> = { usa: "unitedstates", koreareplublic: "southkorea", korearepublic: "southkorea", ivorycoast: "ivorycoast", czechrepublic: "czechia", turkiye: "turkey" };
const key = (a: string, b: string) => norm(a) + "|" + norm(b);

async function cfg(k: string): Promise<string> { try { const { rows } = await pool.query("SELECT valor FROM config WHERE chave=$1", [k]); return (rows as any[])[0]?.valor ?? ""; } catch { return ""; } }
async function setCfg(k: string, v: string): Promise<void> { try { await pool.query("INSERT INTO config (chave,valor) VALUES ($1,$2) ON CONFLICT (chave) DO UPDATE SET valor=$2, atualizado_em=now()", [k, v]); } catch {} }
async function admOk(req: FastifyRequest): Promise<boolean> { const t = req.headers["x-admin-token"]; const e = process.env.ADMIN_TOKEN ?? ""; if (e && t === e) return true; const u = await usuarioDaReq(req); return u?.papel === "admin"; }

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
  return { casa, empate, fora, fonte: "mercado (365scores)", casas: 1, em: new Date().toISOString() };
}

export async function syncOdds(): Promise<any> {
  const data = await s365(`/games/?appTypeId=5&langId=1&timezoneName=America/Sao_Paulo&userCountryId=21&competitions=${COMP}`);
  const games: any[] = Array.isArray(data?.games) ? data.games : [];
  const meus = (await pool.query("SELECT id, selecao_casa, selecao_visitante FROM jogos WHERE selecao_casa<>'A definir' AND selecao_visitante<>'A definir'")).rows as any[];
  const byKey = new Map<string, any>();
  for (const m of meus) byKey.set(key(m.selecao_casa, m.selecao_visitante), m);
  const al = (n: string) => ALIAS[norm(n)] || norm(n);
  let casados = 0, comOdds = 0, atualizados = 0;
  for (const g of games) {
    const hn = g?.homeCompetitor?.name || "", an = g?.awayCompetitor?.name || "";
    let m = byKey.get(al(hn) + "|" + al(an)); let invert = false;
    if (!m) { m = byKey.get(al(an) + "|" + al(hn)); invert = !!m; }
    if (!m) continue; casados++;
    const od = odds1x2(g);
    if (!od) continue; comOdds++;
    const odd = invert ? { ...od, casa: od.fora, fora: od.casa } : od;
    await pool.query("UPDATE jogos SET odds=$1 WHERE id=$2", [JSON.stringify(odd), m.id]); atualizados++;
  }
  const sample = games.slice(0, 3).map((x: any) => ({ home: x?.homeCompetitor?.name, away: x?.awayCompetitor?.name, odds: !!odds1x2(x) }));
  const status = { em: new Date().toISOString(), jogos365: games.length, casados, comOdds, atualizados, sample };
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
      const j = await s365("/game?appTypeId=5&langId=1&gameId=4627866");
      const g = j?.game; if (!g) return { ok: false, detalhe: "sem resposta" };
      const od = odds1x2(g);
      return { ok: true, detalhe: (g?.homeCompetitor?.name || "?") + " x " + (g?.awayCompetitor?.name || "?") + (od ? (" · odds " + od.casa + "/" + od.empate + "/" + od.fora) : " · sem odds") };
    } catch (e: any) { return { ok: false, detalhe: String(e?.message ?? e).slice(0, 120) }; }
  });
}
