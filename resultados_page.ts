import { NAV_CSS, sideHtml, NAV_JS } from "./ui.js";

// Pagina /admin/resultados (3 abas: Jogos / Classificacao / Artilharia). Endpoints em jogos_placar.ts.
export const PAGINA_RESULTADOS = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Resultados Reais - Bolao da Copa 26</title>
<style>
:root{--pri:#4361ee;--bg:#f3f4f8;--card:#fff;--tx:#1f2430;--mut:#7a8194;--bd:#e6e8f0;--ok:#1faa59;--no:#e23744;--am:#e0a008;}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx)}
.app{display:flex;min-height:100vh}.main{flex:1;min-width:0}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 24px;background:var(--card);border-bottom:1px solid var(--bd)}
.top h2{margin:0;font-size:18px}
.pad{padding:18px 24px 60px;max-width:1040px}
.muted{color:var(--mut);font-size:13px}
.bar{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:14px;margin-bottom:8px;display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.bar .st{font-size:13px}.bar b{font-weight:800}
.btn{border:0;border-radius:9px;padding:9px 14px;font-weight:700;font-size:13px;cursor:pointer;color:#fff;background:var(--pri)}
.btn.g{background:var(--ok)}.btn.ghost{background:#eef1f6;color:var(--tx)}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin:14px 0 0}
.tab{padding:9px 16px;border-radius:11px 11px 0 0;border:1px solid var(--bd);border-bottom:0;background:#eef1f6;color:var(--mut);font-weight:700;font-size:13px;cursor:pointer}
.tab.on{background:var(--card);color:var(--pri);box-shadow:0 -2px 0 var(--pri) inset}
.tcont{padding-top:16px}.hide{display:none}
.phases{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px}
.ch{border:1px solid var(--bd);background:#fff;color:var(--mut);border-radius:999px;padding:6px 13px;font-size:12.5px;font-weight:700;cursor:pointer}
.ch.on{background:var(--pri);color:#fff;border-color:var(--pri)}
.dayh{font-weight:800;font-size:14px;margin:18px 0 8px;text-transform:capitalize}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.jg{background:var(--card);border:1px solid var(--bd);border-radius:11px;padding:10px 12px}
.jghd{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.hr{font-size:12px;color:var(--mut)}
.hd-r{margin-left:auto;display:flex;align-items:center;gap:7px}
.tm{display:flex;align-items:center;gap:7px;font-weight:600;font-size:14px;padding:3px 0}
.tm .sc{margin-left:auto;display:flex;align-items:center}
.scv{font-weight:800;font-size:17px;min-width:18px;text-align:center}
.sci{width:42px;text-align:center;padding:4px;border:1px solid var(--pri);border-radius:6px;font-size:15px;font-weight:700}
.fl{width:22px;height:16px;object-fit:cover;border-radius:2px;background:#e6e8f0}
.pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap}
.p-final{background:#e6f7ee;color:#0f7a45}.p-ag{background:#fdf3e0;color:#9a6a00}.p-pal{background:#eef1f6;color:#5a6275}
.lnk{cursor:pointer}.lnk:hover{filter:brightness(.96)}
.edbtn{border:1px solid var(--bd);background:#fff;color:var(--pri);border-radius:7px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer}
.edbtn:hover{background:#eef1f6}
.sv{border:0;background:var(--pri);color:#fff;border-radius:7px;padding:5px 11px;font-weight:700;font-size:12px;cursor:pointer}
.cxl{border:0;background:none;color:var(--mut);cursor:pointer;font-size:14px;line-height:1;padding:2px}
.apu{font-size:13px;font-weight:800}.apu.ok{color:var(--ok)}.apu.no{color:var(--am)}
.cgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.gp{background:var(--card);border:1px solid var(--bd);border-radius:12px;overflow:hidden}
.gph{padding:10px 14px;font-weight:800;font-size:14px;background:#eef1f6;border-bottom:1px solid var(--bd)}
.ct,.at{width:100%;border-collapse:collapse;font-size:12.5px}
.ct th,.ct td,.at th,.at td{padding:8px 7px;text-align:center}
.ct th,.at th{color:var(--mut);font-weight:700;font-size:11px;border-bottom:1px solid var(--bd);background:#fafbfd}
.ct td.nm,.at td.nm{text-align:left;font-weight:600}
.ct tr.q{background:#eafaf0}
.pos{color:var(--mut);font-weight:700}
.at{background:var(--card);border:1px solid var(--bd);border-radius:12px;overflow:hidden}
@media(max-width:820px){.grid,.cgrid{grid-template-columns:1fr}}
${NAV_CSS}
</style></head><body>
<div class="app">
 ${sideHtml("resultados")}
 <main class="main">
  <div class="top"><h2>&#127937; Resultados Reais</h2><span id="conn" class="muted">conectando...</span></div>
  <div class="pad">
   <div class="bar">
    <div class="st">Coletor: <b id="b-ultimo">&mdash;</b></div>
    <div class="st">Jogos apurados: <b id="b-apur">0</b></div>
    <div class="st">Aguardando apuracao: <b id="b-pend">0</b></div>
    <span style="flex:1"></span>
    <button class="btn g" onclick="coletar()">&#9889; Coletar agora</button>
    <button class="btn ghost" onclick="apurar()">Re-apurar pendentes</button>
    <span id="bar-msg" class="muted"></span>
   </div>

   <div class="tabs">
    <button class="tab on" id="tb-jogos" onclick="tab('jogos')">Jogos</button>
    <button class="tab" id="tb-classif" onclick="tab('classif')">Classificacao</button>
    <button class="tab" id="tb-artil" onclick="tab('artil')">Artilharia</button>
   </div>

   <div id="t-jogos" class="tcont">
    <div class="muted" style="margin-bottom:10px">Resultado REAL (status <b>final</b>) coletado no horario do jogo. Esta lista por data/horario tambem e o <b>mapa do coletor</b>. Clique <b>Editar</b> para lancar/corrigir na mao.</div>
    <div class="phases">
     <button class="ch on" data-f="grupos" onclick="setFase('grupos')">Fase de grupos</button>
     <button class="ch" data-f="r32" onclick="setFase('r32')">Rodada de 32</button>
     <button class="ch" data-f="oitavas" onclick="setFase('oitavas')">Oitavas</button>
     <button class="ch" data-f="quartas" onclick="setFase('quartas')">Quartas</button>
     <button class="ch" data-f="semi" onclick="setFase('semi')">Semi</button>
     <button class="ch" data-f="ter" onclick="setFase('ter')">3&ordm; e 4&ordm;</button>
     <button class="ch" data-f="final" onclick="setFase('final')">Final</button>
    </div>
    <div id="lista"><div class="muted">carregando...</div></div>
   </div>

   <div id="t-classif" class="tcont hide"><div id="classif-box"><div class="muted">carregando...</div></div></div>
   <div id="t-artil" class="tcont hide"><div id="artil-box"><div class="muted">carregando...</div></div></div>
  </div>
 </main>
</div>
<script>
${NAV_JS}
var JOGOS=[];var FASE="grupos";var loadedC=false,loadedA=false;
function H(){var h={"content-type":"application/json"};var s=localStorage.getItem("sessao");if(s){h["authorization"]="Bearer "+s;}return h;}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function fl(iso){return iso?('<img class="fl" src="https://flagcdn.com/w40/'+iso+'.png" onerror="this.style.opacity=.2">'):'<span class="fl"></span>';}
function fmtH(s){if(!s)return "";var d=new Date(s);if(isNaN(d))return esc(String(s).slice(11,16));return d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});}
function dayLabel(s){if(!s)return "Sem data";var d=new Date(s);if(isNaN(d))return esc(String(s).slice(0,10));return d.toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"2-digit"});}
function inFase(j,f){if(f==="grupos")return j.fase==="grupos";return j.fase!=="grupos"&&(j.rodada_mm===f);}
var COR={1:"#14a06a",2:"#e0a008",3:"#e23744",r32:"#2f6fed",oitavas:"#7a5cff",quartas:"#d4537e",semi:"#1d9e75",ter:"#b87333",final:"#caa63a"};
function corDe(j){return (j.fase==="grupos"?COR[j.rodada]:COR[j.rodada_mm])||"#9aa3b2";}
var RROT={r32:"Rodada de 32",oitavas:"Oitavas",quartas:"Quartas",semi:"Semi",ter:"3o e 4o",final:"Final"};
function rotuloRodada(j){return j.fase==="grupos"?("Rodada "+j.rodada):(RROT[j.rodada_mm]||"Mata-mata");}
function tab(t){
 ["jogos","classif","artil"].forEach(function(x){
  document.getElementById("t-"+x).classList.toggle("hide",x!==t);
  document.getElementById("tb-"+x).classList.toggle("on",x===t);
 });
 if(t==="classif"&&!loadedC){loadedC=true;loadClassif();}
 if(t==="artil"&&!loadedA){loadedA=true;loadArtil();}
}
function setFase(f){FASE=f;[].forEach.call(document.querySelectorAll(".ch"),function(c){c.classList.toggle("on",c.getAttribute("data-f")===f);});renderJogos();}
function carregarStatus(){
 fetch(_b()+"/admin/bolao/status",{headers:H()}).then(function(r){return r.ok?r.json():null;}).then(function(d){
  if(!d)return;document.getElementById("b-apur").textContent=d.jogosApurados||0;document.getElementById("b-pend").textContent=d.aguardandoApuracao||0;
  var st=d.status||{};document.getElementById("b-ultimo").textContent=esc(st.ultimo||st.em||st.quando||"sem registro");
 }).catch(function(){});
}
function stPill(j){
 var real=(j.real_c!=null&&j.real_v!=null);
 if(real)return '<span class="pill p-final">FINAL</span>';
 if(j.status==="encerrado")return '<span class="pill p-pal lnk" title="placar-base do robo - abrir Jogos & Placar" onclick="go(&#39;/admin/jogos-placar&#39;)">so palpite-base &#8599;</span>';
 return '<span class="pill p-ag lnk" title="o coletor dispara no horario do jogo - abrir Integracoes/Crons" onclick="go(&#39;/admin?pg=integ&#39;)">agendado &#8599;</span>';
}
function card(j){
 var real=(j.real_c!=null&&j.real_v!=null);
 var vc=real?j.real_c:"&ndash;",vv=real?j.real_v:"&ndash;";
 var ivc=real?j.real_c:"",ivv=real?j.real_v:"";
 var apu=real?(j.apurado?'<span class="apu ok" title="apurado">&#10003;</span>':'<span class="apu no" title="aguardando apuracao">&#8230;</span>'):'';
 var cor=corDe(j);return '<div class="jg" id="jg-'+j.id+'" style="border-left:3px solid '+cor+'">'
  +'<div class="jghd"><span class="hr">&#9200; '+fmtH(j.inicio)+'</span>'
  +'<span class="hd-r">'+stPill(j)+apu
  +'<button class="edbtn" id="ed-'+j.id+'" onclick="editar('+j.id+')">&#9998; Editar</button>'
  +'<button class="sv" id="sv-'+j.id+'" onclick="salvar('+j.id+')" style="display:none">Salvar</button>'
  +'<button class="cxl" id="cx-'+j.id+'" onclick="load()" style="display:none" title="cancelar">&#10005;</button>'
  +'</span></div>'
  +'<div class="tm">'+fl(j.casa_iso)+esc(j.casa_pt)+'<span class="sc"><span class="scv" id="scv-'+j.id+'-c">'+vc+'</span><input class="sci" id="rc-'+j.id+'" type="number" min="0" value="'+ivc+'" style="display:none"></span></div>'
  +'<div class="tm">'+fl(j.visit_iso)+esc(j.visit_pt)+'<span class="sc"><span class="scv" id="scv-'+j.id+'-v">'+vv+'</span><input class="sci" id="rv-'+j.id+'" type="number" min="0" value="'+ivv+'" style="display:none"></span></div>'
  +'</div>';
}
function editar(id){
 document.getElementById("scv-"+id+"-c").style.display="none";document.getElementById("scv-"+id+"-v").style.display="none";
 document.getElementById("rc-"+id).style.display="";document.getElementById("rv-"+id).style.display="";
 document.getElementById("ed-"+id).style.display="none";document.getElementById("sv-"+id).style.display="";document.getElementById("cx-"+id).style.display="";
 document.getElementById("rc-"+id).focus();
}
function renderJogos(){
 var L=document.getElementById("lista");
 var js=JOGOS.filter(function(j){return inFase(j,FASE);});
 if(!js.length){var msg=(FASE==="grupos")?"sem jogos (importe os jogos primeiro).":"Os jogos desta fase aparecem aqui quando a chave do mata-mata for definida (apos os grupos).";L.innerHTML='<div class="muted" style="padding:6px 2px">'+msg+'</div>';return;}
 var html="";var cur="";var aberto=false;
 js.forEach(function(j){var dl=dayLabel(j.inicio);if(dl!==cur){if(aberto)html+="</div>";cur=dl;var cor=corDe(j),rot=rotuloRodada(j);html+='<div class="dayh" style="border-left:4px solid '+cor+';padding-left:9px"><span>'+dl+'</span> <span style="color:'+cor+'">&middot; '+rot+'</span></div><div class="grid">';aberto=true;}html+=card(j);});
 if(aberto)html+="</div>";L.innerHTML=html;
}
async function load(){
 var c=document.getElementById("conn");
 var r=await fetch(_b()+"/admin/resultados/dados",{headers:H()});
 if(!r.ok){c.textContent="faca login no /admin";c.style.color="#e23744";return;}
 c.textContent="conectado";c.style.color="#1faa59";carregarStatus();
 JOGOS=(await r.json()).jogos||[];renderJogos();
}
async function loadClassif(){
 var B=document.getElementById("classif-box");
 var r=await fetch(_b()+"/admin/classificacao/dados",{headers:H()});
 if(!r.ok){B.innerHTML='<div class="muted">faca login no /admin.</div>';return;}
 var gs=(await r.json()).grupos||[];
 if(!gs.length){B.innerHTML='<div class="muted">sem grupos (importe os jogos).</div>';return;}
 B.innerHTML='<div class="muted" style="margin-bottom:10px">A partir dos <b>resultados reais</b>. P=pontos &middot; J=jogos &middot; V/E/D &middot; GP/GC &middot; SG=saldo.</div><div class="cgrid">'+gs.map(function(g){
  var ls=g.times.map(function(t,i){return '<tr class="'+(i<2?"q":"")+'"><td class="pos">'+(i+1)+'</td><td class="nm">'+fl(t.iso)+esc(t.pt)+'</td><td><b>'+t.p+'</b></td><td>'+t.j+'</td><td>'+t.v+'</td><td>'+t.e+'</td><td>'+t.d+'</td><td>'+t.gp+'</td><td>'+t.gc+'</td><td>'+(t.sg>0?"+":"")+t.sg+'</td></tr>';}).join("");
  return '<div class="gp"><div class="gph">'+esc(g.grupo)+'</div><table class="ct"><thead><tr><th></th><th style="text-align:left">Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr></thead><tbody>'+ls+'</tbody></table></div>';
 }).join("")+'</div>';
}
async function loadArtil(){
 var B=document.getElementById("artil-box");
 var r=await fetch(_b()+"/admin/resultados/artilharia",{headers:H()});
 if(!r.ok){B.innerHTML='<div class="muted">faca login no /admin.</div>';return;}
 var a=(await r.json()).artilheiros||[];
 if(!a.length){B.innerHTML='<div class="muted">Sem dados de artilharia ainda &mdash; popula conforme os gols forem registrados (depende do feed de gols por jogo). Tabela pronta pra consultar quanto cada jogador pontuou.</div>';return;}
 B.innerHTML='<table class="at"><thead><tr><th>#</th><th style="text-align:left">Jogador</th><th>Selecao</th><th>Gols</th><th>Assist.</th><th>Nota</th><th>Jogos</th></tr></thead><tbody>'+a.map(function(p,i){return '<tr><td class="pos">'+(i+1)+'</td><td class="nm">'+esc(p.nome)+'</td><td class="nm">'+fl(p.iso)+esc(p.sel_pt)+'</td><td><b>'+p.gols+'</b></td><td>'+(p.ass||0)+'</td><td>'+(p.nota!=null?p.nota:"-")+'</td><td>'+(p.jogos||0)+'</td></tr>';}).join("")+'</tbody></table>';
}
async function salvar(id){
 var rc=parseInt(document.getElementById("rc-"+id).value,10),rv=parseInt(document.getElementById("rv-"+id).value,10);
 if(isNaN(rc)||isNaN(rv)){alert("preencha os dois placares");return;}
 var m=document.getElementById("bar-msg");m.textContent="salvando jogo "+id+"...";
 var r=await fetch(_b()+"/admin/bolao/resultado",{method:"POST",headers:H(),body:JSON.stringify({jogo_id:id,rc:rc,rv:rv})});
 var j=await r.json().catch(function(){return{};});
 m.textContent=r.ok?("jogo "+id+" salvo e apurado."):("erro: "+(j.erro||r.status));load();
}
async function coletar(){
 var m=document.getElementById("bar-msg");m.textContent="coletando resultados agora...";
 var r=await fetch(_b()+"/admin/bolao/coletar",{method:"POST",headers:H()});await r.json().catch(function(){});m.textContent=r.ok?"coleta disparada.":"falhou.";load();
}
async function apurar(){
 var m=document.getElementById("bar-msg");m.textContent="re-apurando pendentes...";
 var r=await fetch(_b()+"/admin/bolao/apurar",{method:"POST",headers:H()});await r.json().catch(function(){});m.textContent=r.ok?"apuracao rodada.":"falhou.";load();
}
load();
</script></body></html>`;
