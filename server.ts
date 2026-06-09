import Fastify from "fastify";
import cors from "@fastify/cors";
import { pool, pingDb } from "./db.js";
import { rotasUsuarios } from "./usuarios.js";
import { rotasAdmin } from "./admin.js";
import { rotasAuth } from "./auth.js";
import { rotasLanding } from "./landing.js";
import { rotasElencos } from "./elencos.js";
import { rotasImagens } from "./imagens.js";
import { rotasFigsAdmin } from "./figurinhas_admin.js";
import { rotasLLM } from "./llm.js";
import { rotasConfigHub } from "./config_hub.js";
import { rotasCustos } from "./custos.js";
import { rotasTokenomics } from "./tokenomics.js";
import { rotasCriadorFig } from "./criador_fig.js";
import { rotasCartas } from "./cartas.js";
import { rotasJogosPlacar } from "./jogos_placar.js";
import { rotasDeploy, runDeployCmd } from "./deploy.js";
import { injetarMenu } from "./ui.js";

const app = Fastify({ logger: true, bodyLimit: 30 * 1024 * 1024 });
await app.register(cors, { origin: true });

app.addContentTypeParser("application/json", { parseAs: "string", bodyLimit: 30 * 1024 * 1024 }, (_req, body, done) => {
  const s = (body as string) ?? "";
  if (s.trim() === "") return done(null, {});
  try {
    done(null, JSON.parse(s));
  } catch (e) {
    done(e as Error, undefined);
  }
});

// injeta o menu lateral + botao FIGURA DEFAULT nas telas legadas (ex.: figurinhas)
const BTN_DEFAULT = `<a onclick="location.href=location.pathname.replace('/figurinhas','/cartas')" style="position:fixed;bottom:22px;right:22px;z-index:70;background:#14794a;color:#fff;padding:13px 20px;border-radius:30px;font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.28)">&#127981; FIGURA DEFAULT</a>`;
app.addHook("onSend", async (req, reply, payload) => {
  const url = String(req.url || "").split("?")[0];
  if (url === "/admin/figurinhas" || url === "/admin/figurinhas/") {
    const ct = String(reply.getHeader("content-type") || "");
    if (typeof payload === "string" && ct.includes("text/html")) {
      const html = injetarMenu(payload, "figs");
      return html.indexOf("</body>") >= 0 ? html.replace(/<\/body>/i, BTN_DEFAULT + "</body>") : html;
    }
  }
  return payload;
});

app.get("/health", async () => {
  const db = await pingDb().catch(() => false);
  return { status: "ok", db, ts: new Date().toISOString() };
});

app.get("/ranking", async () => {
  const { rows } = await pool.query(
    "SELECT usuario_id, pontos_bolao, pontos_arena FROM ranking ORDER BY pontos_bolao DESC LIMIT 50"
  );
  return rows;
});

await app.register(rotasLanding);
await app.register(rotasAuth);
await app.register(rotasUsuarios);
await app.register(rotasAdmin);
await app.register(rotasElencos);
await app.register(rotasImagens);
await app.register(rotasFigsAdmin);
await app.register(rotasLLM);
await app.register(rotasConfigHub);
await app.register(rotasCustos);
await app.register(rotasTokenomics);
await app.register(rotasCriadorFig);
await app.register(rotasCartas);
await app.register(rotasJogosPlacar);
await app.register(rotasDeploy);

// executa comando de deploy pendente (git) gravado em config.deploy_cmd
await runDeployCmd().catch((e) => app.log.error(e));

const port = Number(process.env.PORT ?? 8510);
const host = process.env.HOST ?? "127.0.0.1";

app
  .listen({ port, host })
  .then(() => app.log.info(`bolao-copa26 API em http://${host}:${port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
