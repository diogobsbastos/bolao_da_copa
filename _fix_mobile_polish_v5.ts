// Polish v5 — combina v4 (strip emoji nos .tag do .cm.cmtop) com OVERRIDE forte
// do layout do painel IA pra impedir mascote inflar. Specificity alta com div#autobar.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FLAG = join(__dir, "_fix_mobile_polish_v5.done");

const CSS_INSERT =
  "\n/* --- MOBILE POLISH v5 (12/jun): override forte do layout IA + reset altura --- */\n" +
  "@media(max-width:600px){\n" +
  " div#autobar.actpanel{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:6px!important;padding:10px!important;min-height:0!important;height:auto!important}\n" +
  " div#autobar.actpanel>*{flex:0 0 auto!important;width:auto!important;max-width:100%!important;min-width:0!important;margin:0!important}\n" +
  " /* act-ia: row compacta */\n" +
  " div#autobar.actpanel>.act-ia{display:flex!important;flex-direction:row!important;align-items:center!important;flex-wrap:nowrap!important;gap:8px!important;width:100%!important;min-height:0!important;height:auto!important}\n" +
  " div#autobar.actpanel>.act-ia>.masc{flex:0 0 44px!important;width:44px!important;height:44px!important;min-width:44px!important;max-width:44px!important;max-height:44px!important;margin:0!important;align-self:center}\n" +
  " div#autobar.actpanel>.act-ia>.masc>svg,div#autobar.actpanel>.act-ia>.masc svg{width:44px!important;height:44px!important;max-width:44px!important;max-height:44px!important}\n" +
  " div#autobar.actpanel>.act-ia>.bubble{flex:1 1 auto!important;min-width:0!important;max-width:calc(100% - 56px)!important;width:auto!important;padding:6px 10px!important;font-size:13px!important;line-height:1.3!important}\n" +
  " /* act-logic: botoes empilhados compactos */\n" +
  " div#autobar.actpanel>.act-logic{display:flex!important;flex-direction:column!important;gap:4px!important;width:100%!important;min-height:0!important}\n" +
  " div#autobar.actpanel>.act-logic>*{width:100%!important;max-width:100%!important;margin:0!important}\n" +
  " div#autobar.actpanel button{width:100%!important;max-width:100%!important;white-space:normal!important;text-align:center!important;padding:9px 12px!important;font-size:13px!important;line-height:1.2!important;min-height:0!important;height:auto!important}\n" +
  " /* .actcol (botao X de fechar) compacto */\n" +
  " div#autobar.actpanel>.actcol{align-self:flex-end!important;padding:2px 8px!important;font-size:14px!important;height:auto!important;min-height:0!important}\n" +
  "}\n";

const SCRIPT_INSERT =
  '<!-- [mobile-polish-v5-script] --><script>(function(){if(window.innerWidth>600)return;' +
  'function strip(){var tags=document.querySelectorAll(".cm.cmtop .tag");' +
  'for(var i=0;i<tags.length;i++){var el=tags[i];if(el.dataset && el.dataset.cleaned)continue;' +
  'var s=(el.textContent||"").trim();var m=s.match(/^([\\s\\S]{1,3})\\s+(.+)$/);' +
  'if(m){var first=m[1];if(!/[A-Za-z0-9\\u00C0-\\u017F]/.test(first)){el.textContent=m[2].trim();if(el.dataset)el.dataset.cleaned="1";}}}}' +
  'function run(){strip();var t=setInterval(strip,700);setTimeout(function(){clearInterval(t);},20000);}' +
  'if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",run);}else{run();}' +
  '})();</script>';

try {
  if (existsSync(FLAG)) {
    console.log("[fix_mobile_polish_v5] ja aplicado, skip");
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
        writeFileSync(LP + ".prefix_fix_polish_v5", s, "utf8");
        writeFileSync(LP, novo, "utf8");
        log.css = { aplicado: true, delta: novo.length - s.length };
      } else { log.css = "anchor !== 1, skip"; }
    } catch (e: any) { log.css = "ERRO: " + String(e?.message); }
    // Script
    try {
      const JP = join(__dir, "jogar_page.ts");
      const s = readFileSync(JP, "utf8");
      if (s.indexOf("[mobile-polish-v5-script]") !== -1) {
        log.script = "ja injetado";
      } else {
        const anchor = "<!-- [mobile-polish-v2-script] -->";
        const occ = s.split(anchor).length - 1;
        log.script_anchor_occ = occ;
        if (occ === 1) {
          const novo = s.replace(anchor, SCRIPT_INSERT + anchor);
          writeFileSync(JP + ".prefix_fix_polish_v5", s, "utf8");
          writeFileSync(JP, novo, "utf8");
          log.script = { aplicado: true, delta: novo.length - s.length };
        } else { log.script = "anchor !== 1, skip"; }
      }
    } catch (e: any) { log.script = "ERRO: " + String(e?.message); }
    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_mobile_polish_v5]", log);
  }
} catch (e) {
  console.error("[fix_mobile_polish_v5] ERRO", e);
}
