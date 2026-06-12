// Mobile UX Bloco C2 — P2.9 fix: .tabL (bolao rodadas) + .tabs (copa/rank) overflow-x scroll.
// .tabs foi bloqueado por #bolao-tabs{overflow:hidden} (especificidade ID > class).
// Solucao: adicionar .tabL especificamente + manter .tabs para copa/rank.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const LP = join(__dir, "jogar_style.ts");
const FLAG = join(__dir, "_fix_mobile_c2.done");

try {
  if (existsSync(FLAG)) {
    console.log("[fix_mobile_c2] ja aplicado, skip");
  } else {
    const s = readFileSync(LP, "utf8");
    const before = s;
    const log: any = {};

    const anchor = ".pksoon,.pksoon2{display:block;margin:6px auto 0;text-align:center}\n}\n";
    const occ = s.split(anchor).length - 1;
    log.anchor_occ = occ;

    const INSERT =
      "\n/* --- MOBILE UX (Bloco C2: P2.9 tabL bolao + tabs copa/rank) --- */\n" +
      "@media(max-width:600px){\n" +
      " .tabL{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;" +
        "-webkit-mask-image:linear-gradient(to right,#000 88%,transparent);" +
        "mask-image:linear-gradient(to right,#000 88%,transparent)}\n" +
      " .tabL::-webkit-scrollbar{display:none}\n" +
      " .tabL .tab{flex-shrink:0}\n" +
      " #copa-tabs.tabs,#rank-tabs.tabs{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;" +
        "-webkit-mask-image:linear-gradient(to right,#000 88%,transparent);" +
        "mask-image:linear-gradient(to right,#000 88%,transparent)}\n" +
      " #copa-tabs.tabs::-webkit-scrollbar,#rank-tabs.tabs::-webkit-scrollbar{display:none}\n" +
      " #copa-tabs.tabs .tab,#rank-tabs.tabs .tab{flex-shrink:0}\n" +
      "}\n";

    if (occ === 1) {
      const novo = s.replace(anchor, anchor + INSERT);
      writeFileSync(LP + ".prefix_fix_mobile_c2", before, "utf8");
      writeFileSync(LP, novo, "utf8");
      log.aplicado = true;
      log.delta = novo.length - before.length;
    } else {
      log.aplicado = false;
      log.motivo = "anchor !== 1 ocorrencia (occ=" + occ + ")";
    }

    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_mobile_c2]", log);
  }
} catch (e) {
  console.error("[fix_mobile_c2] ERRO", e);
}
