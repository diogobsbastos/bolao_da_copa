import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";

async function admOk(req: FastifyRequest): Promise<boolean> {
  const t = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (expected && t === expected) return true;
  const u = await usuarioDaReq(req);
  return u?.papel === "admin";
}
async function tokenFD(): Promise<string | null> {
  const { rows } = await pool.query("SELECT valor FROM config WHERE chave='football_data_token'");
  return (rows[0]?.valor as string) ?? null;
}

export async function rotasElencos(app: FastifyInstance) {
  app.get("/admin/jogadores", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const { rows } = await pool.query(
      `SELECT j.id, j.nome, COALESCE(j.posicao,'') AS posicao, j.selecao, j.figurinha,
              COALESCE(f.raridade='gerada', false) AS gerada
         FROM jogadores j LEFT JOIN figurinhas f ON f.jogador_id = j.id
        ORDER BY j.selecao, j.posicao, j.nome`
    );
    const { rows: sel } = await pool.query(
      `SELECT j.selecao, count(*)::int AS qtd,
              count(*) FILTER (WHERE f.raridade IS NOT NULL AND f.raridade <> 'gerada')::int AS reais
         FROM jogadores j LEFT JOIN figurinhas f ON f.jogador_id = j.id
        GROUP BY j.selecao ORDER BY j.selecao`
    );
    return { jogadores: rows, selecoes: sel };
  });

  app.post("/admin/elencos/importar", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const tk = await tokenFD();
    if (!tk) return reply.code(400).send({ erro: "configure o token football-data.org" });
    if (typeof fetch !== "function") return reply.code(500).send({ erro: "fetch indisponivel" });
    let data: any;
    try {
      data = await fetch("https://api.football-data.org/v4/competitions/WC/teams", { headers: { "X-Auth-Token": tk } }).then((r) => r.json());
    } catch (e: any) {
      return reply.code(502).send({ erro: "falha ao chamar football-data.org", detalhe: String(e?.message ?? e) });
    }
    const teams: any[] = Array.isArray(data?.teams) ? data.teams : [];
    if (!teams.length) return reply.send({ importados: 0, times: 0 });
    let n = 0;
    for (const t of teams) {
      for (const p of (Array.isArray(t?.squad) ? t.squad : [])) {
        await pool.query(
          `INSERT INTO jogadores (fd_id, nome, posicao, selecao, nascimento) VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (fd_id) DO UPDATE SET nome=$2, posicao=$3, selecao=$4, nascimento=$5`,
          [p?.id, p?.name ?? "?", p?.position ?? null, t?.name ?? null, p?.dateOfBirth ?? null]
        );
        n++;
      }
    }
    return { importados: n, times: teams.length };
  });
}
