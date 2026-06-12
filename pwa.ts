// PWA — rotas /manifest.json e /icon-{192,512}.jpg.
// Proxy corta o prefixo /bolao-copa26 antes do Fastify, entao os paths internos
// nao tem prefixo. O conteudo do manifest (start_url/scope) usa o caminho PUBLICO.
import type { FastifyInstance } from "fastify";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const ICON_PATH = join(__dir, "og-square.jpg");
const ICON = existsSync(ICON_PATH) ? readFileSync(ICON_PATH) : Buffer.alloc(0);

const MANIFEST = {
  name: "Bolão Copa 26",
  short_name: "Bolão 26",
  description: "Hub digital de futebol da Copa do Mundo 2026 — bolão, álbum e arena.",
  start_url: "/bolao-copa26/jogar",
  scope: "/bolao-copa26/",
  display: "standalone",
  orientation: "portrait-primary",
  background_color: "#0a1228",
  theme_color: "#1faa59",
  lang: "pt-BR",
  icons: [
    { src: "/bolao-copa26/icon-192.jpg", sizes: "192x192", type: "image/jpeg", purpose: "any" },
    { src: "/bolao-copa26/icon-512.jpg", sizes: "512x512", type: "image/jpeg", purpose: "any" },
    { src: "/bolao-copa26/icon-512.jpg", sizes: "512x512", type: "image/jpeg", purpose: "maskable" },
  ],
};

export async function rotasPwa(app: FastifyInstance) {
  app.get("/manifest.json", async (_req, reply) => {
    reply.header("cache-control", "public, max-age=3600");
    return reply.type("application/manifest+json").send(JSON.stringify(MANIFEST));
  });

  // Mesma imagem em 192 e 512 (Chrome escala). Se quiser PNG real depois, troca o buffer.
  app.get("/icon-192.jpg", async (_req, reply) => {
    reply.header("cache-control", "public, max-age=86400");
    return reply.type("image/jpeg").send(ICON);
  });
  app.get("/icon-512.jpg", async (_req, reply) => {
    reply.header("cache-control", "public, max-age=86400");
    return reply.type("image/jpeg").send(ICON);
  });
}
