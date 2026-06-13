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
      const c = (await pool.query("SELECT COALESCE(sum(saldo),0) total FROM usuarios_carteiras")).rows[0] as any;
      out.tokens.total = N(c.total);
    } catch {}
    try {
      const g = (await pool.query("SELECT COALESCE(sum(custo_brl),0) gasto, count(*)::int ops FROM gastos_log")).rows[0] as any;
      out.infra.gasto_brl = N(g.gasto); out.infra.ops = N(g.ops);
    } catch {}
    try { out.dolar = N((await pool.query("SELECT valor FROM custos_meta WHERE chave='dolar_brl'")).rows[0]?.valor) || 5.2; } catch {}
    try {
      const dep = N((await pool.query("SELECT COALESCE(sum(valor),0) v FROM depositos WHERE creditado=true")).rows[0]?.v);
      const pat = N((await pool.query("SELECT COALESCE(sum(valor),0) v FROM patrocinadores WHERE status='ativo'")).rows[0]?.v);
      out.real.arrecadado = dep + pat;
      out.real.sacado = 0; // sem saque (lei 14.790)
      out.real.saldo = dep + pat;
      (out.real as any).depositos = dep; (out.real as any).patrocinio = pat;
    } catch {}
    return out;
  });

  app.get("/admin/tokenomics/usuarios", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const rows = (await pool.query(`
      SELECT u.id, COALESCE(u.nome,'') AS nome, u.email,
             COALESCE(u.pagou,false) AS pagou, COALESCE(u.acesso_full,false) AS full,
             u.tipo_entrada, u.papel, u.referido_por,
             r.nome AS conv_nome, r.email AS conv_email, r.papel AS conv_papel,
             COALESCE(u.full_usado,false) AS full_usado,
             (SELECT count(*)::int FROM usuarios z WHERE z.referido_por = u.id) AS convidou_qtd,
             (SELECT string_agg(COALESCE(NULLIF(z.nome,''), z.email), ', ' ORDER BY z.id) FROM usuarios z WHERE z.referido_por = u.id) AS convidados,
             COALESCE(c.saldo,0) AS saldo,
             (CASE WHEN jsonb_typeof(u.escalacao)='object' THEN (SELECT count(*) FROM jsonb_object_keys(u.escalacao))>=11 ELSE false END) AS tem_time,
             to_char(u.criado_em AT TIME ZONE 'America/Sao_Paulo','DD/MM HH24:MI') AS criado
        FROM usuarios u
        LEFT JOIN usuarios r ON r.id = u.referido_por
        LEFT JOIN usuarios_carteiras c ON c.usuario_id = u.id
       ORDER BY u.id`)).rows as any[];
    const jog = rows.filter((u) => u.papel !== "admin");
    const resumo = {
      total: jog.length,
      pagantes: jog.filter((u) => u.pagou).length,
      gratis_full: jog.filter((u) => u.tipo_entrada === "full_gift").length,
      indicacao: jog.filter((u) => u.tipo_entrada === "indicacao" && !u.pagou).length,
      direto: jog.filter((u) => !u.pagou && !u.tipo_entrada).length,
      convidaram: jog.filter((u) => u.convidou_qtd > 0).length,
    };
    return { ok: true, lista: rows, resumo };
  });
}
