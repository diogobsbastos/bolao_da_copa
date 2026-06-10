import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { aplicarEntrada } from "./indicacao.js";
import { pool } from "./db.js";

function verifica(senha: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const h = scryptSync(senha, salt, 64);
  const hb = Buffer.from(hash, "hex");
  return h.length === hb.length && timingSafeEqual(h, hb);
}

async function cfg(chave: string): Promise<string | null> {
  const { rows } = await pool.query("SELECT valor FROM config WHERE chave=$1", [chave]);
  return (rows[0]?.valor as string) ?? null;
}

async function novaSessao(usuarioId: number): Promise<string> {
  const token = randomBytes(24).toString("hex");
  await pool.query(
    "INSERT INTO sessoes (token, usuario_id, expira) VALUES ($1,$2, now() + interval '7 days')",
    [token, usuarioId]
  );
  return token;
}

async function criarJogador(email: string, nome: string | null, senhaHash: string, codigo?: string | null): Promise<number> {
  const ref = randomBytes(4).toString("hex").toUpperCase();
  const ins = await pool.query(
    "INSERT INTO usuarios (email, senha_hash, nome, codigo_referral, papel) VALUES ($1,$2,$3,$4,'jogador') RETURNING id",
    [email, senhaHash, nome, ref]
  );
  const id = ins.rows[0].id as number;
  await pool.query("INSERT INTO usuarios_carteiras (usuario_id) VALUES ($1)", [id]);
  await pool.query(
    `INSERT INTO transacoes_tokens (usuario_id, carteira, valor, saldo_apos, tipo)
     VALUES ($1,'token',500,500,'cadastro')`,
    [id]
  );
  await pool.query("INSERT INTO ranking (usuario_id) VALUES ($1)", [id]);
  if (codigo) { try { await aplicarEntrada(id, codigo); } catch {} }
  return id;
}

export async function usuarioDaReq(
  req: FastifyRequest
): Promise<{ id: number; papel: string; nome: string | null; email: string } | null> {
  const auth = req.headers["authorization"];
  const token = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const { rows } = await pool.query(
    `SELECT u.id, u.papel, u.nome, u.email
       FROM sessoes s JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.token = $1 AND s.expira > now()`,
    [token]
  );
  return (rows[0] as any) ?? null;
}

export async function rotasAuth(app: FastifyInstance) {
  app.post("/login", async (req, reply) => {
    const { email, senha } = (req.body ?? {}) as { email?: string; senha?: string };
    if (!email || !senha) return reply.code(400).send({ erro: "email e senha obrigatorios" });
    const { rows } = await pool.query(
      "SELECT id, senha_hash, nome, papel FROM usuarios WHERE lower(email)=lower($1)",
      [email]
    );
    const u = rows[0] as any;
    if (!u || !verifica(senha, u.senha_hash)) return reply.code(401).send({ erro: "credenciais invalidas" });
    const token = await novaSessao(u.id);
    return { token, papel: u.papel, nome: u.nome, id: u.id };
  });

  app.post("/logout", async (req) => {
    const auth = req.headers["authorization"];
    const token = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (token) await pool.query("DELETE FROM sessoes WHERE token=$1", [token]);
    return { ok: true };
  });

  app.get("/me", async (req, reply) => {
    const u = await usuarioDaReq(req);
    if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    return u;
  });

  app.get("/auth/google/clientid", async () => {
    return { clientId: (await cfg("google_client_id")) ?? "" };
  });

  app.post("/auth/google", async (req, reply) => {
    const { credential, codigo } = (req.body ?? {}) as { credential?: string; codigo?: string };
    if (!credential) return reply.code(400).send({ erro: "sem credential" });
    const clientId = await cfg("google_client_id");
    if (!clientId) return reply.code(500).send({ erro: "google nao configurado" });
    if (typeof fetch !== "function") return reply.code(500).send({ erro: "fetch indisponivel" });
    let info: any;
    try {
      info = await fetch(
        "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(credential)
      ).then((r) => r.json());
    } catch {
      return reply.code(502).send({ erro: "falha ao validar com o google" });
    }
    const emailOk = info && info.email && (info.email_verified === "true" || info.email_verified === true);
    if (!info || info.aud !== clientId || !emailOk) {
      return reply.code(401).send({ erro: "token google invalido" });
    }
    const email = String(info.email).toLowerCase();
    const nome = (info.name as string) ?? null;
    const ex = await pool.query("SELECT id, papel, nome FROM usuarios WHERE lower(email)=lower($1)", [email]);
    let id: number;
    let papel: string;
    let nomeU: string | null;
    if (ex.rows[0]) {
      id = ex.rows[0].id;
      papel = ex.rows[0].papel;
      nomeU = ex.rows[0].nome ?? nome;
    } else {
      id = await criarJogador(email, nome, "google:" + randomBytes(16).toString("hex"), codigo);
      papel = "jogador";
      nomeU = nome;
    }
    const token = await novaSessao(id);
    return { token, papel, nome: nomeU };
  });
}
