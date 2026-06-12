// Polish v8 — restaura X pequeno (v7 escondeu demais), Auto toggle visivel,
// Palpite Logico estreito, MutationObserver fecha qualquer auto-open do painel.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FLAG = join(__dir, "_fix_mobile_polish_v8.done");

const CSS_INSERT =
  "\n/* --- MOBILE POLISH v8 (12/jun): X volta pequeno top-right; Auto visivel; Palpite Logico estreito --- */\n" +
  "@media(max-width:600px){\n" +
  " /* X (.actcol) volta — pequeno, sutil, top-right */\n" +
  " div#autobar.actpanel>.actcol,.actpanel>.actcol{display:inline-flex!important;position:absolute!important;top:5px!important;right:6px!important;width:22px!important;height:22px!important;min-width:22px!important;max-width:22px!important;padding:0!important;font-size:12px!important;line-height:1!important;border-radius:50%!important;background:rgba(255,255,255,0.08)!important;color:rgba(255,255,255,0.75)!important;border:1px solid rgba(255,255,255,0.18)!important;cursor:pointer!important;z-index:5;align-items:center!important;justify-content:center!important}\n" +
  " div#autobar.actpanel{position:relative!important;padding:28px 10px 10px 10px!important}\n" +
  " /* Palpite Logico — largura estreita (max 58%) pra abrir espaco pro Auto */\n" +
  " div#autobar.actpanel>.act-logic>.btn.ghost{flex:0 1 auto!important;max-width:58%!important;width:fit-content!important;white-space:nowrap!important;padding:9px 14px!important;font-size:13px!important;overflow:visible!important;text-overflow:clip!important}\n" +
  " /* Auto toggle (.toggle, label com switch) — visivel com fundo */\n" +
  " div#autobar.actpanel>.act-logic>label,div#autobar.actpanel>.act-logic>.toggle,div#autobar.actpanel>.act-logic>.switch,div#autobar.actpanel>.act-logic>[class*=auto-toggle]{display:inline-flex!important;align-items:center!important;gap:6px!important;background:rgba(255,255,255,0.08)!important;padding:4px 10px!important;border-radius:999px!important;flex:0 0 auto!important;min-width:62px!important;font-size:11px!important;color:#fff!important;font-weight:700!important;border:1px solid rgba(255,255,255,0.15)!important}\n" +
  "}\n";

const SCRIPT_INSERT =
  '<!-- [mobile-polish-v8-script] --><script>(function(){if(window.innerWidth>600)return;' +
  'var closed=false;var obs=null;' +
  'function tryClose(){if(closed)return false;var a=document.querySelector("#autobar.actpanel");' +
  'if(!a)return false;var cs=window.getComputedStyle(a);if(cs.display==="none")return false;' +
  'var x=a.querySelector(".actcol");if(x){x.click();}else{a.style.display="none";}' +
  'closed=true;if(obs)obs.disconnect();return true;}' +
  'function setup(){tryClose();' +
  'if(typeof MutationObserver!=="undefined"){obs=new MutationObserver(function(){tryClose();});' +
  'obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["style","class"]});' +
  'setTimeout(function(){if(obs){obs.disconnect();obs=null;}},90000);}' +
  'document.addEventListener("click",function(e){' +
  'if(e.target && e.target.closest && e.target.closest(".autofab")){closed=true;if(obs){obs.disconnect();obs=null;}}' +
  '},true);}' +
  'if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",setup);}else{setup();}' +
  '})();</script>';

try {
  if (existsSync(FLAG)) {
    console.log("[fix_mobile_polish_v8] ja aplicado, skip");
  } else {
    const log: any = {};
    try {
      const LP = join(__dir, "jogar_style.ts");
      const s = readFileSync(LP, "utf8");
      const anchor = ".ob-emoji{font-size:46px}}\n`;";
      const occ = s.split(anchor).length - 1;
      if (occ === 1) {
        const novo = s.replace(anchor, CSS_INSERT + anchor);
        writeFileSync(LP + ".prefix_fix_polish_v8", s, "utf8");
        writeFileSync(LP, novo, "utf8");
        log.css = { aplicado: true, delta: novo.length - s.length };
      } else { log.css = "anchor !== 1"; }
    } catch (e: any) { log.css = "ERRO: " + String(e?.message); }
    try {
      const JP = join(__dir, "jogar_page.ts");
      const s = readFileSync(JP, "utf8");
      if (s.indexOf("[mobile-polish-v8-script]") !== -1) {
        log.script = "ja injetado";
      } else {
        const anchor = "<!-- [mobile-polish-v2-script] -->";
        const occ = s.split(anchor).length - 1;
        if (occ === 1) {
          const novo = s.replace(anchor, SCRIPT_INSERT + anchor);
          writeFileSync(JP + ".prefix_fix_polish_v8", s, "utf8");
          writeFileSync(JP, novo, "utf8");
          log.script = { aplicado: true, delta: novo.length - s.length };
        } else { log.script = "anchor !== 1"; }
      }
    } catch (e: any) { log.script = "ERRO: " + String(e?.message); }
    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_mobile_polish_v8]", log);
  }
} catch (e) {
  console.error("[fix_mobile_polish_v8] ERRO", e);
}
