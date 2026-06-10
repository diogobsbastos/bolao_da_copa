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
.bar{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:14px;margin-bottom:16px;display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.bar .st{font-size:13px}.bar b{font-weight:800}
.btn{border:0;border-radius:9px;padding:9px 14px;font-weight:700;font-size:13px;cursor:pointer;color:#fff;background:var(--pri)}
.btn.g{background:var(--ok)}.btn.ghost{background:#eef1f6;color:var(--tx)}
.sech{font-weight:800;font-size:14px;margin:18px 0 8px}
.jg{background:var(--card);border:1px solid var(--bd);border-radius:11px;padding:10px 12px;margin-bottom:8px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.jg .tms{min-width:210px;flex:1}
.tm{display:flex;align-items:center;gap:7px;font-weight:600;font-size:13.5px;padding:2px 0}
.fl{width:22px;height:16px;object-fit:cover;border-radius:2px;background:#e6e8f0}
.mid{min-width:150px;text-align:center}
.hr{font-size:12px;color:var(--mut)}
.real{font-weight:800;font-size:16px;margin-top:2px}
.pal{font-size:11px;color:var(--mut)}
.pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700}
.p-final{background:#e6f7ee;color:#0f7a45}.p-ag{background:#fdf3e0;color:#9a6a00}.p-none{background:#eef1f6;color:#7a8194}
.ed{display:flex;align-items:center;gap:6px}
.ed input{width:46px;text-align:center;padding:6px;border:1px solid var(--bd);border-radius:7px;font-size:14px}
.ed .x{color:var(--mut)}
.sv{border:0;background:var(--pri);color:#fff;border-radius:7px;padding:7px 10px;font-weight:700;font-size:12px;cursor:pointer}
.apu{font-size:11px;font-weight:700}
.apu.ok{color:var(--ok)}.apu.no{color:var(--am)}
${NAV_CSS}
</style></head><body>
<div class="app">
 ${sideHtml("resultados")}
 <main class="main">
  <div class="top"><h2>&#127937; Resultados Reais</h2><span id="conn" class="muted">conectando...</span></div>
  <div class="pad">
   <div class="muted" style="margin-bottom:12px">Resultado REAL coletado do 365scores no horario do jogo (<code>jogos.resultado_*</code>, status <b>final</b>). A apuracao compara os palpites com este resultado. Aqui voce confere se o cron trabalhou e pode corrigir na mao.</div>
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
function fmtH(s){if(!s)return "";var d=new Date(s);if(isNaN(d))return esc(String(s).slice(0,16).replace("T"," "));return d.toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});}
function lbl(j){return j.fase==="grupos"?("Fase de grupos &middot; Rodada "+(j.rodada||"?")):("Mata-mata &middot; "+esc(j.fase||""));}
async function carregarStatus(){
 try{var r=await fetch(_b()+"/admin/bolao/status",{headers:H()});if(!r.ok)return;var d=await r.json();
  document.getElementById("b-apur").textContent=d.jogosApurados||0;
  document.getElementById("b-pend").textContent=d.aguardandoApuracao||0;
  var st=d.status||{};document.getElementById("b-ultimo").textContent=esc(st.ultimo||st.em||st.quando||"sem registro");
 }catch(e){}
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
 var html="";var cur="";
 js.forEach(function(j){
  var lb=lbl(j);if(lb!==cur){cur=lb;html+='<div class="sech">'+lb+'</div>';}
  var temReal=(j.real_c!=null&&j.real_v!=null);
  var stPill=temReal?'<span class="pill p-final">FINAL</span>':(j.status==="encerrado"?'<span class="pill p-none">so palpite-base</span>':'<span class="pill p-none">agendado</span>');
  var realTxt=temReal?(j.real_c+' x '+j.real_v):'&mdash;';
  var palTxt=(j.palpite_c!=null)?('palpite-base: '+j.palpite_c+' x '+j.palpite_v):'';
  var apu=temReal?(j.apurado?'<span class="apu ok">apurado &#10003;</span>':'<span class="apu no">aguardando apuracao</span>'):'';
  html+='<div class="jg">'
   +'<div class="tms">'
   +'<div class="tm">'+fl(j.casa_iso)+esc(j.casa_pt)+'</div>'
   +'<div class="tm">'+fl(j.visit_iso)+esc(j.visit_pt)+'</div>'
   +'</div>'
   +'<div class="mid"><div class="hr">'+fmtH(j.inicio)+' &middot; '+stPill+'</div>'
   +'<div class="real">'+realTxt+'</div>'
   +(palTxt?'<div class="pal">'+palTxt+'</div>':'')+'</div>'
   +'<div class="ed"><input id="rc-'+j.id+'" type="number" min="0" value="'+(j.real_c!=null?j.real_c:"")+'"><span class="x">x</span>'
   +'<input id="rv-'+j.id+'" type="number" min="0" value="'+(j.real_v!=null?j.real_v:"")+'">'
   +'<button class="sv" onclick="salvar('+j.id+')">Salvar</button> '+apu+'</div>'
   +'</div>';
 });
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
