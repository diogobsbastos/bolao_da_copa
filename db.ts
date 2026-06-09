import { Pool } from "pg";

/**
 * Pool de conexões com o banco dedicado `bolao_copa26` (Servidor A).
 * Credenciais vêm do ambiente (.env / systemd) — nunca hardcoded.
 */
export const pool = new Pool({
  host: process.env.PGHOST ?? "127.0.0.1",
  port: Number(process.env.PGPORT ?? 5432),
  user: process.env.PGUSER ?? "innova_worker",
  password: process.env.PGPASSWORD ?? "",
  database: process.env.PGDATABASE ?? "bolao_copa26",
  max: 10,
});

/** Testa a conexão (usado pelo /health). */
export async function pingDb(): Promise<boolean> {
  const { rows } = await pool.query<{ ok: number }>("SELECT 1 AS ok");
  return rows[0]?.ok === 1;
}
