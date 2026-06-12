// Mobile UX Bloco A — P0.1 (header app) + P1.5 (dropdowns sino/perfil).
// Padrao _fix_*.ts: idempotente via flag .done, assert count==1, backup .prefix_fix.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const LP = join(__dir, "jogar_style.ts");
const FLAG = join(__dir, "_fix_mobile_jogar_style.done");

try {
  if (existsSync(FLAG)) {
    console.log("[fix_mobile_jogar_style] ja aplicado, skip");
  } else {
    const s = readFileSync(LP, "utf8");
    const before = s;
    const log: any = {};

    const anchor = ".ob-emoji{font-size:46px}}\n`;";
    const INSERT =
      "\n/* --- MOBILE UX (Bloco A: P0.1 header + P1.5 dropdowns) - seletores prefixados pra vencer o base override no <style> do jogar_page.ts --- */\n" +
      "@media(max-width:600px){\n" +
      " .top{gap:6px;padding:6px 8px}\n" +
      " .top .brand{gap:4px}\n" +
      " .top .brand>span{display:none}\n" +
      " .top .brand .blogo{height:28px}\n" +
      " .top .cdmini{font-size:11px;padding:4px 8px;gap:4px}\n" +
      " .top .cdmini .cdlbl{display:none}\n" +
      " .top .cdmini b{font-size:12px}\n" +
      " .top .wallets{gap:4px;flex-wrap:nowrap}\n" +
      " .top .w{padding:3px 6px;font-size:11px}\n" +
      " .top .hmpote{font-size:10px;padding:3px 7px}\n" +
      " .top .av{width:27px;height:27px;font-size:12px}\n" +
      " .top .pchev{display:none}\n" +
      " .newsdrop{position:fixed;left:8px;right:8px;top:60px;width:auto;max-height:70vh}\n" +
      " .pdrop{position:fixed;right:8px;left:auto;top:60px;width:auto;max-width:calc(100vw - 16px)}\n" +
      "}\n" +
      "@media(max-width:400px){\n" +
      " .top .brlcc{display:none}\n" +
      " .top .cdmini{padding:3px 6px}\n" +
      " .top .w{padding:3px 5px}\n" +
      "}\n";

    const occ = s.split(anchor).length - 1;
    log.anchor_occ = occ;
    if (occ === 1) {
      const novo = s.replace(anchor, INSERT + anchor);
      writeFileSync(LP + ".prefix_fix_mobile", before, "utf8");
      writeFileSync(LP, novo, "utf8");
      log.aplicado = true;
      log.delta = novo.length - before.length;
    } else {
      log.aplicado = false;
      log.motivo = "anchor !== 1 ocorrencia";
    }

    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_mobile_jogar_style]", log);
  }
} catch (e) {
  console.error("[fix_mobile_jogar_style] ERRO", e);
}
