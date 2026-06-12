// Mobile UX Bloco B — P1.3 (hmrod card robo), P1.4 (actpanel/autobar), P1.6 (tmgrid + chips).
// Padrao _fix_*.ts: idempotente via flag .done, assert count==1 do mesmo anchor do Bloco A,
// append antes do backtick final de jogar_style.ts.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const LP = join(__dir, "jogar_style.ts");
const FLAG = join(__dir, "_fix_mobile_b.done");

try {
  if (existsSync(FLAG)) {
    console.log("[fix_mobile_b] ja aplicado, skip");
  } else {
    const s = readFileSync(LP, "utf8");
    const before = s;
    const log: any = {};

    // Anchor: o final do template literal (mantido apos Bloco A).
    const anchor = ".ob-emoji{font-size:46px}}\n`;";
    const occ = s.split(anchor).length - 1;
    log.anchor_occ = occ;

    const INSERT =
      "\n/* --- MOBILE UX (Bloco B: P1.3 hmrod + P1.4 actpanel/autobar + P1.6 tmgrid/chips) --- */\n" +
      "@media(max-width:600px){\n" +
      " .hmrod{flex-wrap:wrap}\n" +
      " .hmrod>*{min-width:0}\n" +
      " .hmrod .hmrobo{flex:0 0 auto;width:48px;height:48px}\n" +
      " .hmrod .hmmeta{flex:1 1 200px;min-width:0}\n" +
      " .hmrod .hmkpis{flex:1 1 100%;order:50;min-width:0}\n" +
      " .hmrod .hmticker{flex:1 1 100%;order:60;min-width:0}\n" +
      " .hmrod .btn.radar{flex:1 1 100%;order:99}\n" +
      "}\n" +
      "@media(max-width:760px){\n" +
      " /* P1.4 — actpanel/autobar */\n" +
      " #autobar.actpanel{padding:10px}\n" +
      " #autobar.actpanel .act-ia,#autobar.actpanel .act-logic{flex-wrap:wrap;min-width:0;gap:6px}\n" +
      " #autobar.actpanel button{flex:1 1 auto;font-size:12px;min-width:0;padding:8px 10px}\n" +
      " #autobar.actpanel .masc{width:40px;height:40px;flex:0 0 auto}\n" +
      " #autobar.actpanel>*{min-width:0}\n" +
      " /* P1.6 — Meu Time grid blowout */\n" +
      " .tmgrid{grid-template-columns:minmax(0,1fr)}\n" +
      " .tmgrid .tmpit-wrap,.tmgrid .tmbench{min-width:0;max-width:100%}\n" +
      " .tmgrid .card{min-width:0;max-width:100%}\n" +
      "}\n" +
      "@media(max-width:480px){\n" +
      " /* P1.6 — chips do Meu Time (4-4-2/Titulares/Reservas/Posicao) */\n" +
      " .tmtopR{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;-webkit-mask-image:linear-gradient(to right,#000 86%,transparent);mask-image:linear-gradient(to right,#000 86%,transparent)}\n" +
      " .tmtopR::-webkit-scrollbar{display:none}\n" +
      " .tmtopR>*{flex:0 0 auto}\n" +
      "}\n";

    if (occ === 1) {
      const novo = s.replace(anchor, INSERT + anchor);
      writeFileSync(LP + ".prefix_fix_mobile_b", before, "utf8");
      writeFileSync(LP, novo, "utf8");
      log.aplicado = true;
      log.delta = novo.length - before.length;
    } else {
      log.aplicado = false;
      log.motivo = "anchor !== 1 ocorrencia";
    }

    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_mobile_b]", log);
  }
} catch (e) {
  console.error("[fix_mobile_b] ERRO", e);
}
