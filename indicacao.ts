import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";
import { randomBytes } from "node:crypto";

const novoCodigo = () => randomBytes(5).toString("hex").toUpperCase();
async function cfg(k: string): Promise<string> { try { const { rows } = await pool.query("SELECT valor FROM config WHERE chave=$1", [k]); return (rows as any[])[0]?.valor ?? ""; } catch { return ""; } }
async function baseUrl(): Promise<string> { return (await cfg("base_url_publica")) || "https://oracle-vipworks.duckdns.org"; }

async function creditarTokens(uid: number, valor: number, tipo: string): Promise<void> {
  const r = (await pool.query("UPDATE usuarios_carteiras SET saldo=saldo+$2 WHERE usuario_id=$1 RETURNING saldo", [uid, valor])).rows[0] as any;
  if (!r) return;
  try { await pool.query("INSERT INTO transacoes_tokens (usuario_id,carteira,valor,saldo_apos,tipo) VALUES ($1,'token',$2,$3,$4)", [uid, valor, r.saldo, tipo]); } catch {}
}
async function grantPacote(uid: number, n: number, origem: string): Promise<void> {
  const cards = (await pool.query("SELECT id FROM jogadores WHERE figurinha IS NOT NULL ORDER BY random() LIMIT $1", [n])).rows as any[];
  for (const c of cards) await pool.query("INSERT INTO inventario_figurinhas (usuario_id, jogador_id, origem) VALUES ($1,$2,$3)", [uid, c.id, origem]);
}
async function grantPacoteBase(uid: number): Promise<void> {
  const plano: [string, number][] = [["Goalkeeper", 1], ["Defence", 4], ["Midfield", 4], ["Offence", 2]];
  for (const [pos, n] of plano) { const cards = (await pool.query("SELECT id FROM jogadores WHERE posicao=$1 AND figurinha IS NOT NULL ORDER BY random() LIMIT $2", [pos, n])).rows as any[]; for (const c of cards) await pool.query("INSERT INTO inventario_figurinhas (usuario_id, jogador_id, origem) VALUES ($1,$2,'pacote_base')", [uid, c.id]); }
}

// Aplica o codigo de convite no cadastro. codigo pode ser referral normal OU full_code.
export async function aplicarEntrada(novoId: number, codigo: string | null | undefined): Promise<void> {
  const cod = String(codigo || "").trim().toUpperCase(); if (!cod) return;
  try {
    const full = (await pool.query("SELECT id, nome, full_usado, pagou FROM usuarios WHERE full_code=$1", [cod])).rows[0] as any;
    if (full && !full.full_usado && full.pagou) {
      await pool.query("UPDATE usuarios SET full_usado=true WHERE id=$1", [full.id]);
      await pool.query("UPDATE usuarios SET acesso_full=true, tipo_entrada='full_gift', referido_por=$2 WHERE id=$1", [novoId, full.id]);
      await grantPacoteBase(novoId);
      await pool.query("INSERT INTO indicacoes (referrer_id, indicado_id, tipo, status) VALUES ($1,$2,'full','entrou')", [full.id, novoId]);
      console.log("[indicacao] convite FULL usado: referrer", full.id, "-> novo", novoId);
      return;
    }
    const ref = (await pool.query("SELECT id FROM usuarios WHERE codigo_referral=$1", [cod])).rows[0] as any;
    if (ref && ref.id !== novoId) {
      await pool.query("UPDATE usuarios SET referido_por=$2, tipo_entrada='indicacao' WHERE id=$1", [novoId, ref.id]);
      await pool.query("INSERT INTO indicacoes (referrer_id, indicado_id, tipo, status) VALUES ($1,$2,'normal','entrou')", [ref.id, novoId]);
      console.log("[indicacao] indicacao normal: referrer", ref.id, "-> novo", novoId);
    }
  } catch (e: any) { console.log("[indicacao] erro aplicarEntrada", String(e?.message ?? e)); }
}

// Chamado quando o usuario PAGA (deposito aprovado): vira full, ganha 1 convite full, e premia quem o indicou.
export async function aoPagar(uid: number): Promise<void> {
  try {
    await pool.query("UPDATE usuarios SET acesso_full=true, pagou=true, full_code=COALESCE(full_code,$2) WHERE id=$1", [uid, novoCodigo()]);
    const u = (await pool.query("SELECT referido_por FROM usuarios WHERE id=$1", [uid])).rows[0] as any;
    const ref = u?.referido_por;
    if (ref) {
      const ind = (await pool.query("UPDATE indicacoes SET status='pago', pago_em=now(), recompensa_dada=true WHERE referrer_id=$1 AND indicado_id=$2 AND tipo='normal' AND recompensa_dada=false RETURNING id", [ref, uid])).rows[0] as any;
      if (ind) { await creditarTokens(ref, 50, "referral"); await grantPacote(ref, 5, "indicacao"); console.log("[indicacao] recompensa p/ referrer", ref, "por indicado", uid); }
    }
  } catch (e: any) { console.log("[indicacao] erro aoPagar", String(e?.message ?? e)); }
}

export async function rotasIndicacao(app: FastifyInstance) {
  // info publica do convite (pra tela "Fulano te convidou")
  app.get("/convite/info", async (req, reply) => {
    const cod = String((req.query as any)?.code || "").trim().toUpperCase(); if (!cod) return { ok: false };
    const full = (await pool.query("SELECT nome, full_usado FROM usuarios WHERE full_code=$1 AND pagou=true", [cod])).rows[0] as any;
    if (full) return { ok: true, nome: full.nome || "Um amigo", tipo: "full", disponivel: !full.full_usado };
    const ref = (await pool.query("SELECT nome FROM usuarios WHERE codigo_referral=$1", [cod])).rows[0] as any;
    if (ref) return { ok: true, nome: ref.nome || "Um amigo", tipo: "normal", disponivel: true };
    return { ok: false };
  });

  // dados de indicacao do jogador (tela Convidar)
  app.get("/jogar/indicacao", async (req, reply) => {
    const u = await usuarioDaReq(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const me = (await pool.query("SELECT codigo_referral, full_code, full_usado, pagou, acesso_full FROM usuarios WHERE id=$1", [u.id])).rows[0] as any;
    const base = await baseUrl();
    const ind = (await pool.query("SELECT count(*) tot, count(*) FILTER (WHERE status='pago') pagos FROM indicacoes WHERE referrer_id=$1 AND tipo='normal'", [u.id])).rows[0] as any;
    return {
      ok: true, pagou: !!me?.pagou, acessoFull: !!me?.acesso_full,
      refLink: base + "/?ref=" + (me?.codigo_referral || ""),
      fullLink: (me?.pagou && me?.full_code && !me?.full_usado) ? (base + "/?full=" + me.full_code) : null,
      fullUsado: !!me?.full_usado,
      indicados: Number(ind?.tot || 0), convertidos: Number(ind?.pagos || 0), tokensGanhos: Number(ind?.pagos || 0) * 50,
    };
  });

  // resgatar um convite full estando logado (sem pagar)
  app.post("/jogar/resgatar-full", async (req, reply) => {
    const u = await usuarioDaReq(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const cod = String((req.body as any)?.code || "").trim().toUpperCase(); if (!cod) return { ok: false, erro: "informe o código" };
    const full = (await pool.query("SELECT id, full_usado, pagou FROM usuarios WHERE full_code=$1", [cod])).rows[0] as any;
    if (!full || !full.pagou) return { ok: false, erro: "convite inválido" };
    if (full.full_usado) return { ok: false, erro: "convite já utilizado" };
    if (full.id === u.id) return { ok: false, erro: "você não pode usar o próprio convite" };
    await pool.query("UPDATE usuarios SET full_usado=true WHERE id=$1", [full.id]);
    await pool.query("UPDATE usuarios SET acesso_full=true, tipo_entrada='full_gift', referido_por=COALESCE(referido_por,$2) WHERE id=$1", [u.id, full.id]);
    await grantPacoteBase(u.id);
    await pool.query("INSERT INTO indicacoes (referrer_id, indicado_id, tipo, status) VALUES ($1,$2,'full','entrou')", [full.id, u.id]);
    return { ok: true };
  });
}
