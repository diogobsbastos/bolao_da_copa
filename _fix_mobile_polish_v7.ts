// Polish v7 — esconde X (.actcol) no mobile, ? (.qmark) vira circulo pequeno,
// botao Preencher pela logica vira "Palpite Logico" via JS, IA/Logica region shift right.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FLAG = join(__dir, "_fix_mobile_polish_v7.done");

const CSS_INSERT =
  "\n/* --- MOBILE POLISH v7 (12/jun): X removido, ? menor, IA/Logica shift right --- */\n" +
  "@media(max-width:600px){\n" +
  " /* Some com X (.actcol) em mobile */\n" +
  " div#autobar.actpanel>.actcol,.actpanel>.actcol,.actcol{display:none!important}\n" +
  " div#autobar.actpanel{padding:10px!important}\n" +
  " /* ? botao (.qmark) vira bolinha pequena */\n" +
  " div#autobar.actpanel .qmark,button.qmark{width:28px!important;height:28px!important;min-width:28px!important;max-width:28px!important;padding:0!important;border-radius:50%!important;font-size:13px!important;flex:0 0 28px!important;line-height:1!important}\n" +
  " /* Botao Preencher (renomeado pra Palpite Logico) — flex 1, largura natural */\n" +
  " div#autobar.actpanel>.act-logic>.btn.ghost,div#autobar.actpanel>.act-logic>button.btn.ghost{flex:1 1 auto!important;width:auto!important;max-width:100%!important;white-space:nowrap!important;padding:9px 14px!important;font-size:13px!important;text-overflow:ellipsis;overflow:hidden}\n" +
  " /* Auto toggle e demais: compactos */\n" +
  " div#autobar.actpanel>.act-logic>*:not(.btn.ghost):not(:first-child){flex:0 0 auto!important;width:auto!important;max-width:none!important}\n" +
  " /* IA/Logica region nos game cards: shift right */\n" +
  " .jogo .muted .origb,.jogo .muted .origb.origia,.jogo .muted .origb.origlog{margin-left:6px!important}\n" +
  " .jogo .muted{justify-content:flex-end!important}\n" +
  "}\n";

const SCRIPT_INSERT =
  '<!-- [mobile-polish-v7-script] --><script>(function(){if(window.innerWidth>600)return;' +
  'function fixText(){var b=document.querySelector(".act-logic .btn.ghost");' +
  'if(b && b.textContent && b.textContent.indexOf("Preencher")!==-1){' +
  'b.textContent=b.textContent.replace(/Preencher pela l[oó]gica/gi,"Palpite Lógico").replace(/\\s+/g," ").trim();}}' +
  'function run(){fixText();var t=setInterval(fixText,500);setTimeout(function(){clearInterval(t);},15000);}' +
  'if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",run);}else{run();}' +
  '})();</script>';

try {
  if (existsSync(FLAG)) {
    console.log("[fix_mobile_polish_v7] ja aplicado, skip");
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
        writeFileSync(LP + ".prefix_fix_polish_v7", s, "utf8");
        writeFileSync(LP, novo, "utf8");
        log.css = { aplicado: true, delta: novo.length - s.length };
      } else { log.css = "anchor !== 1"; }
    } catch (e: any) { log.css = "ERRO: " + String(e?.message); }
    // Script
    try {
      const JP = join(__dir, "jogar_page.ts");
      const s = readFileSync(JP, "utf8");
      if (s.indexOf("[mobile-polish-v7-script]") !== -1) {
        log.script = "ja injetado";
      } else {
        const anchor = "<!-- [mobile-polish-v2-script] -->";
        const occ = s.split(anchor).length - 1;
        if (occ === 1) {
          const novo = s.replace(anchor, SCRIPT_INSERT + anchor);
          writeFileSync(JP + ".prefix_fix_polish_v7", s, "utf8");
          writeFileSync(JP, novo, "utf8");
          log.script = { aplicado: true, delta: novo.length - s.length };
        } else { log.script = "anchor !== 1"; }
      }
    } catch (e: any) { log.script = "ERRO: " + String(e?.message); }
    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_mobile_polish_v7]", log);
  }
} catch (e) {
  console.error("[fix_mobile_polish_v7] ERRO", e);
}
