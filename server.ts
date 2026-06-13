// MOBILE UX — patches baked nos blocos A/B/C/D e polish v1-v10 (ja no source).
// _fix_polish_running.ts e o acumulador unico daqui pra frente.
import "./_fix_polish_running.js";

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
import { rotasJogar, autoPreencherTick } from "./jogar.js";
import { rotasPagamento } from "./pagamento.js";
import { rotasFc26, casarFc26SeFlag } from "./fc26.js";
import { rotasIndicacao } from "./indicacao.js";
import { rotasDeploy, runDeployCmd } from "./deploy.js";
import { rotasApiFootball, syncSeFlag } from "./apifootball.js";
import { rotasScores365, syncOddsSeFlag, agendadorDiario } from "./scores365.js";
import { rotasComando, iniciarComando } from "./comando.js";
import { rotasTrava } from "./trava.js";
import { rotasNotificacoes, iniciarNotificacoes } from "./notificacoes.js";
import { rotasPwa } from "./pwa.js";
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
await app.register(rotasJogar);
await app.register(rotasPagamento);
await app.register(rotasFc26);
await app.register(rotasIndicacao);
await app.register(rotasDeploy);
await app.register(rotasApiFootball);
await app.register(rotasScores365);
await app.register(rotasComando);
await app.register(rotasTrava);
await app.register(rotasNotificacoes);
await app.register(rotasPwa);

await runDeployCmd().catch((e) => app.log.error(e));
await syncSeFlag().catch((e) => app.log.error(e));
await syncOddsSeFlag().catch((e) => app.log.error(e));
agendadorDiario();
iniciarComando();
iniciarNotificacoes();
casarFc26SeFlag();
setTimeout(() => { autoPreencherTick().catch(() => {}); }, 8000);
setInterval(() => { autoPreencherTick().catch(() => {}); }, 15 * 60 * 1000);

const port = Number(process.env.PORT ?? 8510);
const host = process.env.HOST ?? "127.0.0.1";

app
  .listen({ port, host })
  .then(() => app.log.info(`bolao-copa26 API em http://${host}:${port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
