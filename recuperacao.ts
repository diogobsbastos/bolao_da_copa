// ===== Recuperacao de senha (self-service) — usa o motor de e-mail (email.ts) =====
import type { FastifyInstance } from "fastify";
import { randomBytes, scryptSync } from "node:crypto";
import { pool } from "./db.js";
import { enviarEmail, htmlEmail, emailConfigurado } from "./email.js";

function hashSenha(senha: string): string {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(senha, salt, 64).toString("hex");
}
async function cfg(k: string): Promise<string> {
  try { const { rows } = await pool.query("SELECT valor FROM config WHERE chave=$1", [k]); return (rows as any[])[0]?.valor ?? ""; } catch { return ""; }
}
async function baseUrl(): Promise<string> { return (await cfg("base_url_publica")) || "https://oracle-vipworks.duckdns.org/bolao-copa26"; }

async function ensureTabela(): Promise<void> {
  await pool.query(`CREATE TABLE IF NOT EXISTS senha_resets (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expira_em TIMESTAMPTZ NOT NULL,
    usado BOOLEAN DEFAULT false,
    criado_em TIMESTAMPTZ DEFAULT now()
  )`);
  await pool.query("CREATE INDEX IF NOT EXISTS idx_senha_resets_token ON senha_resets(token)");
}

function mascara(email: string): string {
  const [u, d] = String(email).split("@"); if (!d) return email;
  const vis = u.slice(0, 2);
  return vis + "***@" + d;
}

export async function rotasRecuperacao(app: FastifyInstance) {
  await ensureTabela();

  // pede o link de redefinicao (nao vaza se o email existe)
  app.post("/esqueci-senha", async (req) => {
    const email = String((req.body as any)?.email || "").trim().toLowerCase();
    const resp = { ok: true, msg: "Se este e-mail estiver cadastrado, enviamos um link de redefinição. Confira sua caixa de entrada (e o spam)." };
    if (!email || !email.includes("@")) return resp;
    try {
      const u = (await pool.query("SELECT id FROM usuarios WHERE lower(email)=lower($1)", [email])).rows[0] as any;
      if (!u || !(await emailConfigurado())) return resp;
      const token = randomBytes(24).toString("hex");
      await pool.query("INSERT INTO senha_resets (usuario_id, token, expira_em) VALUES ($1,$2, now() + interval '1 hour')", [u.id, token]);
      const link = (await baseUrl()) + "/?reset=" + token;
      const html = htmlEmail("Redefinir sua senha", "Recebemos um pedido para redefinir a senha da sua conta no Bolão Copa 26.\nClique no botão abaixo para criar uma nova senha — o link vale por 1 hora.\nSe não foi você que pediu, pode ignorar este e-mail com segurança.", "Redefinir minha senha", link);
      await enviarEmail(email, "Redefinir senha — Bolão Copa 26", html);
      console.log("[recuperacao] link enviado p/ usuario", u.id);
    } catch (e) { console.error("[recuperacao] erro esqueci:", (e as any)?.message || e); }
    return resp;
  });

  // valida token e devolve email mascarado (pra tela de nova senha)
  app.get("/reset-info", async (req) => {
    const token = String((req.query as any)?.token || "").trim();
    if (!token) return { ok: false };
    const r = (await pool.query("SELECT u.email FROM senha_resets s JOIN usuarios u ON u.id=s.usuario_id WHERE s.token=$1 AND s.usado=false AND s.expira_em > now()", [token])).rows[0] as any;
    if (!r) return { ok: false, erro: "link inválido ou expirado" };
    return { ok: true, email: mascara(r.email) };
  });

  // define a nova senha
  app.post("/resetar-senha", async (req, reply) => {
    const b = (req.body || {}) as any;
    const token = String(b.token || "").trim();
    const senha = String(b.senha || "");
    if (!token) return reply.code(400).send({ erro: "token ausente" });
    if (senha.length < 4) return reply.code(400).send({ erro: "a senha precisa de pelo menos 4 caracteres" });
    const s = (await pool.query("SELECT id, usuario_id FROM senha_resets WHERE token=$1 AND usado=false AND expira_em > now()", [token])).rows[0] as any;
    if (!s) return reply.code(400).send({ erro: "link inválido ou expirado — peça um novo" });
    await pool.query("UPDATE usuarios SET senha_hash=$2 WHERE id=$1", [s.usuario_id, hashSenha(senha)]);
    await pool.query("UPDATE senha_resets SET usado=true WHERE usuario_id=$1 AND usado=false", [s.usuario_id]);
    return { ok: true };
  });
}
