// Mobile UX Bloco C — P2.8 (ranking), P2.9 (abas overflow+fade), P2.10 (marketplace pack).
// Padrao _fix_*.ts: idempotente via flag .done, assert count==1 do mesmo anchor dos Blocos A/B,
// append antes do backtick final de jogar_style.ts.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const LP = join(__dir, "jogar_style.ts");
const FLAG = join(__dir, "_fix_mobile_c.done");

try {
  if (existsSync(FLAG)) {
    console.log("[fix_mobile_c] ja aplicado, skip");
  } else {
    const s = readFileSync(LP, "utf8");
    const before = s;
    const log: any = {};

    // Anchor: fim do template literal (mesmo dos Blocos A e B).
    const anchor = ".ob-emoji{font-size:46px}}\n`;";
    const occ = s.split(anchor).length - 1;
    log.anchor_occ = occ;

    const INSERT =
      "\n/* --- MOBILE UX (Bloco C: P2.8 ranking + P2.9 abas + P2.10 marketplace) --- */\n" +
      "@media(max-width:480px){\n" +
      " .rkrow{padding:8px 6px;gap:4px}\n" +
      " .rkname{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n" +
      " .rkprize-w{flex-shrink:0}\n" +
      " .rkprize{font-size:10px;padding:2px 5px}\n" +
      " .rkcols{gap:4px;flex-shrink:0}\n" +
      " .rkcol span{font-size:14px}\n" +
      " .rkcol small{font-size:9px;letter-spacing:-.3px}\n" +
      "}\n" +
      "@media(max-width:600px){\n" +
      " .tabs{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;" +
        "-webkit-mask-image:linear-gradient(to right,#000 88%,transparent);" +
        "mask-image:linear-gradient(to right,#000 88%,transparent)}\n" +
      " .tabs::-webkit-scrollbar{display:none}\n" +
      " .tab{flex-shrink:0}\n" +
      "}\n" +
      "@media(max-width:480px){\n" +
      " .pack.base{min-width:0;padding:14px 10px}\n" +
      " .pksoon,.pksoon2{display:block;margin:6px auto 0;text-align:center}\n" +
      "}\n";

    if (occ === 1) {
      const novo = s.replace(anchor, INSERT + anchor);
      writeFileSync(LP + ".prefix_fix_mobile_c", before, "utf8");
      writeFileSync(LP, novo, "utf8");
      log.aplicado = true;
      log.delta = novo.length - before.length;
    } else {
      log.aplicado = false;
      log.motivo = "anchor !== 1 ocorrencia (occ=" + occ + ")";
    }

    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_mobile_c]", log);
  }
} catch (e) {
  console.error("[fix_mobile_c] ERRO", e);
}
