import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";

const BASE = "https://v3.football.api-sports.io";
const LEAGUE = 1;   // FIFA World Cup
const SEASON = 2026;

async function cfg(k: string): Promise<string> {
  try { const { rows } = await pool.query("SELECT valor FROM config WHERE chave=$1", [k]); return (rows as any[])[0]?.valor ?? ""; } catch { return ""; }
}
async function setCfg(k: string, v: string): Promise<void> {
  try { await pool.query("INSERT INTO config (chave,valor) VALUES ($1,$2) ON CONFLICT (chave) DO UPDATE SET valor=$2, atualizado_em=now()", [k, v]); } catch {}
}
async function admOk(req: FastifyRequest): Promise<boolean> {
  const t = req.headers["x-admin-token"]; const exp = process.env.ADMIN_TOKEN ?? "";
  if (exp && t === exp) return true;
  const u = await usuarioDaReq(req); return u?.papel === "admin";
}
async function afGet(path: string, key: string): Promise<{ ok: boolean; results: number; response: any[]; errors: any }> {
  try {
    const r = await fetch(BASE + path, { headers: { "x-apisports-key": key } });
    const j: any = await r.json().catch(() => ({}));
    return { ok: r.ok, results: Number(j?.results ?? 0), response: Array.isArray(j?.response) ? j.response : [], errors: j?.errors ?? null };
  } catch (e: any) { return { ok: false, results: 0, response: [], errors: String(e?.message ?? e) }; }
}

export async function syncApiFootball(): Promise<any> {
  const key = await cfg("api_football_key");
  if (!key) return { ok: false, erro: "sem chave" };
  const res: any = { em: new Date().toISOString() };
  const teams = await afGet(`/teams?league=${LEAGUE}&season=${SEASON}`, key);
  res.teams = teams.results; res.teamsSample = teams.response.slice(0, 6).map((t: any) => t?.team?.name); res.teamsErr = teams.errors;
  const fix = await afGet(`/fixtures?league=${LEAGUE}&season=${SEASON}`, key);
  res.fixtures = fix.results; res.fixErr = fix.errors;
  const inj = await afGet(`/injuries?league=${LEAGUE}&season=${SEASON}`, key);
  res.injuries = inj.results; res.injErr = inj.errors;
  const top = await afGet(`/players/topscorers?league=${LEAGUE}&season=${SEASON}`, key);
  res.topscorers = top.results; res.topSample = top.response.slice(0, 6).map((p: any) => p?.player?.name); res.topErr = top.errors;
  await setCfg("apifb_status", JSON.stringify(res));
  if (teams.response.length) {
    const map: any = {}; for (const t of teams.response) { if (t?.team?.id) map[t.team.name] = t.team.id; }
    await setCfg("apifb_teams", JSON.stringify(map));
  }
  return { ok: true, ...res };
}

// roda no boot apenas se config.apifb_sync == "go" (controlado por sql_local), p/ nao gastar quota a toa
export async function syncSeFlag(): Promise<void> {
  try { if ((await cfg("apifb_sync")) !== "go") return; await syncApiFootball(); await setCfg("apifb_sync", ""); } catch {}
}

export async function rotasApiFootball(app: FastifyInstance) {
  app.post("/admin/apifootball/sync", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    return await syncApiFootball();
  });
  app.get("/admin/apifootball/status", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const s = await cfg("apifb_status");
    try { return { ok: true, status: JSON.parse(s || "{}") }; } catch { return { ok: true, status: {} }; }
  });
}
