import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";
import { readFileSync } from "node:fs";

async function cfg(k: string): Promise<string> { try { const { rows } = await pool.query("SELECT valor FROM config WHERE chave=$1", [k]); return (rows as any[])[0]?.valor ?? ""; } catch { return ""; } }
async function setCfg(k: string, v: string): Promise<void> { try { await pool.query("INSERT INTO config (chave,valor) VALUES ($1,$2) ON CONFLICT (chave) DO UPDATE SET valor=$2, atualizado_em=now()", [k, v]); } catch {} }
async function admOk(req: FastifyRequest): Promise<boolean> { const t = req.headers["x-admin-token"]; const e = process.env.ADMIN_TOKEN ?? ""; if (e && t === e) return true; const u = await usuarioDaReq(req); return u?.papel === "admin"; }
const norm = (s: string) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

let RODANDO_FC = false;
export async function casarFc26(): Promise<any> {
  if (RODANDO_FC) return { ok: false, erro: "ja rodando" };
  RODANDO_FC = true;
  const setStatus = (o: any) => setCfg("fc26_status", JSON.stringify({ ...o, em: new Date().toISOString() }));
  try {
    await setStatus({ rodando: true, fase: "lendo CSV", feitos: 0, total: 0 });
    let txt = "";
    try { txt = readFileSync(process.cwd() + "/fc26_wc.tsv", "utf8"); } catch (e: any) { await setStatus({ rodando: false, fase: "erro: arquivo nao encontrado" }); return { ok: false, erro: "fc26_wc.tsv nao encontrado" }; }
    const lines = txt.split("\n").filter((l) => l.trim());
    const head = lines[0].split("\t");
    const ix = (n: string) => head.indexOf(n);
    const byNacNome = new Map<string, Map<string, any>>(); const glob = new Map<string, any[]>();
    for (let i = 1; i < lines.length; i++) {
      const c = lines[i].split("\t");
      const row = { fc_id: +c[ix("player_id")], nome_n: c[ix("nome_n")], nac: c[ix("nacao_n")], time: c[ix("Team")], pos: c[ix("Position")], pe: c[ix("Preferred Foot")], pace: +c[ix("Pace")], shooting: +c[ix("Shooting")], passing: +c[ix("Passing")], dribbling: +c[ix("Dribbling")], defending: +c[ix("Defending")], physical: +c[ix("Physicality")] };
      if (!byNacNome.has(row.nac)) byNacNome.set(row.nac, new Map());
      if (!byNacNome.get(row.nac)!.has(row.nome_n)) byNacNome.get(row.nac)!.set(row.nome_n, row);
      if (!glob.has(row.nome_n)) glob.set(row.nome_n, []);
      glob.get(row.nome_n)!.push(row);
    }
    const nossos = (await pool.query("SELECT athlete_id, nome, selecao FROM jogadores_365")).rows as any[];
    await setStatus({ rodando: true, fase: "casando", feitos: 0, total: nossos.length });
    let casados = 0, k = 0;
    for (const j of nossos) {
      const nn = norm(j.nome), nac = norm(j.selecao);
      let m = byNacNome.get(nac)?.get(nn) || null;
      if (!m) { const g = glob.get(nn); if (g && g.length === 1) m = g[0]; }
      if (m) {
        await pool.query("UPDATE jogadores_365 SET fc_id=$1,pace=$2,shooting=$3,passing=$4,dribbling=$5,defending=$6,physical=$7,pe=$8,fc_pos=$9,fc_time=$10 WHERE athlete_id=$11",
          [m.fc_id, m.pace, m.shooting, m.passing, m.dribbling, m.defending, m.physical, m.pe, m.pos, m.time, j.athlete_id]);
        casados++;
      }
      k++; if (k % 200 === 0) await setStatus({ rodando: true, fase: "casando", feitos: k, total: nossos.length, casados });
    }
    await setStatus({ rodando: false, fase: "concluido", feitos: nossos.length, total: nossos.length, casados, csv: lines.length - 1 });
    await setCfg("casar_fc26", "");
    console.log("[fc26] casados", casados, "de", nossos.length);
    return { ok: true, casados, total: nossos.length };
  } finally { RODANDO_FC = false; }
}
export function casarFc26SeFlag(): void { (async () => { try { if ((await cfg("casar_fc26")) === "go" && !RODANDO_FC) casarFc26().catch((e: any) => console.log("[fc26] erro", String(e?.message ?? e))); } catch {} })(); }

export async function rotasFc26(app: FastifyInstance) {
  app.post("/admin/fc26/casar", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); await setCfg("casar_fc26", "go"); casarFc26SeFlag(); return { ok: true, iniciado: true }; });
  app.get("/admin/fc26/status", async (req, reply) => { if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" }); let st: any = {}; try { st = JSON.parse((await cfg("fc26_status")) || "{}"); } catch {} const comAttr = Number(((await pool.query("SELECT count(*) n FROM jogadores_365 WHERE pace IS NOT NULL")).rows[0] as any)?.n || 0); return { ok: true, status: st, comAtributos: comAttr }; });
}
