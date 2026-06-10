import { NAV_CSS, sideHtml, NAV_JS } from "./ui.js";

// Pagina /admin/classificacao (separada da logica). Endpoint /admin/classificacao/dados em jogos_placar.ts.
export const PAGINA_CLASS = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Classificacao dos Grupos - Bolao da Copa 26</title>
<style>
:root{--pri:#4361ee;--bg:#f3f4f8;--card:#fff;--tx:#1f2430;--mut:#7a8194;--bd:#e6e8f0;--ok:#1faa59;--no:#e23744;}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx)}
.app{display:flex;min-height:100vh}.main{flex:1;min-width:0}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 24px;background:var(--card);border-bottom:1px solid var(--bd)}
.top h2{margin:0;font-size:18px}
.pad{padding:18px 24px 60px;max-width:1040px}
.muted{color:var(--mut);font-size:13px}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.gp{background:var(--card);border:1px solid var(--bd);border-radius:12px;overflow:hidden}
.gph{padding:10px 14px;font-weight:800;font-size:14px;background:#eef1f6;border-bottom:1px solid var(--bd)}
table{width:100%;border-collapse:collapse;font-size:12.5px}
th,td{padding:7px 6px;text-align:center}
th{color:var(--mut);font-weight:700;font-size:11px;border-bottom:1px solid var(--bd)}
td.nm{text-align:left;font-weight:600}
tr.q{background:#eafaf0}
.fl{width:22px;height:16px;object-fit:cover;border-radius:2px;vertical-align:middle;margin-right:7px;background:#e6e8f0}
.pos{color:var(--mut);font-weight:700}
.pt{font-weight:800}
.leg{font-size:11px;color:var(--mut);margin-top:10px}
.dot{display:inline-block;width:10px;height:10px;border-radius:3px;background:#eafaf0;border:1px solid #bde6cd;vertical-align:middle;margin-right:5px}
@media(max-width:820px){.grid{grid-template-columns:1fr}}
${NAV_CSS}
</style></head><body>
<div class="app">
 ${sideHtml("classif")}
 <main class="main">
  <div class="top"><h2>&#127942; Classificacao dos Grupos</h2><span id="conn" class="muted">conectando...</span></div>
  <div class="pad">
   <div class="muted" style="margin-bottom:12px">Calculada a partir dos <b>resultados reais</b> coletados (mesma base do app do jogador). P=pontos · J=jogos · V/E/D · GP/GC · SG=saldo.</div>
   <div class="grid" id="grid"><div class="muted" style="padding:14px">carregando...</div></div>
   <div class="leg"><span class="dot"></span> primeiros 2 de cada grupo (classificados)</div>
  </div>
 </main>
</div>
<script>
${NAV_JS}
function H(){var h={"content-type":"application/json"};var s=localStorage.getItem("sessao");if(s){h["authorization"]="Bearer "+s;}return h;}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function fl(iso){return iso?('<img class="fl" src="https://flagcdn.com/w40/'+iso+'.png" onerror="this.style.opacity=.2">'):'<span class="fl"></span>';}
async function init(){
 var c=document.getElementById("conn");
 var r=await fetch(_b()+"/admin/classificacao/dados",{headers:H()});
 if(!r.ok){c.textContent="faca login no /admin";c.style.color="#e23744";return;}
 c.textContent="conectado";c.style.color="#1faa59";
 var gs=(await r.json()).grupos||[];
 var G=document.getElementById("grid");
 if(!gs.length){G.innerHTML='<div class="muted" style="padding:14px">sem grupos (importe os jogos).</div>';return;}
 G.innerHTML=gs.map(function(g){
  var linhas=g.times.map(function(t,i){
   return '<tr class="'+(i<2?"q":"")+'"><td class="pos">'+(i+1)+'</td>'
    +'<td class="nm">'+fl(t.iso)+esc(t.pt)+'</td>'
    +'<td class="pt">'+t.p+'</td><td>'+t.j+'</td><td>'+t.v+'</td><td>'+t.e+'</td><td>'+t.d+'</td>'
    +'<td>'+t.gp+'</td><td>'+t.gc+'</td><td>'+(t.sg>0?"+":"")+t.sg+'</td></tr>';
  }).join("");
  return '<div class="gp"><div class="gph">'+esc(g.grupo)+'</div>'
   +'<table><thead><tr><th></th><th style="text-align:left">Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr></thead>'
   +'<tbody>'+linhas+'</tbody></table></div>';
 }).join("");
}
init();
</script></body></html>`;
