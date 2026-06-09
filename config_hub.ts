import type { FastifyInstance } from "fastify";
import { PAGINA } from "./config_hub_page.js";

export async function rotasConfigHub(app: FastifyInstance) {
  app.get("/admin/config-hub", async (_req, reply) => reply.type("text/html").send(PAGINA));
}
