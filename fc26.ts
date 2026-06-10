import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";
import { readFileSync } from "node:fs";

async function cfg(k: string): Promise<string> { try { const { rows } = await pool.query("SELECT valor FROM config WHERE chave=$1", [k]); return (rows as any[])[0]?.valor ?? ""; } catch { return ""; } }
async function setCfg(k: string, v: string): Promise<void> { try { await pool.query("INSERT INTO config (chave,valor) VALUES ($1,$2) ON CONFLICT (chave) DO UPDATE SET valor=$2, atualizado_em=now()", [k, v]); } catch {} }
async function admOk(req: FastifyRequest): Promise<boolean> { const t = req.headers["x-admin-token"]; const e = process.env.ADMIN_TOKEN ?? ""; if (e && t === e) return true; const u = await usuarioDaReq(req); return u?.papel === "admin"; }
const norm = (s: string) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const toks = (s: string) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
const numOrNull = (v: any) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? n : null; };
function lev(a: string, b: string): number { const m = a.length, n = b.length; if (!m) return n; if (!n) return m; const d: number[] = Array(n + 1).fill(0).map((_, j) => j); for (let i = 1; i <= m; i++) { let prev = d[0]; d[0] = i; for (let j = 1; j <= n; j++) { const tmp = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = tmp; } } return d[n]; }
const ratio = (a: string, b: string): number => { const L = Math.max(a.length, b.length); return L ? 1 - lev(a, b) / L : 1; };

let RODANDO_FC = false;
export async function casarFc26(): Promise<any> {
  if (RODANDO_FC) return { ok: false, erro: "ja rodando" };
  RODANDO_FC = true;
  const setStatus = (o: any) => setCfg("fc26_status", JSON.stringify({ ...o, em: new Date().toISOString() }));
  try {
    await setStatus({ rodando: true, fase: "lendo CSV", feitos: 0, total: 0 });
    let txt = "";
    try { txt = readFileSync(process.cwd() + "/fc26_wc.tsv", "utf8"); } catch { await setStatus({ rodando: false, fase: "erro: arquivo nao encontrado" }); return { ok: false, erro: "fc26_wc.tsv nao encontrado" }; }
    const lines = txt.split("\n").filter((l) => l.trim());
    const H = lines[0].split("\t"); const ix = (n: string) => H.indexOf(n);
    const byNacKey = new Map<string, Map<string, any>>(); const glob = new Map<string, any[]>(); const byNac = new Map<string, any[]>();
    for (let i = 1; i < lines.length; i++) {
      const c = lines[i].split("\t");
      const longName = c[ix("long")] || c[ix("short")];
      const row = { fc_id: +c[ix("player_id")], short: c[ix("short")], long: longName, nome_n: c[ix("nome_n")], short_n: norm(c[ix("short")]), nac: c[ix("nacao_n")], tokens: toks(longName), club: c[ix("club")], pos: c[ix("pos")], pe: c[ix("pe")], overall: numOrNull(c[ix("overall")]), pace: numOrNull(c[ix("pace")]), shooting: numOrNull(c[ix("shooting")]), passing: numOrNull(c[ix("passing")]), dribbling: numOrNull(c[ix("dribbling")]), defending: numOrNull(c[ix("defending")]), physic: numOrNull(c[ix("physic")]) };
      if (!byNac.has(row.nac)) byNac.set(row.nac, []);
      byNac.get(row.nac)!.push(row);
      if (!byNacKey.has(row.nac)) byNacKey.set(row.nac, new Map());
      const mp = byNacKey.get(row.nac)!; if (!mp.has(row.nome_n)) mp.set(row.nome_n, row); if (row.short_n && !mp.has(row.short_n)) mp.set(row.short_n, row);
      if (!glob.has(row.nome_n)) glob.set(row.nome_n, []); glob.get(row.nome_n)!.push(row);
    }
    const nossos = (await pool.query("SELECT athlete_id, nome, selecao FROM jogadores_365")).rows as any[];
    await setStatus({ rodando: true, fase: "casando", feitos: 0, total: nossos.length });
    const usado = new Set<number>();
    const aplicar = async (id: number, m: any) => { usado.add(m.fc_id); await pool.query("UPDATE jogadores_365 SET fc_id=$1,overall=$2,pace=$3,shooting=$4,passing=$5,dribbling=$6,defending=$7,physical=$8,pe=$9,fc_pos=$10,fc_time=$11 WHERE athlete_id=$12", [m.fc_id, m.overall, m.pace, m.shooting, m.passing, m.dribbling, m.defending, m.physic, m.pe, m.pos, m.club, id]); };
    let exato = 0, fuzzy = 0, k = 0; const pend: any[] = [];
    for (const j of nossos) {
      const nn = norm(j.nome), nac = norm(j.selecao);
      let m = byNacKey.get(nac)?.get(nn) || null;
      if (!m) { const g = glob.get(nn); if (g && g.length === 1) m = g[0]; }
      if (m && !usado.has(m.fc_id)) { await aplicar(j.athlete_id, m); exato++; } else pend.push({ j, nn, nac });
      k++; if (k % 300 === 0) await setStatus({ rodando: true, fase: "casando (exato)", feitos: k, total: nossos.length, casados: exato });
    }
    let p = 0;
    for (const { j, nn, nac } of pend) {
      const cands = (byNac.get(nac) || []).filter((c) => !usado.has(c.fc_id));
      const ourT = toks(j.nome); const sur = ourT[ourT.length - 1] || "";
      let best: any = null, bs = 0, second = 0;
      for (const c of cands) {
        let sc = Math.max(ratio(nn, c.nome_n), ratio(nn, c.short_n));
        if (sur && sur.length >= 4 && c.tokens.includes(sur)) { sc = Math.max(sc, 0.6); for (const t of ourT) { if (t !== sur && (c.tokens.includes(t) || c.tokens.some((ft: string) => ft.length >= 4 && t.length >= 4 && (ft.startsWith(t) || t.startsWith(ft))))) { sc = Math.max(sc, 0.9); break; } } }
        if (sc > bs) { second = bs; best = c; bs = sc; } else if (sc > second) second = sc;
      }
      if (best && bs >= 0.82 && (bs - second >= 0.03 || cands.length === 1)) { await aplicar(j.athlete_id, best); fuzzy++; }
      p++; if (p % 100 === 0) await setStatus({ rodando: true, fase: "casando (fuzzy)", feitos: p, total: pend.length, casados: exato + fuzzy });
    }
    await setCfg("fc26_em", new Date().toISOString());
    await setStatus({ rodando: false, fase: "concluido", feitos: nossos.length, total: nossos.length, casados: exato + fuzzy, exato, fuzzy, csv: lines.length - 1 });
    await setCfg("casar_fc26", "");
    console.log("[fc26] casados", exato + fuzzy, "(exato", exato, "fuzzy", fuzzy, ") de", nossos.length);
    return { ok: true, casados: exato + fuzzy, total: nossos.length };
  } finally { RODANDO_FC = false; }
}
export function casarFc26SeFlag(): void { (async () => { try { if ((await cfg("casar_fc26")) === "go" && !RODANDO_FC) casarFc26().catch((e: any) => console.log("[fc26] erro", String(e?.message ?? e))); } catch {} })(); }

export async function rotasFc26(app: FastifyInstance) {
  app.post("/admin/fc26/casar", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); await setCfg("casar_fc26", "go"); casarFc26SeFlag(); return { ok: true, iniciado: true }; });
  app.get("/admin/fc26/status", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); let st: any = {}; try { st = JSON.parse((await cfg("fc26_status")) || "{}"); } catch {} const com = Number(((await pool.query("SELECT count(*) n FROM jogadores_365 WHERE pace IS NOT NULL")).rows[0] as any)?.n || 0); return { ok: true, status: st, comAtributos: com }; });
}
