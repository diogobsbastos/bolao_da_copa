// Polish running — acumulador unico.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));

const VERSION = "2026-06-13-22";
const CSS_MARKER = `/* POLISH-RUNNING-CSS ${VERSION} */`;
const JS_MARKER = `<!-- [polish-running-js ${VERSION}] -->`;

const CSS_BLOCK = `
${CSS_MARKER}
@media(max-width:600px){
 .pack.base{overflow:visible!important;position:relative!important}
 .pack.base button,.pack.base .btn{padding:8px 14px!important;font-size:13px!important;min-height:0!important;height:auto!important;line-height:1.2!important}

 .top .brand{flex:0 0 auto!important;max-width:42px!important;overflow:hidden!important}
 .top .brand .blogo,.top .brand img{max-height:32px!important;max-width:32px!important;width:auto!important;height:auto!important}
 .top .burger{flex:0 0 auto!important}

 div#autobar.actpanel:not([data-user-opened="1"]),.actpanel:not([data-user-opened="1"]){display:none!important;visibility:hidden!important}
 div#autobar.actpanel[data-user-opened="1"],.actpanel[data-user-opened="1"]{display:flex!important;visibility:visible!important}

 .tabs,#copa-tabs,#bolao-tabs,#rank-tabs,.copa-tabs,.bolao-tabs,.rank-tabs{mask-image:none!important;-webkit-mask-image:none!important;padding-right:0!important;margin-right:0!important}
 #copa-tabs .tab,.copa-tabs .tab,#bolao-tabs .tab,#rank-tabs .tab{font-size:11px!important;padding:6px 9px!important;letter-spacing:-.2px!important}

 [class*=ia-conec]{order:-1!important;margin:0 0 12px!important;width:100%!important}
 .tmleft .tmbadge:nth-child(1),[class*=tmleft] .tmbadge:nth-child(1){display:none!important}
 .tmleft{align-items:center!important;justify-content:center!important}
}
`;

// JS v22: MutationObserver detecta qq mudança no style do pkflag e RE-APLICA desktop values
const JS_BLOCK = `${JS_MARKER}<script>(function(){if(window.innerWidth>600)return;
var applying=false;
function applyPkflag(el){
 if(applying)return;applying=true;
 var s=el.style;
 s.setProperty('position','absolute','important');
 s.setProperty('top','0','important');
 s.setProperty('right','0','important');
 s.setProperty('left','auto','important');
 s.setProperty('bottom','auto','important');
 s.setProperty('width','auto','important');
 s.setProperty('max-width','none','important');
 s.setProperty('height','auto','important');
 s.setProperty('min-height','0','important');
 s.setProperty('max-height','none','important');
 s.setProperty('padding','5px 13px','important');
 s.setProperty('border-radius','0 14px','important');
 s.setProperty('background','linear-gradient(135deg,#ffe07a,#e0a008)','important');
 s.setProperty('z-index','3','important');
 s.setProperty('display','flex','important');
 s.setProperty('flex-direction','row','important');
 s.setProperty('align-items','center','important');
 s.setProperty('justify-content','center','important');
 s.setProperty('gap','4px','important');
 s.setProperty('margin','0','important');
 s.setProperty('transform','none','important');
 s.setProperty('color','#000','important');
 s.setProperty('font-weight','700','important');
 s.setProperty('font-size','12px','important');
 s.setProperty('line-height','1','important');
 s.setProperty('white-space','nowrap','important');
 el.dataset.pillFixed='1';
 Array.from(el.querySelectorAll('svg, img')).forEach(function(c){
  c.style.setProperty('width','14px','important');
  c.style.setProperty('height','14px','important');
  c.style.setProperty('display','inline-block','important');
  c.style.setProperty('flex','0 0 auto','important');
 });
 applying=false;
}
function processPacks(){
 document.querySelectorAll('.pack.base').forEach(function(p){
  p.style.setProperty('overflow','visible','important');
  p.style.setProperty('position','relative','important');
 });
 document.querySelectorAll('.pack.base .pkflag, .pack.base [class*=pkflag]').forEach(function(el){
  applyPkflag(el);
  if(!el.dataset.observed){
   el.dataset.observed='1';
   var obs=new MutationObserver(function(){applyPkflag(el);});
   obs.observe(el,{attributes:true,attributeFilter:['style']});
  }
 });
}
processPacks();setInterval(processPacks,500);
// Tb observa o body pra novos packs renderizados
if(typeof MutationObserver!=='undefined'){
 var bodyObs=new MutationObserver(function(){processPacks();});
 if(document.body)bodyObs.observe(document.body,{childList:true,subtree:true});
 else document.addEventListener('DOMContentLoaded',function(){bodyObs.observe(document.body,{childList:true,subtree:true});});
}

function getPanel(){return document.querySelector('#autobar.actpanel, .actpanel');}
function ensureClosed(){var a=getPanel();if(!a)return;if(a.getAttribute('data-user-opened')!=='1'){if(a.style.display){a.style.removeProperty('display');}}}
document.addEventListener('click',function(e){if(!e.target||!e.target.closest)return;var a=getPanel();if(!a)return;
 if(e.target.closest('.autofab')){a.setAttribute('data-user-opened','1');a.style.removeProperty('display');a.style.display='flex';}
 if(e.target.closest('.actcol')){a.removeAttribute('data-user-opened');a.style.removeProperty('display');}
},true);
ensureClosed();setInterval(ensureClosed,400);

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
