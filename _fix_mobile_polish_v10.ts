// Polish v10 — fecha auto-open do actpanel via [data-user-opened] attribute.
// CSS esconde por padrao; click no .autofab seta o atributo, click no .actcol remove.
// Sem polling, sem race condition. Idempotente via .done flag.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FLAG = join(__dir, "_fix_mobile_polish_v10.done");

const CSS_INSERT =
  "\n/* --- MOBILE POLISH v10 (12/jun): actpanel hidden por padrao, [data-user-opened] controla --- */\n" +
  "@media(max-width:600px){\n" +
  " div#autobar.actpanel:not([data-user-opened=\"1\"]){display:none!important}\n" +
  " div#autobar.actpanel[data-user-opened=\"1\"]{display:flex!important}\n" +
  "}\n";

const SCRIPT_INSERT =
  '<!-- [mobile-polish-v10-script] --><script>(function(){if(window.innerWidth>600)return;' +
  'document.addEventListener("click",function(e){' +
  'if(!e.target||!e.target.closest)return;' +
  'var a=document.querySelector("#autobar.actpanel");if(!a)return;' +
  'if(e.target.closest(".autofab")){a.setAttribute("data-user-opened","1");}' +
  'if(e.target.closest(".actcol")){a.removeAttribute("data-user-opened");}' +
  '},true);})();</script>';

try {
  if (existsSync(FLAG)) {
    console.log("[fix_mobile_polish_v10] ja aplicado, skip");
  } else {
    const log: any = {};
    // CSS
    try {
      const LP = join(__dir, "jogar_style.ts");
      const s = readFileSync(LP, "utf8");
      const anchor = ".ob-emoji{font-size:46px}}\n`;";
      const occ = s.split(anchor).length - 1;
      log.css_anchor_occ = occ;
      if (occ === 1) {
        const novo = s.replace(anchor, CSS_INSERT + anchor);
        writeFileSync(LP + ".prefix_fix_polish_v10", s, "utf8");
        writeFileSync(LP, novo, "utf8");
        log.css = { aplicado: true, delta: novo.length - s.length };
      } else { log.css = "anchor !== 1, skip"; }
    } catch (e: any) { log.css = "ERRO: " + String(e?.message); }
    // Script
    try {
      const JP = join(__dir, "jogar_page.ts");
      const s = readFileSync(JP, "utf8");
      if (s.indexOf("[mobile-polish-v10-script]") !== -1) {
        log.script = "ja injetado";
      } else {
        const anchor = "<!-- [mobile-polish-v2-script] -->";
        const occ = s.split(anchor).length - 1;
        log.script_anchor_occ = occ;
        if (occ === 1) {
          const novo = s.replace(anchor, SCRIPT_INSERT + anchor);
          writeFileSync(JP + ".prefix_fix_polish_v10", s, "utf8");
          writeFileSync(JP, novo, "utf8");
          log.script = { aplicado: true, delta: novo.length - s.length };
        } else { log.script = "anchor !== 1, skip"; }
      }
    } catch (e: any) { log.script = "ERRO: " + String(e?.message); }
    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_mobile_polish_v10]", log);
  }
} catch (e) {
  console.error("[fix_mobile_polish_v10] ERRO", e);
}
