import type { FastifyInstance } from "fastify";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const DIR = "/home/ubuntu/bolao-copa26/figurinhas";

export async function rotasImagens(app: FastifyInstance) {
  app.get("/fig/cards/:file", async (req, reply) => {
    const file = (req.params as { file: string }).file;
    if (!/^[0-9]+\.png$/.test(file)) return reply.code(400).send({ erro: "invalido" });
    try {
      const buf = await readFile(join(DIR, "cards", file));
      return reply.header("cache-control", "public, max-age=86400").type("image/png").send(buf);
    } catch {
      return reply.code(404).send({ erro: "nao encontrada" });
    }
  });
}
