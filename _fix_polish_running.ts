// Polish running — acumulador unico. Idempotencia via MARKER no CSS/script.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));

const VERSION = "2026-06-13-03";
const CSS_MARKER = `/* POLISH-RUNNING-CSS ${VERSION} */`;
const JS_MARKER = `<!-- [polish-running-js ${VERSION}] -->`;

// === CSS — mobile only ===
const CSS_BLOCK = `
${CSS_MARKER}
@media(max-width:600px){
 /* === Marketplace: 1 produto por linha, imagem ESQ altura completa, info DIR maior === */
 .grid:has(> .pack){grid-template-columns:1fr!important;gap:14px!important}
 .pack.base{display:grid!important;grid-template-columns:130px 1fr!important;grid-template-rows:1fr!important;width:100%!important;max-width:100%!important;min-height:200px!important;padding:0!important;overflow:hidden!important;align-items:stretch!important;gap:0!important}
 .pack.base>img,.pack.base>picture,.pack.base>[class*=img],.pack.base>[class*=fig]{width:100%!important;height:100%!important;max-width:130px!important;object-fit:cover!important;align-self:stretch!important;margin:0!important;border-radius:0!important;display:block!important;grid-column:1!important;grid-row:1!important}
 .pack.base>*:not(img):not(picture):not([class*=img]):not([class*=fig]){padding:14px 14px 14px 12px!important;align-self:center!important;grid-column:2!important;min-width:0!important}
 .pack.base h3,.pack.base [class*=title]{font-size:17px!important;margin:0 0 6px!important;line-height:1.15!important;font-weight:700}
 .pack.base p,.pack.base [class*=desc],.pack.base [class*=sub]{font-size:13px!important;line-height:1.35!important;margin:0 0 6px!important}
 .pack.base .pksoon,.pack.base .pksoon2,.pack.base [class*=embreve],.pack.base [class*=badge]{font-size:11px!important;padding:4px 10px!important;display:inline-flex!important}
 .pack.base button,.pack.base [class*=btn]{padding:8px 14px!important;font-size:12px!important;width:100%!important;margin-top:6px!important}
 .pack.base [class*=tag]{font-size:10px!important;padding:3px 7px!important}

 /* === IA panel (Bolao): NUCLEAR hide. So abre quando user clica no .autofab === */
 div#autobar.actpanel:not([data-user-opened="1"]),
 .actpanel:not([data-user-opened="1"]){display:none!important;visibility:hidden!important}
 div#autobar.actpanel[data-user-opened="1"],
 .actpanel[data-user-opened="1"]{display:flex!important;visibility:visible!important}

 /* === Tabs Copa/Bolao/Rank: remove mask fade + vai ate borda === */
 .tabs,#copa-tabs,#bolao-tabs,#rank-tabs,.copa-tabs,.bolao-tabs,.rank-tabs{mask-image:none!important;-webkit-mask-image:none!important;padding-right:0!important;margin-right:0!important}
 #copa-tabs .tab,.copa-tabs .tab,#bolao-tabs .tab,#rank-tabs .tab{font-size:11px!important;padding:6px 9px!important;letter-spacing:-.2px!important}

 /* === Conectar IA — box "conectada" sobe pro topo === */
 [class*=ia-conec]{order:-1!important;margin:0 0 12px!important;width:100%!important}

 /* === Meu Time — esconde chip de formacao redundante na coluna esq === */
 .tmleft [class*=formacao],.tmleft .tmbadge:first-child{display:none!important}
 .tmleft{align-items:center!important;justify-content:center!important}
}
`;

// === JS — mobile only ===
const JS_BLOCK = `${JS_MARKER}<script>(function(){if(window.innerWidth>600)return;
// IA panel: click handler + nuclear loop pra garantir hide
function getPanel(){return document.querySelector('#autobar.actpanel, .actpanel');}
function ensureClosed(){
 var a=getPanel();if(!a)return;
 if(a.getAttribute('data-user-opened')!=='1'){
  if(a.style.display){a.style.removeProperty('display');}
 }
}
document.addEventListener('click',function(e){
 if(!e.target||!e.target.closest)return;
 var a=getPanel();if(!a)return;
 if(e.target.closest('.autofab')){a.setAttribute('data-user-opened','1');a.style.removeProperty('display');a.style.display='flex';}
 if(e.target.closest('.actcol')){a.removeAttribute('data-user-opened');a.style.removeProperty('display');}
},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureClosed);
else ensureClosed();
setInterval(ensureClosed,400);

// Copa tabs encurtar texto
function shortenCopaTabs(){
 document.querySelectorAll('#copa-tabs .tab, .copa-tabs .tab').forEach(function(t){
  var s=(t.textContent||'').trim();
  if(s==='Eliminatórias')t.textContent='Mata-Mata';
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',shortenCopaTabs);
else shortenCopaTabs();
setInterval(shortenCopaTabs,2000);
})();</script>`;

try {
  const LP = join(__dir, "jogar_style.ts");
  const sCss = readFileSync(LP, "utf8");
  if (sCss.indexOf(CSS_MARKER) === -1) {
    const anchor = ".ob-emoji{font-size:46px}}\n`;";
    if (sCss.split(anchor).length - 1 === 1) {
      const novo = sCss.replace(anchor, "\n" + CSS_BLOCK + anchor);
      writeFileSync(LP, novo, "utf8");
      console.log("[polish_running]", VERSION, "css delta=" + (novo.length - sCss.length));
    } else console.error("[polish_running] anchor css invalido");
  } else console.log("[polish_running]", VERSION, "css ja aplicado");

  const JP = join(__dir, "jogar_page.ts");
  const sJs = readFileSync(JP, "utf8");
  if (sJs.indexOf(JS_MARKER) === -1) {
    const anchor = "<!-- [mobile-polish-v2-script] -->";
    if (sJs.split(anchor).length - 1 === 1) {
      const novo = sJs.replace(anchor, JS_BLOCK + anchor);
      writeFileSync(JP, novo, "utf8");
      console.log("[polish_running]", VERSION, "js delta=" + (novo.length - sJs.length));
    } else console.error("[polish_running] anchor js invalido");
  } else console.log("[polish_running]", VERSION, "js ja aplicado");
} catch (e) {
  console.error("[polish_running] ERRO", e);
}
