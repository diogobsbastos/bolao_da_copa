// Polish acumulado de mobile UX (acertos finos pos-audit).
// Idempotente via flag .done. Append antes do backtick final de jogar_style.ts.
//
// 12/jun (v1):
//  - .hmrod .hmbubble com white-space:nowrap estava cortando "Bora preencher juntos?
//    Faltam 48 jogos pra cravar". Permite quebrar pra 2-3 linhas em mobile.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const LP = join(__dir, "jogar_style.ts");
const FLAG = join(__dir, "_fix_mobile_polish.done");

try {
  if (existsSync(FLAG)) {
    console.log("[fix_mobile_polish] ja aplicado, skip");
  } else {
    const s = readFileSync(LP, "utf8");
    const before = s;
    const log: any = {};

    const anchor = ".ob-emoji{font-size:46px}}\n`;";
    const occ = s.split(anchor).length - 1;
    log.anchor_occ = occ;

    const INSERT =
      "\n/* --- MOBILE POLISH v1 (12/jun): texto do robo na Inicio quebra em mobile --- */\n" +
      "@media(max-width:600px){\n" +
      " .hmrod .hmrbody{min-width:0;flex:1 1 0%}\n" +
      " .hmrod .hmbubble{white-space:normal;word-break:normal;overflow-wrap:anywhere;max-width:100%;line-height:1.35}\n" +
      "}\n";

    if (occ === 1) {
      const novo = s.replace(anchor, INSERT + anchor);
      writeFileSync(LP + ".prefix_fix_mobile_polish", before, "utf8");
      writeFileSync(LP, novo, "utf8");
      log.aplicado = true;
      log.delta = novo.length - before.length;
    } else {
      log.aplicado = false;
      log.motivo = "anchor !== 1 ocorrencia (occ=" + occ + ")";
    }

    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_mobile_polish]", log);
  }
} catch (e) {
  console.error("[fix_mobile_polish] ERRO", e);
}
