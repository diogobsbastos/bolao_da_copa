// Polish running — acumulador unico. Idempotencia via MARKER no CSS/script.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));

const VERSION = "2026-06-13-05";
const CSS_MARKER = `/* POLISH-RUNNING-CSS ${VERSION} */`;
const JS_MARKER = `<!-- [polish-running-js ${VERSION}] -->`;

const CSS_BLOCK = `
${CSS_MARKER}
@media(max-width:600px){
 /* === Marketplace: card altura = imagem natural === */
 .grid:has(> .pack){grid-template-columns:1fr!important;gap:14px!important;padding-left:12px!important;padding-right:12px!important}
 .pack.base{display:grid!important;grid-template-columns:130px 1fr!important;grid-template-rows:auto!important;width:100%!important;max-width:100%!important;min-height:0!important;height:auto!important;padding:0!important;overflow:hidden!important;align-items:start!important;gap:0!important;margin-left:0!important}
 .pack.base>img,.pack.base>picture,.pack.base>[class*=img],.pack.base>[class*=fig]{width:130px!important;height:auto!important;max-width:130px!important;max-height:none!important;object-fit:contain!important;align-self:start!important;margin:0!important;border-radius:0!important;display:block!important;grid-column:1!important;grid-row:1!important}
 .pack.base>*:not(img):not(picture):not([class*=img]):not([class*=fig]){padding:12px 12px 12px 14px!important;align-self:start!important;grid-column:2!important;min-width:0!important;display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:6px!important}
 .pack.base h3,.pack.base [class*=title]{font-size:17px!important;margin:0!important;line-height:1.15!important;font-weight:700}
 .pack.base p,.pack.base [class*=desc],.pack.base [class*=sub]{font-size:13px!important;line-height:1.35!important;margin:0!important}
 .pack.base .pksoon,.pack.base .pksoon2,.pack.base [class*=embreve],.pack.base [class*=badge]{font-size:11px!important;padding:4px 10px!important;display:inline-flex!important}
 .pack.base button,.pack.base [class*=btn]{padding:8px 14px!important;font-size:12px!important;width:100%!important;margin-top:6px!important}

 /* === HEADER: garante que escudo/logo nao vazem === */
 .top .brand{flex:0 0 auto!important;max-width:42px!important;overflow:hidden!important}
 .top .brand .blogo,.top .brand img{max-height:32px!important;max-width:32px!important;width:auto!important;height:auto!important;flex:0 0 auto!important}
 .top .burger{flex:0 0 auto!important}

 /* === IA panel NUCLEAR hide === */
 div#autobar.actpanel:not([data-user-opened="1"]),
 .actpanel:not([data-user-opened="1"]){display:none!important;visibility:hidden!important}
 div#autobar.actpanel[data-user-opened="1"],
 .actpanel[data-user-opened="1"]{display:flex!important;visibility:visible!important}

 /* === Tabs sem fade, vai ate borda === */
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
 }
});}
hide442();setInterval(hide442,1500);
})();</script>`;

try {
  const LP = join(__dir, "jogar_style.ts");
  const sCss = readFileSync(LP, "utf8");
  if (sCss.indexOf(CSS_MARKER) === -1) {
    const anchor = ".ob-emoji{font-size:46px}}\n`;";
    if (sCss.split(anchor).length - 1 === 1) {
      writeFileSync(LP, sCss.replace(anchor, "\n" + CSS_BLOCK + anchor), "utf8");
      console.log("[polish_running]", VERSION, "css aplicado");
    }
  }
  const JP = join(__dir, "jogar_page.ts");
  const sJs = readFileSync(JP, "utf8");
  if (sJs.indexOf(JS_MARKER) === -1) {
    const anchor = "<!-- [mobile-polish-v2-script] -->";
    if (sJs.split(anchor).length - 1 === 1) {
      writeFileSync(JP, sJs.replace(anchor, JS_BLOCK + anchor), "utf8");
      console.log("[polish_running]", VERSION, "js aplicado");
    }
  }
} catch (e) { console.error("[polish_running] ERRO", e); }
