import type { FastifyInstance } from "fastify";
import { randomBytes, scryptSync } from "node:crypto";
import { pool } from "./db.js";

function hashSenha(senha: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function gerarReferral(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

interface CadastroBody {
  email?: string; senha?: string; nome?: string; telefone?: string; referral?: string; codigo?: string;
}

import { aplicarEntrada } from "./indicacao.js";

export async function rotasUsuarios(app: FastifyInstance) {
  // Cadastro: cria usuário + 3 carteiras (200/200/100) + ledger inicial + ranking.
  app.post("/usuarios", async (req, reply) => {
    const b = (req.body ?? {}) as CadastroBody;
    if (!b.email || !b.senha) return reply.code(400).send({ erro: "email e senha são obrigatórios" });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      let referidoPor: number | null = null;
      if (b.referral) {
        const r = await client.query("SELECT id FROM usuarios WHERE codigo_referral=$1", [b.referral]);
        referidoPor = r.rows[0]?.id ?? null;
      }
      const u = await client.query(
        `INSERT INTO usuarios (email, senha_hash, nome, telefone, codigo_referral, referido_por)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, codigo_referral`,
        [b.email, hashSenha(b.senha), b.nome ?? null, b.telefone ?? null, gerarReferral(), referidoPor]
      );
      const id = u.rows[0].id as number;
      await client.query("INSERT INTO usuarios_carteiras (usuario_id) VALUES ($1)", [id]);
      await client.query(
        `INSERT INTO transacoes_tokens (usuario_id, carteira, valor, saldo_apos, tipo)
         VALUES ($1,'token',500,500,'cadastro')`,
        [id]
      );
      await client.query("INSERT INTO ranking (usuario_id) VALUES ($1)", [id]);
      await client.query("COMMIT");
      try { if (b.codigo || b.referral) await aplicarEntrada(id, b.codigo || b.referral); } catch {}
      return reply.code(201).send({
        id,
        codigo_referral: u.rows[0].codigo_referral,
        carteiras: { saldo: 500 },
      });
    } catch (e: any) {
      await client.query("ROLLBACK");
      if (e?.code === "23505") return reply.code(409).send({ erro: "email já cadastrado" });
      req.log.error(e);
      return reply.code(500).send({ erro: "falha no cadastro" });
    } finally {
      client.release();
    }
  });

  // Saldos das 3 carteiras de um usuário.
  app.get("/usuarios/:id/carteiras", async (req, reply) => {
    const { id } = req.params as { id: string };
    const r = await pool.query(
      "SELECT saldo FROM usuarios_carteiras WHERE usuario_id=$1",
      [id]
    );
    if (!r.rows[0]) return reply.code(404).send({ erro: "usuário não encontrado" });
    return r.rows[0];
  });
}
