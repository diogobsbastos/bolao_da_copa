// Polish running — acumulador unico (patcha jogar_style.ts + jogar_page.ts + landing.ts).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));

const VERSION = "2026-06-13-25";
const CSS_MARKER = `/* POLISH-RUNNING-CSS ${VERSION} */`;
const JS_MARKER = `<!-- [polish-running-js ${VERSION}] -->`;
const LANDING_MARKER = `/* POLISH-LANDING-CSS ${VERSION} */`;

const CSS_BLOCK = `
${CSS_MARKER}
@media(max-width:600px){
 .pack.base{overflow:visible!important;position:relative!important}
 .pack.base button,.pack.base .btn{padding:8px 14px!important;font-size:13px!important;min-height:0!important;height:auto!important;line-height:1.2!important}

 .provcard.sel,.provcard.gem.sel{box-shadow:0 0 0 2px #1faa59 inset!important}

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

const LANDING_CSS = `
${LANDING_MARKER}
@media(max-width:560px){
 /* === HEADER da landing: TUDO em 1 linha === */
 .hlogo,.nav,.brand{
  display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;
  gap:6px!important;flex-wrap:nowrap!important;width:100%!important;overflow:hidden!important;
  padding:8px 12px!important;
 }
 /* Escudo MENOR */
 .blogo,.brand .blogo,.brand img,.hlogo img,.hlogo .blogo,[class*=blogo]{
  max-height:30px!important;max-width:30px!important;width:auto!important;height:auto!important;
  flex:0 0 auto!important;
 }
 /* Titulo BOLÃO COPA 26 compacto */
 .brand b,.brand strong,.brand .htitle,.brand>span,.htitle{
  font-size:15px!important;line-height:1!important;white-space:nowrap!important;
  flex:0 0 auto!important;min-width:0!important;letter-spacing:-.3px!important;
 }
 /* Beta tag colado no titulo */
 .bbeta,[class*=bbeta],[class*=beta-tag],[class*=tarja]{
  font-size:9px!important;padding:1px 5px!important;border-radius:4px!important;
  flex:0 0 auto!important;align-self:center!important;margin:0!important;
  white-space:nowrap!important;
 }
 /* Manager pill */
 [class*=manager],[class*=mgr]{font-size:10px!important;padding:2px 6px!important;flex:0 0 auto!important;white-space:nowrap!important}
 /* R$ pote pill puxado pra direita */
 .hmpote,[class*=hmpote],[class*=pote-pill],[class*=poteval]{
  font-size:11px!important;padding:3px 8px!important;flex:0 0 auto!important;
  white-space:nowrap!important;margin-left:auto!important;
 }
}
`;

const JS_BLOCK = `${JS_MARKER}<script>(function(){if(window.innerWidth>600)return;
// pkflag desktop values
function applyPkflag(el){var s=el.style;
 s.setProperty('position','absolute','important');s.setProperty('top','0','important');s.setProperty('right','0','important');s.setProperty('left','auto','important');s.setProperty('bottom','auto','important');
 s.setProperty('width','auto','important');s.setProperty('max-width','none','important');s.setProperty('height','auto','important');s.setProperty('min-height','0','important');s.setProperty('max-height','none','important');
 s.setProperty('padding','5px 13px','important');s.setProperty('border-radius','0 14px','important');s.setProperty('background','linear-gradient(135deg,#ffe07a,#e0a008)','important');s.setProperty('z-index','3','important');
 s.setProperty('display','flex','important');s.setProperty('flex-direction','row','important');s.setProperty('align-items','center','important');s.setProperty('justify-content','center','important');s.setProperty('gap','4px','important');
 s.setProperty('margin','0','important');s.setProperty('transform','none','important');s.setProperty('color','#000','important');s.setProperty('font-weight','700','important');s.setProperty('font-size','12px','important');s.setProperty('line-height','1','important');s.setProperty('white-space','nowrap','important');
 el.dataset.pillFixed='1';
 Array.from(el.querySelectorAll('svg, img')).forEach(function(c){c.style.setProperty('width','14px','important');c.style.setProperty('height','14px','important');c.style.setProperty('display','inline-block','important');c.style.setProperty('flex','0 0 auto','important');});}
function processPacks(){
 document.querySelectorAll('.pack.base').forEach(function(p){p.style.setProperty('overflow','visible','important');p.style.setProperty('position','relative','important');});
 document.querySelectorAll('.pack.base .pkflag, .pack.base [class*=pkflag]').forEach(function(el){applyPkflag(el);if(!el.dataset.observed){el.dataset.observed='1';var obs=new MutationObserver(function(){applyPkflag(el);});obs.observe(el,{attributes:true,attributeFilter:['style']});}});
}
processPacks();setInterval(processPacks,500);

function addMarketplaceBar(){
 document.querySelectorAll('h1,h2,h3,h4,[class*=title],[class*=secthd]').forEach(function(el){
  if(el.dataset.mbarFixed)return;
  var t=(el.textContent||'').trim();
  if(t==='Marketplace' && el.children.length<=1){
   el.style.setProperty('border-left','4px solid #1faa59','important');
   el.style.setProperty('padding-left','10px','important');
   el.style.setProperty('line-height','1.1','important');
   el.dataset.mbarFixed='1';
  }
 });
}
addMarketplaceBar();setInterval(addMarketplaceBar,1500);

document.addEventListener('click',function(e){
 if(!e.target||!e.target.closest)return;
 var card=e.target.closest('.provcard');
 if(!card)return;
 setTimeout(function(){
  var keys=document.querySelectorAll('input[type=password], input[name*=key], input[name*=chave], input[name*=api], textarea');
  for(var i=0;i<keys.length;i++){var k=keys[i];if(k.offsetParent===null)continue;k.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(function(){try{k.focus();}catch(_){}}, 350);return;}
 },300);
},true);

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
  const LDP = join(__dir, "landing.ts");
  const sLd = readFileSync(LDP, "utf8");
  if (sLd.indexOf(LANDING_MARKER) === -1) {
    const lAnchor = "@media(max-width:560px){.cdlab{display:none}.cdval{min-width:0}}";
    if (sLd.split(lAnchor).length - 1 === 1) writeFileSync(LDP, sLd.replace(lAnchor, lAnchor + "\n" + LANDING_CSS), "utf8");
  }
} catch (e) { console.error("[polish_running] ERRO", e); }
