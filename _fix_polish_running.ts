// Polish running — acumulador unico. Idempotencia via MARKER no CSS/script.
// Pra adicionar ajustes: muda VERSION + adiciona regras em CSS_BLOCK e/ou JS_BLOCK, restart 2x.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));

const VERSION = "2026-06-13-02";
const CSS_MARKER = `/* POLISH-RUNNING-CSS ${VERSION} */`;
const JS_MARKER = `<!-- [polish-running-js ${VERSION}] -->`;

// === CSS (jogar_style.ts) — tudo dentro de @media(max-width:600px) ===
const CSS_BLOCK = `
${CSS_MARKER}
@media(max-width:600px){
 /* 1.1 Marketplace — 1 produto por linha, imagem 88px esquerda + info flex direita */
 .market-grid,[class*=mgrid],[class*=market-list],[class*=packgrid]{grid-template-columns:1fr!important;display:grid!important;gap:10px!important;width:100%!important}
 .pack,[class*=pack-card],[class*=card-pack],[class*=packcard]{display:grid!important;grid-template-columns:88px 1fr!important;gap:10px!important;width:100%!important;max-width:100%!important;min-width:0!important;padding:10px!important;align-items:center}
 .pack img,.pack .pkimg,.pack [class*=pkimg],.pack [class*=packimg]{width:88px!important;max-width:88px!important;height:auto!important;object-fit:contain;margin:0 auto}
 .pack h3,.pack [class*=pktitle],.pack [class*=packtitle]{font-size:14px!important;margin:0 0 4px!important;line-height:1.2!important}
 .pack p,.pack .pkdesc,.pack [class*=pkdesc],.pack [class*=desc]{min-width:0!important;font-size:12px!important;line-height:1.3!important;margin:0!important}
 .pack .pksoon,.pack .pksoon2,.pack [class*=embreve],.pack [class*=badge]{font-size:10px!important;padding:3px 8px!important;display:inline-flex!important}
 .pack [class*=tag],.pack .pillchip{font-size:9px!important;padding:2px 5px!important}
 .pack [class*=btn]{padding:6px 10px!important;font-size:11px!important}

 /* 1.2 IA Conectada — box "conectada" sobe pro topo */
 .ia-conectada,.iaconectada,[class*=ia-conec],[class*=iaconec]{order:-1!important;margin:0 0 12px!important;width:100%!important}
 .ia-config,.iaconfig,[class*=ia-config]{display:flex!important;flex-direction:column!important;gap:10px!important}

 /* 1.4 Meu Time — esconde chip de formacao redundante + centraliza */
 .tmleft [class*=formacao],.tmleft .tmbadge[class*=4-4-2],[class*=tmleft-row] [class*=formacao]{display:none!important}
 .tmleft,[class*=tmleft]{align-items:center!important;justify-content:center!important}
 .tmleft .tmbadge,[class*=tmleft] .tmbadge{margin:0 auto!important}

 /* 1.5 Copa do Mundo — tabs com fonte/padding menores */
 #copa-tabs .tab,.copa-tabs .tab,[id*=copa-tabs] .tab{font-size:11px!important;padding:6px 9px!important;letter-spacing:-.2px!important}

 /* 1.6 Login screen — tarja Beta inline + logo menor + form centralizado */
 .brand-wrap,.logo-wrap,[class*=brand-wrap]{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;gap:10px!important;flex-wrap:wrap}
 .beta-tag,.tarja-beta,[class*=beta-tag],[class*=beta]{display:inline-flex!important;font-size:10px!important;padding:2px 6px!important;border-radius:4px;align-self:center}
 .blogo,.logo img,[class*=blogo],[class*=logo] img{max-height:64px!important;width:auto!important;height:auto!important}
 .login-card,.login-form,[class*=login-card],[class*=login-form]{width:100%!important;max-width:340px!important;margin:0 auto!important}
}
`;

// === JS (jogar_page.ts) — anchor: marker do v2 (manifest) ===
const JS_BLOCK = `${JS_MARKER}<script>(function(){if(window.innerWidth>600)return;
// 1.3 Conectar IA — clicar em provedor scrolla pro campo de chave
document.addEventListener('click',function(e){
 if(!e.target||!e.target.closest)return;
 var p=e.target.closest('[class*=provedor],[class*=ia-card],[class*=ia-prov],[class*=iaprov]');
 if(!p)return;
 setTimeout(function(){
  var k=document.querySelector('input[name=apikey],input[name=api_key],input[type=password]:not([name=senha]),[class*=apikey]');
  if(k){k.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(function(){try{k.focus();}catch(_){}}, 350);}
 },200);
},true);
// 1.5 Copa tabs encurtar texto
function shortenCopaTabs(){
 document.querySelectorAll('#copa-tabs .tab, .copa-tabs .tab').forEach(function(t){
  var s=(t.textContent||'').trim();
  if(s==='Eliminatórias')t.textContent='Mata-Mata';
  if(s==='Eliminatórias')t.textContent='Mata-Mata';
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',shortenCopaTabs);
else shortenCopaTabs();
setInterval(shortenCopaTabs,2000);
})();</script>`;

try {
  // 1) CSS patch
  const LP = join(__dir, "jogar_style.ts");
  const sCss = readFileSync(LP, "utf8");
  if (sCss.indexOf(CSS_MARKER) !== -1) {
    console.log("[polish_running]", VERSION, "css ja aplicado");
  } else {
    const anchor = ".ob-emoji{font-size:46px}}\n`;";
    if (sCss.split(anchor).length - 1 === 1) {
      const novo = sCss.replace(anchor, "\n" + CSS_BLOCK + anchor);
      writeFileSync(LP, novo, "utf8");
      console.log("[polish_running]", VERSION, "css delta=" + (novo.length - sCss.length));
    } else { console.error("[polish_running] anchor css invalido"); }
  }
  // 2) JS patch
  const JP = join(__dir, "jogar_page.ts");
  const sJs = readFileSync(JP, "utf8");
  if (sJs.indexOf(JS_MARKER) !== -1) {
    console.log("[polish_running]", VERSION, "js ja aplicado");
  } else {
    const anchor = "<!-- [mobile-polish-v2-script] -->";
    if (sJs.split(anchor).length - 1 === 1) {
      const novo = sJs.replace(anchor, JS_BLOCK + anchor);
      writeFileSync(JP, novo, "utf8");
      console.log("[polish_running]", VERSION, "js delta=" + (novo.length - sJs.length));
    } else { console.error("[polish_running] anchor js invalido"); }
  }
} catch (e) {
  console.error("[polish_running] ERRO", e);
}
