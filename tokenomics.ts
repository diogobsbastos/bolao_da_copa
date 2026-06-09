import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";
import { PAGINA } from "./tokenomics_page.js";

async function admOk(req: FastifyRequest): Promise<boolean> {
  const t = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (expected && t === expected) return true;
  const u = await usuarioDaReq(req);
  return u?.papel === "admin";
}
const N = (v: any) => (v === null || v === undefined || v === "" ? 0 : Number(v));

export async function rotasTokenomics(app: FastifyInstance) {
  app.get("/admin/tokenomics", async (_req, reply) => reply.type("text/html").send(PAGINA));

  app.get("/admin/tokenomics/resumo", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const out: any = {
      usuarios: 0,
      tokens: { col: 0, apo: 0, are: 0, total: 0 },
      real: { arrecadado: 0, sacado: 0, saldo: 0 },
      infra: { gasto_brl: 0, ops: 0 },
      dolar: 5.2,
    };
    try { out.usuarios = N((await pool.query("SELECT count(*)::int n FROM usuarios")).rows[0]?.n); } catch {}
    try {
      const c = (await pool.query("SELECT COALESCE(sum(saldo_colecionador),0) col, COALESCE(sum(saldo_apostas),0) apo, COALESCE(sum(saldo_arena),0) are FROM usuarios_carteiras")).rows[0] as any;
      out.tokens.col = N(c.col); out.tokens.apo = N(c.apo); out.tokens.are = N(c.are);
      out.tokens.total = out.tokens.col + out.tokens.apo + out.tokens.are;
    } catch {}
    try {
      const g = (await pool.query("SELECT COALESCE(sum(custo_brl),0) gasto, count(*)::int ops FROM gastos_log")).rows[0] as any;
      out.infra.gasto_brl = N(g.gasto); out.infra.ops = N(g.ops);
    } catch {}
    try { out.dolar = N((await pool.query("SELECT valor FROM custos_meta WHERE chave='dolar_brl'")).rows[0]?.valor) || 5.2; } catch {}
    try {
      const has = (await pool.query("SELECT to_regclass('public.pagamentos') t")).rows[0] as any;
      if (has?.t) {
        const p = (await pool.query("SELECT COALESCE(sum(CASE WHEN tipo='entrada' THEN valor ELSE 0 END),0) ent, COALESCE(sum(CASE WHEN tipo='saque' THEN valor ELSE 0 END),0) sai FROM pagamentos WHERE status='ok'")).rows[0] as any;
        out.real.arrecadado = N(p.ent); out.real.sacado = N(p.sai); out.real.saldo = N(p.ent) - N(p.sai);
      }
    } catch {}
    return out;
  });
}
