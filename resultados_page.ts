import { NAV_CSS, sideHtml, NAV_JS } from "./ui.js";

// Pagina /admin/resultados (resultados REAIS coletados). Endpoint /admin/resultados/dados em jogos_placar.ts.
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
.dayh{font-weight:800;font-size:14px;margin:18px 0 8px;text-transform:capitalize}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.jg{background:var(--card);border:1px solid var(--bd);border-radius:11px;padding:10px 12px}
.jghd{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
.hr{font-size:12px;color:var(--mut)}
.tms{}
.tm{display:flex;align-items:center;gap:7px;font-weight:600;font-size:13.5px;padding:2px 0}
.tm .sc{margin-left:auto;font-weight:800;font-size:16px}
.fl{width:22px;height:16px;object-fit:cover;border-radius:2px;background:#e6e8f0}
.pal{font-size:11px;color:var(--mut);margin-top:5px}
.pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap}
.p-final{background:#e6f7ee;color:#0f7a45}.p-ag{background:#fdf3e0;color:#9a6a00}.p-pal{background:#eef1f6;color:#5a6275}
.lnk{cursor:pointer}.lnk:hover{filter:brightness(.96)}
.ed{display:flex;align-items:center;gap:6px;margin-top:8px}
.ed input{width:44px;text-align:center;padding:6px;border:1px solid var(--bd);border-radius:7px;font-size:14px}
.ed .x{color:var(--mut)}.ed .cl{font-size:11px;color:var(--mut);margin-right:2px}
.sv{border:0;background:var(--pri);color:#fff;border-radius:7px;padding:7px 10px;font-weight:700;font-size:12px;cursor:pointer}
.apu{font-size:11px;font-weight:700}.apu.ok{color:var(--ok)}.apu.no{color:var(--am)}
@media(max-width:820px){.grid{grid-template-columns:1fr}}
${NAV_CSS}
</style></head><body>
<div class="app">
 ${sideHtml("resultados")}
 <main class="main">
  <div class="top"><h2>&#127937; Resultados Reais</h2><span id="conn" class="muted">conectando...</span></div>
  <div class="pad">
   <div class="muted" style="margin-bottom:12px">Resultado REAL coletado do 365scores no horario do jogo (<code>jogos.resultado_*</code>, status <b>final</b>). A apuracao compara os palpites com este resultado. Confira se o cron trabalhou e corrija na mao se precisar.</div>
   <div class="bar">
    <div class="st">Coletor: <b id="b-ultimo">&mdash;</b></div>
    <div class="st">Jogos apurados: <b id="b-apur">0</b></div>
    <div class="st">Aguardando apuracao: <b id="b-pend">0</b></div>
    <span style="flex:1"></span>
    <button class="btn g" onclick="coletar()">&#9889; Coletar agora</button>
    <button class="btn ghost" onclick="apurar()">Re-apurar pendentes</button>
    <span id="bar-msg" class="muted"></span>
   </div>
   <div id="lista"><div class="muted">carregando...</div></div>
  </div>
 </main>
</div>
<script>
${NAV_JS}
function H(){var h={"content-type":"application/json"};var s=localStorage.getItem("sessao");if(s){h["authorization"]="Bearer "+s;}return h;}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function fl(iso){return iso?('<img class="fl" src="https://flagcdn.com/w40/'+iso+'.png" onerror="this.style.opacity=.2">'):'<span class="fl"></span>';}
function fmtH(s){if(!s)return "";var d=new Date(s);if(isNaN(d))return esc(String(s).slice(11,16));return d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});}
function dayLabel(s){if(!s)return "Sem data";var d=new Date(s);if(isNaN(d))return esc(String(s).slice(0,10));return d.toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"2-digit"});}
function stPill(j){
 var real=(j.real_c!=null&&j.real_v!=null);
 if(real)return '<span class="pill p-final">FINAL</span>';
 if(j.status==="encerrado")return '<span class="pill p-pal lnk" title="placar-base do robo - abrir Jogos & Placar" onclick="go(&#39;/admin/jogos-placar&#39;)">so palpite-base &#8599;</span>';
 return '<span class="pill p-ag lnk" title="o coletor dispara no horario do jogo - abrir Integracoes/Crons" onclick="go(&#39;/admin?pg=integ&#39;)">agendado &#8599;</span>';
}
async function carregarStatus(){
 try{var r=await fetch(_b()+"/admin/bolao/status",{headers:H()});if(!r.ok)return;var d=await r.json();
  document.getElementById("b-apur").textContent=d.jogosApurados||0;
  document.getElementById("b-pend").textContent=d.aguardandoApuracao||0;
  var st=d.status||{};document.getElementById("b-ultimo").textContent=esc(st.ultimo||st.em||st.quando||"sem registro");
 }catch(e){}
}
function card(j){
 var real=(j.real_c!=null&&j.real_v!=null);
 var scC=real?j.real_c:"&ndash;",scV=real?j.real_v:"&ndash;";
 var palTxt=(j.palpite_c!=null)?('palpite-base: '+j.palpite_c+' x '+j.palpite_v):'';
 var apu=real?(j.apurado?' &middot; <span class="apu ok">apurado &#10003;</span>':' &middot; <span class="apu no">aguardando apuracao</span>'):'';
 return '<div class="jg">'
  +'<div class="jghd"><span class="hr">&#9200; '+fmtH(j.inicio)+'</span>'+stPill(j)+'</div>'
  +'<div class="tms">'
  +'<div class="tm">'+fl(j.casa_iso)+esc(j.casa_pt)+'<span class="sc">'+scC+'</span></div>'
  +'<div class="tm">'+fl(j.visit_iso)+esc(j.visit_pt)+'<span class="sc">'+scV+'</span></div>'
  +'</div>'
  +((palTxt||apu)?'<div class="pal">'+palTxt+apu+'</div>':'')
  +'<div class="ed"><span class="cl">corrigir:</span><input id="rc-'+j.id+'" type="number" min="0" value="'+(j.real_c!=null?j.real_c:"")+'"><span class="x">x</span>'
  +'<input id="rv-'+j.id+'" type="number" min="0" value="'+(j.real_v!=null?j.real_v:"")+'">'
  +'<button class="sv" onclick="salvar('+j.id+')">Salvar</button></div>'
  +'</div>';
}
async function load(){
 var c=document.getElementById("conn");
 var r=await fetch(_b()+"/admin/resultados/dados",{headers:H()});
 if(!r.ok){c.textContent="faca login no /admin";c.style.color="#e23744";return;}
 c.textContent="conectado";c.style.color="#1faa59";
 carregarStatus();
 var js=(await r.json()).jogos||[];
 var L=document.getElementById("lista");
 if(!js.length){L.innerHTML='<div class="muted">sem jogos (importe os jogos primeiro).</div>';return;}
 var html="";var cur="";var aberto=false;
 js.forEach(function(j){
  var dl=dayLabel(j.inicio);
  if(dl!==cur){if(aberto)html+="</div>";cur=dl;html+='<div class="dayh">'+dl+'</div><div class="grid">';aberto=true;}
  html+=card(j);
 });
 if(aberto)html+="</div>";
 L.innerHTML=html;
}
async function salvar(id){
 var rc=parseInt(document.getElementById("rc-"+id).value,10),rv=parseInt(document.getElementById("rv-"+id).value,10);
 if(isNaN(rc)||isNaN(rv)){alert("preencha os dois placares");return;}
 var m=document.getElementById("bar-msg");m.textContent="salvando jogo "+id+"...";
 var r=await fetch(_b()+"/admin/bolao/resultado",{method:"POST",headers:H(),body:JSON.stringify({jogo_id:id,rc:rc,rv:rv})});
 var j=await r.json().catch(function(){return{};});
 m.textContent=r.ok?("jogo "+id+" salvo e apurado."):("erro: "+(j.erro||r.status));
 load();
}
async function coletar(){
 var m=document.getElementById("bar-msg");m.textContent="coletando resultados agora (pode levar alguns segundos)...";
 var r=await fetch(_b()+"/admin/bolao/coletar",{method:"POST",headers:H()});
 await r.json().catch(function(){});m.textContent=r.ok?"coleta disparada.":"falhou.";load();
}
async function apurar(){
 var m=document.getElementById("bar-msg");m.textContent="re-apurando pendentes...";
 var r=await fetch(_b()+"/admin/bolao/apurar",{method:"POST",headers:H()});
 await r.json().catch(function(){});m.textContent=r.ok?"apuracao rodada.":"falhou.";load();
}
load();
</script></body></html>`;
