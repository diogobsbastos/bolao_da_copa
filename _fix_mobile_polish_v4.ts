// Polish v4 — remove emojis 🔒 e 🕐 do inicio de .tag.lk e demais .tag no .cm.cmtop.
// Sao caracteres no texto (nao SVG), por isso so via JS da pra tirar.
// Injeta script no jogar_page.ts (anchor: marker do v2). Idempotente via flag .done.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FLAG = join(__dir, "_fix_mobile_polish_v4.done");

const SCRIPT_INSERT =
  '<!-- [mobile-polish-v4-script] --><script>(function(){if(window.innerWidth>600)return;' +
  'function strip(el){if(el.dataset && el.dataset.iconCleaned)return;' +
  'var s=(el.textContent||"").trim();var i=s.indexOf(" ");' +
  'if(i>0 && i<=4){var rest=s.substring(i+1).trim();' +
  'if(rest && rest.length>0){el.textContent=rest;}' +
  'else{el.textContent=s.substring(i).trim();}' +
  'if(el.dataset)el.dataset.iconCleaned="1";}}' +
  'function clean(){var tags=document.querySelectorAll(".cm.cmtop .tag");' +
  'for(var j=0;j<tags.length;j++){strip(tags[j]);}}' +
  'function run(){clean();var t=setInterval(clean,600);setTimeout(function(){clearInterval(t);},20000);}' +
  'if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",run);}else{run();}' +
  '})();</script>';

try {
  if (existsSync(FLAG)) {
    console.log("[fix_mobile_polish_v4] ja aplicado, skip");
  } else {
    const log: any = {};
    const JP = join(__dir, "jogar_page.ts");
    const s = readFileSync(JP, "utf8");
    const anchor = "<!-- [mobile-polish-v2-script] -->";
    const occ = s.split(anchor).length - 1;
    log.anchor_occ = occ;
    if (s.indexOf("[mobile-polish-v4-script]") !== -1) {
      log.aplicado = false;
      log.motivo = "ja injetado";
    } else if (occ === 1) {
      // Coloca v4 ANTES do v2 marker (mais cedo possivel apos head)
      const novo = s.replace(anchor, SCRIPT_INSERT + anchor);
      writeFileSync(JP + ".prefix_fix_polish_v4", s, "utf8");
      writeFileSync(JP, novo, "utf8");
      log.aplicado = true;
      log.delta = novo.length - s.length;
    } else { log.aplicado = false; log.motivo = "anchor v2 !== 1 (occ=" + occ + ")"; }
    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_mobile_polish_v4]", log);
  }
} catch (e) {
  console.error("[fix_mobile_polish_v4] ERRO", e);
}
