import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";
import { aoPagar } from "./indicacao.js";

const MP = "https://api.mercadopago.com";

async function cfg(k: string): Promise<string> { try { const { rows } = await pool.query("SELECT valor FROM config WHERE chave=$1", [k]); return (rows as any[])[0]?.valor ?? ""; } catch { return ""; } }
async function setCfg(k: string, v: string): Promise<void> { try { await pool.query("INSERT INTO config (chave,valor) VALUES ($1,$2) ON CONFLICT (chave) DO UPDATE SET valor=$2, atualizado_em=now()", [k, v]); } catch {} }
async function admOk(req: FastifyRequest): Promise<boolean> { const t = req.headers["x-admin-token"]; const e = process.env.ADMIN_TOKEN ?? ""; if (e && t === e) return true; const u = await usuarioDaReq(req); return u?.papel === "admin"; }

async function mpFetch(path: string, opts: any = {}): Promise<{ status: number; body: any }> {
  const tok = await cfg("mp_access_token");
  const r = await fetch(MP + path, { ...opts, headers: { "authorization": "Bearer " + tok, "content-type": "application/json", ...(opts.headers || {}) } });
  return { status: r.status, body: await r.json().catch(() => ({})) };
}

// Concede o pacote base (11 figurinhas por posicao) — idempotente.
async function creditarDeposito(depId: number): Promise<boolean> {
  const upd = await pool.query("UPDATE depositos SET creditado=true, status='approved', pago_em=COALESCE(pago_em,now()) WHERE id=$1 AND creditado=false RETURNING usuario_id", [depId]);
  if (!upd.rowCount) return false;
  const uid = (upd.rows[0] as any).usuario_id;
  const plano: [string, number][] = [["Goalkeeper", 1], ["Defence", 4], ["Midfield", 4], ["Offence", 2]];
  for (const [pos, n] of plano) {
    const cards = (await pool.query("SELECT id FROM jogadores WHERE posicao=$1 AND figurinha IS NOT NULL ORDER BY random() LIMIT $2", [pos, n])).rows as any[];
    for (const c of cards) await pool.query("INSERT INTO inventario_figurinhas (usuario_id, jogador_id, origem) VALUES ($1,$2,'pacote_base')", [uid, c.id]);
  }
  try { await pool.query("UPDATE usuarios_carteiras SET saldo = saldo WHERE usuario_id=$1", [uid]); } catch {}
  try { await aoPagar(uid); } catch {}
  console.log("[pagamento] pacote base creditado p/ usuario", uid, "deposito", depId);
  return true;
}

export async function rotasPagamento(app: FastifyInstance) {
  // ----- Jogador: cria deposito PIX e devolve o QR -----
  app.post("/jogar/deposito/criar", async (req, reply) => {
    const u = await usuarioDaReq(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const tok = await cfg("mp_access_token"); if (!tok) return { ok: false, erro: "pagamento ainda nao configurado pelo admin" };
    const valor = Number((await cfg("preco_pacote_base")) || "10");
    const dep = (await pool.query("INSERT INTO depositos (usuario_id, valor, produto, status) VALUES ($1,$2,'pacote_base','pendente') RETURNING id", [u.id, valor])).rows[0] as any;
    const base = (await cfg("base_url_publica")) || "https://oracle-vipworks.duckdns.org";
    const payload = { transaction_amount: valor, description: "Pacote Base - Bolao Copa 26", payment_method_id: "pix", external_reference: String(dep.id), notification_url: base + "/pagamento/webhook", payer: { email: u.email || ("jogador" + u.id + "@bolaocopa26.com") } };
    const r = await mpFetch("/v1/payments", { method: "POST", body: JSON.stringify(payload), headers: { "x-idempotency-key": "dep-" + dep.id } });
    const tx = r.body?.point_of_interaction?.transaction_data;
    if (!tx || !tx.qr_code) { console.log("[pagamento] MP falhou status", r.status, "body", JSON.stringify(r.body).slice(0,800)); await pool.query("UPDATE depositos SET status='erro' WHERE id=$1", [dep.id]); return { ok: false, erro: (r.body?.message || "falha ao gerar PIX"), detalhe: (r.body?.cause || r.body?.error || null) }; }
    await pool.query("UPDATE depositos SET mp_payment_id=$1, qr_code=$2, qr_base64=$3, ticket_url=$4, status=$5 WHERE id=$6", [String(r.body.id), tx.qr_code, tx.qr_code_base64 || "", tx.ticket_url || "", r.body.status || "pending", dep.id]);
    return { ok: true, id: dep.id, valor, qr_code: tx.qr_code, qr_base64: tx.qr_code_base64, ticket_url: tx.ticket_url, teste: tok.startsWith("TEST-") };
  });

  // ----- Jogador: status (poll) — re-checa no MP e credita se aprovado -----
  app.get("/jogar/deposito/status", async (req, reply) => {
    const u = await usuarioDaReq(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const id = Number((req.query as any)?.id || 0);
    const dep = (await pool.query("SELECT * FROM depositos WHERE id=$1 AND usuario_id=$2", [id, u.id])).rows[0] as any;
    if (!dep) return { ok: false, erro: "deposito nao existe" };
    if (!dep.creditado && dep.mp_payment_id) {
      const r = await mpFetch("/v1/payments/" + dep.mp_payment_id);
      const st = r.body?.status;
      if (st && st !== dep.status) await pool.query("UPDATE depositos SET status=$1 WHERE id=$2", [st, dep.id]);
      if (st === "approved") await creditarDeposito(dep.id);
    }
    const fr = (await pool.query("SELECT status, creditado FROM depositos WHERE id=$1", [id])).rows[0] as any;
    let figs = 0; if (fr.creditado) figs = Number(((await pool.query("SELECT count(*) n FROM inventario_figurinhas WHERE usuario_id=$1", [u.id])).rows[0] as any)?.n || 0);
    return { ok: true, status: fr.status, creditado: fr.creditado, figurinhas: figs };
  });

  // ----- (Sandbox) Jogador: simular aprovacao do PIX p/ testar o fluxo (so com token de TESTE) -----
  app.post("/jogar/deposito/simular", async (req, reply) => {
    const u = await usuarioDaReq(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const tok = await cfg("mp_access_token"); if (!tok.startsWith("TEST-")) return { ok: false, erro: "simulacao so disponivel em modo de teste" };
    const id = Number((req.body as any)?.id || 0);
    const dep = (await pool.query("SELECT id FROM depositos WHERE id=$1 AND usuario_id=$2", [id, u.id])).rows[0] as any;
    if (!dep) return { ok: false, erro: "deposito nao existe" };
    await creditarDeposito(id);
    return { ok: true };
  });

  // ----- Webhook do Mercado Pago -----
  app.post("/pagamento/webhook", async (req, reply) => {
    try {
      const b = (req.body ?? {}) as any; const q = (req.query ?? {}) as any;
      const payId = b?.data?.id || q["data.id"] || q.id; const tipo = b?.type || q.type || q.topic;
      if (payId && (tipo === "payment" || tipo === undefined)) {
        const r = await mpFetch("/v1/payments/" + payId);
        const st = r.body?.status; const extRef = r.body?.external_reference;
        if (extRef) { await pool.query("UPDATE depositos SET status=$1, mp_payment_id=$2 WHERE id=$3", [st || "pending", String(payId), Number(extRef)]); if (st === "approved") await creditarDeposito(Number(extRef)); }
      }
    } catch {}
    return reply.code(200).send({ ok: true });
  });

  // ----- Jogador: inventario (figurinhas liberadas) -----
  app.get("/jogar/inventario", async (req, reply) => {
    const u = await usuarioDaReq(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const rows = (await pool.query("SELECT j.id, j.nome, j.posicao, j.selecao, j.raridade, j.figurinha FROM inventario_figurinhas i JOIN jogadores j ON j.id=i.jogador_id WHERE i.usuario_id=$1 ORDER BY i.criado_em DESC", [u.id])).rows as any[];
    return { ok: true, figurinhas: rows };
  });

  // ----- Admin: config do Hub de Pagamento -----
  app.get("/admin/pagamento", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const tok = await cfg("mp_access_token");
    const preco = (await cfg("preco_pacote_base")) || "10";
    let conta: any = null;
    if (tok) { try { const r = await mpFetch("/users/me"); if (r.status === 200) conta = { id: r.body?.id, nick: r.body?.nickname, email: r.body?.email, nome: [r.body?.first_name, r.body?.last_name].filter(Boolean).join(" "), site: r.body?.site_id, tipo: r.body?.user_type }; } catch {} }
    const tot = Number(((await pool.query("SELECT count(*) n FROM depositos WHERE creditado=true")).rows[0] as any)?.n || 0);
    const arrec = Number(((await pool.query("SELECT COALESCE(sum(valor),0) v FROM depositos WHERE creditado=true")).rows[0] as any)?.v || 0);
    return { ok: true, configurado: !!tok, teste: tok.startsWith("TEST-"), tokenMasc: tok ? (tok.slice(0, 8) + "..." + tok.slice(-6)) : "", preco, conta, depositosPagos: tot, arrecadado: arrec };
  });
  app.post("/admin/pagamento", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    if (typeof b.token === "string" && b.token.trim()) await setCfg("mp_access_token", b.token.trim());
    if (b.preco != null && Number(b.preco) > 0) await setCfg("preco_pacote_base", String(Number(b.preco)));
    return { ok: true };
  });
  app.post("/admin/pagamento/testar", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    try { const r = await mpFetch("/users/me"); if (r.status === 200) return { ok: true, conta: { nick: r.body?.nickname, email: r.body?.email, id: r.body?.id } }; return { ok: false, erro: (r.body?.message || ("HTTP " + r.status)) }; } catch (e: any) { return { ok: false, erro: String(e?.message ?? e).slice(0, 120) }; }
  });
}
