// Polish running — acumulador unico.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));

const VERSION = "2026-06-13-11";
const CSS_MARKER = `/* POLISH-RUNNING-CSS ${VERSION} */`;
const JS_MARKER = `<!-- [polish-running-js ${VERSION}] -->`;

const CSS_BLOCK = `
${CSS_MARKER}
@media(max-width:600px){
 /* Marketplace card — vertical */
 .pack.base{height:auto!important;min-height:0!important;max-height:none!important;grid-template-columns:none!important;grid-template-rows:none!important;display:flex!important;flex-direction:column!important;align-items:center!important;padding:14px!important;overflow:visible!important;position:relative!important;gap:8px!important}
 .pack.base>img,.pack.base>picture,.pack.base>[class*=img],.pack.base>[class*=fig]{width:auto!important;height:auto!important;max-width:160px!important;max-height:none!important;object-fit:contain!important;grid-column:auto!important;grid-row:auto!important;margin:0 auto!important;display:block!important;align-self:center!important}
 /* Generico EXCLUI .pkflag pra ele nao virar block 100% */
 .pack.base>*:not(img):not(picture):not([class*=img]):not([class*=fig]):not(.pkflag):not([class*=pkflag]){grid-column:auto!important;grid-row:auto!important;max-height:none!important;padding:0!important;align-self:auto!important;width:100%!important;max-width:100%!important;display:block!important;text-align:center!important}

 /* .pkflag — specificity quadruplicada (.pkflag.pkflag.pkflag.pkflag) pra vencer o generic */
 .pack.base .pkflag.pkflag.pkflag.pkflag,.pack.base [class*=pkflag][class*=pkflag][class*=pkflag][class*=pkflag]{position:absolute!important;top:8px!important;right:8px!important;left:auto!important;bottom:auto!important;width:auto!important;max-width:none!important;height:auto!important;min-height:0!important;max-height:none!important;padding:3px 10px!important;border-radius:999px!important;grid-column:auto!important;grid-row:auto!important;z-index:5!important;display:inline-flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;justify-content:center!important;gap:5px!important;font-size:12px!important;font-weight:700!important;line-height:1!important;white-space:nowrap!important;background:linear-gradient(135deg,#ffe23a,#ffba00)!important;color:#000!important;text-align:center!important;margin:0!important;float:none!important;clear:none!important}
 .pack.base .pkflag.pkflag>*,.pack.base [class*=pkflag]>*{display:inline-flex!important;align-items:center!important;flex-direction:row!important;margin:0!important;padding:0!important;line-height:1!important;width:auto!important;max-width:none!important}
 .pack.base .pkflag svg,.pack.base .pkflag img,.pack.base [class*=pkflag] svg,.pack.base [class*=pkflag] img{width:14px!important;height:14px!important;display:inline-block!important;vertical-align:middle!important;flex:0 0 auto!important}

 /* HEADER escudo */
 .top .brand{flex:0 0 auto!important;max-width:42px!important;overflow:hidden!important}
 .top .brand .blogo,.top .brand img{max-height:32px!important;max-width:32px!important;width:auto!important;height:auto!important}
 .top .burger{flex:0 0 auto!important}

 /* IA panel NUCLEAR hide */
 div#autobar.actpanel:not([data-user-opened="1"]),
 .actpanel:not([data-user-opened="1"]){display:none!important;visibility:hidden!important}
 div#autobar.actpanel[data-user-opened="1"],
 .actpanel[data-user-opened="1"]{display:flex!important;visibility:visible!important}

 /* Tabs sem fade */
 .tabs,#copa-tabs,#bolao-tabs,#rank-tabs,.copa-tabs,.bolao-tabs,.rank-tabs{mask-image:none!important;-webkit-mask-image:none!important;padding-right:0!important;margin-right:0!important}
 #copa-tabs .tab,.copa-tabs .tab,#bolao-tabs .tab,#rank-tabs .tab{font-size:11px!important;padding:6px 9px!important;letter-spacing:-.2px!important}

 [class*=ia-conec]{order:-1!important;margin:0 0 12px!important;width:100%!important}

 .tmleft .tmbadge:nth-child(1),[class*=tmleft] .tmbadge:nth-child(1){display:none!important}
 .tmleft{align-items:center!important;justify-content:center!important}
}
`;

const JS_BLOCK = `${JS_MARKER}<script>(function(){if(window.innerWidth>600)return;
function getPanel(){return document.querySelector('#autobar.actpanel, .actpanel');}
function ensureClosed(){var a=getPanel();if(!a)return;if(a.getAttribute('data-user-opened')!=='1'){if(a.style.display){a.style.removeProperty('display');}}}
document.addEventListener('click',function(e){if(!e.target||!e.target.closest)return;var a=getPanel();if(!a)return;
 if(e.target.closest('.autofab')){a.setAttribute('data-user-opened','1');a.style.removeProperty('display');a.style.display='flex';}
 if(e.target.closest('.actcol')){a.removeAttribute('data-user-opened');a.style.removeProperty('display');}
},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureClosed);else ensureClosed();
setInterval(ensureClosed,400);
function shortenCopaTabs(){document.querySelectorAll('#copa-tabs .tab, .copa-tabs .tab').forEach(function(t){var s=(t.textContent||'').trim();if(s==='Eliminatórias')t.textContent='Mata-Mata';});}
shortenCopaTabs();setInterval(shortenCopaTabs,2000);
function hide442(){document.querySelectorAll('.tmleft *, [class*=tmleft] *, .tmbadge').forEach(function(el){
 if(el.children.length===0){var t=(el.textContent||'').replace(/\\s+/g,'').trim();
  if(t==='4-4-2'||t.indexOf('4-4-2')!==-1){var p=el.closest('.tmbadge')||el;if(p)p.style.display='none';}
 }});}
hide442();setInterval(hide442,1500);
})();</script>`;

try {
  const LP = join(__dir, "jogar_style.ts");
  const sCss = readFileSync(LP, "utf8");
  if (sCss.indexOf(CSS_MARKER) === -1) {
    const anchor = ".ob-emoji{font-size:46px}}\n`;";
    if (sCss.split(anchor).length - 1 === 1) writeFileSync(LP, sCss.replace(anchor, "\n" + CSS_BLOCK + anchor), "utf8");
  }
  const JP = join(__dir, "jogar_page.ts");
  const sJs = readFileSync(JP, "utf8");
  if (sJs.indexOf(JS_MARKER) === -1) {
    const anchor = "<!-- [mobile-polish-v2-script] -->";
    if (sJs.split(anchor).length - 1 === 1) writeFileSync(JP, sJs.replace(anchor, JS_BLOCK + anchor), "utf8");
  }
} catch (e) { console.error("[polish_running] ERRO", e); }
