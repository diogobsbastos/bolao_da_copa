import { NAV_CSS, sideHtml, NAV_JS } from "./ui.js";

export const PAGINA_JOGOS = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Jogos & Placar - Bolao da Copa 26</title>
<style>
:root{--pri:#4361ee;--bg:#f3f4f8;--card:#fff;--tx:#1f2430;--mut:#7a8194;--bd:#e6e8f0;--ok:#1faa59;--no:#e23744;}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx)}
.app{display:flex;min-height:100vh}.main{flex:1;min-width:0}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 24px;background:var(--card);border-bottom:1px solid var(--bd)}
.top h2{margin:0;font-size:18px}
.pad{padding:18px 24px 60px;max-width:1040px}
.muted{color:var(--mut);font-size:13px}
button{background:var(--pri);color:#fff;border:0;border-radius:9px;padding:9px 14px;font-weight:700;cursor:pointer;font-size:13px}
button.sm{padding:6px 11px;font-size:12px}button.gh{background:#eef1fb;color:var(--pri)}button.gr{background:#14794a}button.rx{background:#6d28d9}button.am{background:#b45309}
button:disabled{opacity:.55;cursor:default}
.tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.tab{padding:9px 16px;border-radius:10px;background:var(--card);border:1px solid var(--bd);cursor:pointer;font-weight:700;font-size:13px;color:var(--mut)}
.acts{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;align-items:center}
.bar{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:10px 12px;margin-bottom:14px}
.bar h4{margin:0 0 7px;font-size:11px;letter-spacing:.5px;text-transform:uppercase;color:var(--mut)}
.nk{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:9px;padding-top:9px;border-top:1px dashed var(--bd)}
.nk input{flex:1;min-width:180px;padding:7px 9px;border:1px solid var(--bd);border-radius:8px;font-size:12px}
.dia{font-size:13px;font-weight:800;color:var(--tx);background:#eef1f6;padding:7px 12px;border-radius:8px;margin:14px 0 8px}
.jgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.jogo{background:var(--card);border:1px solid var(--bd);border-radius:12px;overflow:hidden;display:flex;align-items:stretch}
.gtab{writing-mode:vertical-rl;transform:rotate(180deg);background:#222838;color:#fff;font-weight:800;font-size:10px;letter-spacing:2px;padding:8px 6px;display:flex;align-items:center;justify-content:center;text-align:center;flex:none}
.jbody{flex:1;min-width:0;display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 14px}
.times{flex:1;min-width:190px;display:flex;flex-direction:column;gap:8px}
.lin{display:flex;align-items:center;gap:8px}
.fl{width:26px;height:19px;object-fit:cover;border-radius:3px;background:#e6e8f0;flex:none}
.nm{flex:1;font-size:13.5px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ix{background:#eef1fb;color:var(--pri);border:0;border-radius:6px;padding:3px 6px;font-size:12px;cursor:pointer;font-weight:700;flex:none}
.pl{width:42px;text-align:center;font-size:15px;font-weight:800;padding:5px;border:1px solid var(--bd);border-radius:8px;flex:none}
.meta{display:flex;flex-direction:column;align-items:flex-end;gap:5px;min-width:130px}
.data{font-size:11.5px;color:var(--mut);font-weight:700;text-align:right}
.odds{font-size:11px;color:var(--mut)}
.pal{font-size:11px;color:#6d28d9;font-weight:700;text-align:right}
.tag{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;background:#e4f6ec;color:#14794a}
.tag.ag{background:#eef1fb;color:var(--pri)}
.mov{position:fixed;inset:0;background:rgba(20,24,30,.5);backdrop-filter:blur(3px);display:none;align-items:center;justify-content:center;z-index:100;padding:18px}
.mov.show{display:flex}
.modal{background:var(--card);border-radius:16px;padding:18px;max-width:480px;width:100%;box-shadow:0 24px 70px rgba(0,0,0,.3);max-height:84vh;overflow:auto}
.modal h3{margin:0 0 4px;font-size:16px;display:flex;align-items:center;gap:9px}
.rk{display:inline-block;background:#222838;color:#fff;border-radius:8px;padding:2px 9px;font-weight:800;font-size:12px}
.mr{display:flex;align-items:center;gap:9px;padding:9px 4px;border-bottom:1px solid var(--bd);font-size:13px}
.mr .fl{width:22px;height:16px}
.od{margin-left:auto;font-size:11px;color:var(--mut);text-align:right;white-space:nowrap}
.bdg{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:#fff;flex:none}
.bV{background:#14794a}.bD{background:#c01f2e}.bE{background:#9a6b00}.b-{background:#9aa0ad}
${NAV_CSS}
</style></head><body>
<div class="app">
 ${sideHtml("jogos")}
 <main class="main">
  <div class="top"><h2>&#9917; Jogos &amp; Placar</h2><span id="conn" class="muted">conectando...</span></div>
  <div class="pad">
   <div class="tabs" id="tabs"></div>
   <div class="bar">
    <h4>Ferramentas da rodada</h4>
    <div class="acts">
     <button class="sm gr" onclick="autoOdds('rodada')">&#9889; Odds (rodada)</button>
     <button class="sm gh" onclick="autoOdds('todas')">Odds (todas)</button>
     <button class="sm rx" onclick="gerarPalpites('rodada')">&#128302; Gerar palpites IA (rodada)</button>
     <button class="sm rx" onclick="gerarPalpites('todas')">&#128302; Todas</button>
     <button class="sm am" onclick="autoPalpite('rodada')">&#127922; Preencher placar c/ palpite (rodada)</button>
     <button class="sm am" onclick="autoPalpite('todas')">&#127922; Todas</button>
    </div>
    <div class="muted" id="cnt" style="margin-top:8px"></div>
   </div>
   <div id="lista"><div class="muted" style="padding:14px">carregando jogos...</div></div>
  </div>
 </main>
</div>
<div class="mov" id="mov"><div class="modal"><div id="mbody"></div><div id="mfoot" style="margin-top:12px;text-align:right"></div></div></div>
<div id="toast" style="position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:120;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none"></div>
<script>
${NAV_JS}
var CORES={g1:"#0e9488",g2:"#d97706",g3:"#dc2626",mm:"#4338ca"};
function H(){var h={"content-type":"application/json"};var s=localStorage.getItem("sessao");if(s){h["authorization"]="Bearer "+s;}return h;}
function toast(m,t){var c=document.getElementById("toast");var d=document.createElement("div");d.textContent=m;d.style.cssText="background:"+(t==="err"?"#c01f2e":(t==="ok"?"#14794a":"#1f2430"))+";color:#fff;padding:10px 16px;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.25)";c.appendChild(d);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},4800);}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function fecha(){document.getElementById("mov").classList.remove("show");}
function modal(html,foot){document.getElementById("mbody").innerHTML=html;document.getElementById("mfoot").innerHTML=foot||'<button class="sm gh" onclick="fecha()">Fechar</button>';document.getElementById("mov").classList.add("show");}
function confirmar(titulo,msg){return new Promise(function(res){
 modal('<h3>'+esc(titulo)+'</h3><div class="muted" style="font-size:13px;line-height:1.5">'+msg+'</div>',
  '<button class="sm gh" onclick="fecha();window.__no()">Cancelar</button> <button class="sm am" onclick="fecha();window.__yes()">Confirmar</button>');
 window.__yes=function(){res(true)};window.__no=function(){res(false)};
});}
var JOGOS=[], TABS=[], ATIVA="";
var DIAS=["Dom","Seg","Ter","Qua","Qui","Sex","Sab"];
function chaveTab(j){return j.fase==="grupos"?("g"+j.rodada):"mm";}
function fmtData(iso){if(!iso)return "a definir";var d=new Date(iso);return DIAS[d.getDay()]+" "+("0"+d.getDate()).slice(-2)+"/"+("0"+(d.getMonth()+1)).slice(-2)+" "+("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2);}
function fmtDia(iso){if(!iso)return "Data a definir";var d=new Date(iso);return DIAS[d.getDay()]+", "+("0"+d.getDate()).slice(-2)+"/"+("0"+(d.getMonth()+1)).slice(-2);}
function fmtD(iso){if(!iso)return "";var d=new Date(iso);return ("0"+d.getDate()).slice(-2)+"/"+("0"+(d.getMonth()+1)).slice(-2)+"/"+String(d.getFullYear()).slice(-2);}
function faseCurta(s){var m={"Group Stage":"Grupos","Round of 16":"Oitavas","Quarter-finals":"Quartas","Semi-finals":"Semi","Final":"Final","3rd Place Final":"3o lugar"};return m[s]||s||"";}
function fl(iso){return iso?('<img class="fl" src="https://flagcdn.com/w40/'+iso+'.png" onerror="this.style.opacity=.2">'):'<span class="fl"></span>';}
function escopoBody(escopo){var b={escopo:escopo};if(escopo==="rodada"&&ATIVA.charAt(0)==="g"){b.fase="grupos";b.rodada=+ATIVA.slice(1);}return b;}
async function init(){
 var c=document.getElementById("conn");
 var r=await fetch(_b()+"/admin/jogos-placar/dados",{headers:H()});
 if(!r.ok){c.textContent="faca login no /admin";c.style.color="#e23744";return;}
 c.textContent="conectado";c.style.color="#1faa59";
 JOGOS=(await r.json()).jogos||[];
 var ks=[];JOGOS.forEach(function(j){var k=chaveTab(j);if(ks.indexOf(k)<0)ks.push(k);});
 var ordem=["g1","g2","g3","mm"];TABS=ordem.filter(function(k){return ks.indexOf(k)>=0;});
 ATIVA=TABS[0]||"";
 renderTabs();render();
}
async function recarrega(){var r=await fetch(_b()+"/admin/jogos-placar/dados",{headers:H()});JOGOS=(await r.json()).jogos||[];render();}
function renderTabs(){
 document.getElementById("tabs").innerHTML=TABS.map(function(k){
  var lbl=k==="mm"?"Mata-mata":("Rodada "+k.slice(1));
  var cor=CORES[k]||"#4361ee";
  var st=(k===ATIVA)?(' style="background:'+cor+';border-color:'+cor+';color:#fff"'):(' style="color:'+cor+'"');
  return '<div class="tab"'+st+' onclick="ATIVA=\\''+k+'\\';renderTabs();render()">'+lbl+'</div>';
 }).join("");
}
function card(j){
 var enc=j.status==="encerrado";
 var cor=CORES[chaveTab(j)]||"#222838";
 var gtab=j.grupo?('<div class="gtab" style="background:'+cor+'">GRUPO '+esc(j.grupo)+'</div>'):'';
 var od=j.odds?('1: <b>'+(j.odds.casa||"-")+'</b> X: <b>'+(j.odds.empate||"-")+'</b> 2: <b>'+(j.odds.fora||"-")+'</b>'):'';
 var pal=j.palpite?('&#128302; '+esc(j.palpite.pc)+'x'+esc(j.palpite.pv)+(j.palpite.conf!=null?(' ('+esc(j.palpite.conf)+'%)'):'')):'';
 return '<div class="jogo">'+gtab+'<div class="jbody"><div class="times">'
  +'<div class="lin">'+fl(j.casa.iso)+'<span class="nm">'+esc(j.casa.pt)+'</span><button class="ix" title="Stats" onclick="stats(\\''+esc(j.casa.en)+'\\')">&#128202;</button><button class="ix" title="Noticias" onclick="noticias(\\''+esc(j.casa.en)+'\\')">&#128240;</button><input class="pl" id="pc-'+j.id+'" type="number" min="0" max="99" value="'+(j.placar_casa==null?"":j.placar_casa)+'" onchange="salvar('+j.id+')"></div>'
  +'<div class="lin">'+fl(j.visitante.iso)+'<span class="nm">'+esc(j.visitante.pt)+'</span><button class="ix" title="Stats" onclick="stats(\\''+esc(j.visitante.en)+'\\')">&#128202;</button><button class="ix" title="Noticias" onclick="noticias(\\''+esc(j.casa.en)+'\\')">&#128240;</button><button class="ix" title="Noticias" onclick="noticias(\\''+esc(j.casa.en)+'\\')">&#128240;</button><input class="pl" id="pc-'+j.id+'" type="number" min="0" max="99" value="'+(j.placar_casa==null?"":j.placar_casa)+'" onchange="salvar('+j.id+')"></div>'
  +'<div class="lin">'+fl(j.visitante.iso)+'<span class="nm">'+esc(j.visitante.pt)+'</span><button class="ix" title="Noticias" onclick="noticias(\\''+esc(j.visitante.en)+'\\')">&#128240;</button><input class="pl" id="pv-'+j.id+'" type="number" min="0" max="99" value="'+(j.placar_visitante==null?"":j.placar_visitante)+'" onchange="salvar('+j.id+')"></div>'
  +'</div><div class="meta">'
  +'<span class="data">'+esc(fmtData(j.inicio))+'</span>'
  +(od?'<span class="odds">'+od+'</span>':'')
  +(pal?'<span class="pal">'+pal+'</span>':'')
  +'<span>'+(enc?'<span class="tag">encerrado</span>':'<span class="tag ag">agendado</span>')+'</span>'
  +'</div></div></div>';
}
function render(){
 var js=JOGOS.filter(function(j){return chaveTab(j)===ATIVA;});
 document.getElementById("cnt").textContent=js.length+" jogos nesta aba";
 var L=document.getElementById("lista");
 if(!js.length){L.innerHTML='<div class="muted" style="padding:14px">sem jogos.</div>';return;}
 var html="",dia="",aberto=false;
 js.forEach(function(j){
  var d=fmtDia(j.inicio);
  if(d!==dia){if(aberto)html+='</div>';dia=d;html+='<div class="dia">Fase de grupos &middot; '+esc(d)+'</div><div class="jgrid">';aberto=true;}
  html+=card(j);
 });
 if(aberto)html+='</div>';
 L.innerHTML=html;
}
async function salvar(id){
 var pc=document.getElementById("pc-"+id).value, pv=document.getElementById("pv-"+id).value;
 var r=await fetch(_b()+"/admin/jogos-placar/placar",{method:"POST",headers:H(),body:JSON.stringify({id:id,placar_casa:pc,placar_visitante:pv})});
 var d=await r.json().catch(function(){return{};});
 if(d&&d.ok){toast("Placar salvo","ok");var j=JOGOS.find(function(x){return x.id===id;});if(j){j.placar_casa=pc===""?null:+pc;j.placar_visitante=pv===""?null:+pv;j.status=d.status;}}
 else{toast("erro ao salvar","err");}
}
async function salvarNewsKey(){
 var v=(document.getElementById("newskey").value||"").trim();
 if(!v){toast("Cole a chave primeiro","err");return;}
 var r=await fetch(_b()+"/admin/config",{method:"POST",headers:H(),body:JSON.stringify({newsdata_api_key:v})});
 if(r.ok){toast("Chave NewsData salva. Gere os palpites de novo p/ usar as noticias.","ok");document.getElementById("newskey").value="";}
 else{toast("Erro ao salvar a chave","err");}
}
async function noticias(en){
 modal('<div class="muted">buscando noticias...</div>');
 var r=await fetch(_b()+"/admin/jogos-placar/noticias?en="+encodeURIComponent(en),{headers:H()});
 var d=await r.json().catch(function(){return{};});
 if(!d||!d.ok){modal('<h3>Noticias</h3><div class="muted">erro ao buscar</div>');return;}
 var t=d.time,body;
 if(d.semChave){body='<div class="muted">Configure a chave da NewsData.io em <b>Configuracoes &rsaquo; APIs</b> para ver as noticias.</div>';}
 else if(!d.noticias||!d.noticias.length){body='<div class="muted">sem noticias recentes para este time.</div>';}
 else{body=d.noticias.map(function(n){return '<div class="mr"><span>&#128240;</span><span>'+esc(n)+'</span></div>';}).join("");}
 modal('<h3>'+fl(t.iso)+' '+esc(t.pt)+' &mdash; ultimas noticias</h3>'+body);
}
async function stats(en){
 modal('<div class="muted">carregando '+esc(en)+'...</div>');
 var r=await fetch(_b()+"/admin/jogos-placar/stats?en="+encodeURIComponent(en),{headers:H()});
 var d=await r.json().catch(function(){return{};});
 if(!d||!d.ok){modal('<h3>Stats</h3><div class="muted">Erro: '+esc((d&&d.erro)||"")+'</div>');return;}
 var t=d.time;
 var rk=d.ranking?('<span class="rk">Ranking FIFA #'+d.ranking+'</span>'):'<span class="muted">ranking n/d</span>';
 var u=d.ultimaCopa||[];
 var linhas=u.length?u.map(function(g){
  return '<div class="mr"><span class="bdg b'+g.res+'">'+g.res+'</span><b>'+esc(g.placar)+'</b>'+fl(g.adversario.iso)+'<span>'+esc(g.adversario.pt)+'</span><span class="od">'+esc(faseCurta(g.fase))+' &middot; '+esc(fmtD(g.data))+'</span></div>';
 }).join(""):'<div class="muted">'+(d.temFonte2022?"nao disputou a Copa 2022.":"fonte 2022 indisponivel.")+'</div>';
 modal('<h3>'+fl(t.iso)+' '+esc(t.pt)+'</h3><div style="margin:2px 0 12px">'+rk+'</div><div class="muted" style="font-size:12px;margin-bottom:6px">Desempenho na ultima Copa (2022):</div>'+linhas);
}
async function autoOdds(escopo){
 var r=await fetch(_b()+"/admin/jogos-placar/auto",{method:"POST",headers:H(),body:JSON.stringify(escopoBody(escopo))});
 var d=await r.json().catch(function(){return{};});
 if(d&&d.ok){toast(d.atualizados?("Odds: "+d.atualizados+" jogos"):"Mercado da Copa ainda sem odds (abre mais perto)","ok");recarrega();}
 else{toast("Falhou: "+((d&&d.erro)||"erro"),"err");}
}
async function gerarPalpites(escopo){
 toast("Gerando palpites... pode levar alguns segundos");
 var body=escopoBody(escopo);body.refazer=true;
 var r=await fetch(_b()+"/admin/jogos-placar/gerar-palpites",{method:"POST",headers:H(),body:JSON.stringify(body)});
 var d=await r.json().catch(function(){return{};});
 if(d&&d.ok){toast("Palpites: "+d.gerados+" ("+d.viaIA+" via IA, "+d.viaRanking+" ranking"+(d.comNoticia?(", "+d.comNoticia+" c/ noticia"):"")+")","ok");recarrega();}
 else{toast("Falhou: "+((d&&d.erro)||"erro"),"err");}
}
async function autoPalpite(escopo){
 var ok=await confirmar("Preencher placar com o palpite?","Isto vai gravar no placar dos jogos "+(escopo==="rodada"?"desta rodada":"de TODAS as rodadas")+" o palpite da casa (com um randomico leve) e marcar como <b>encerrado</b>. Voce pode editar qualquer placar depois. Continuar?");
 if(!ok)return;
 var r=await fetch(_b()+"/admin/jogos-placar/auto-palpite",{method:"POST",headers:H(),body:JSON.stringify(escopoBody(escopo))});
 var d=await r.json().catch(function(){return{};});
 if(d&&d.ok){toast(d.preenchidos?("Placar preenchido: "+d.preenchidos+" jogos"):"Nenhum palpite gerado ainda — clique em Gerar palpites IA antes","ok");recarrega();}
 else{toast("Falhou: "+((d&&d.erro)||"erro"),"err");}
}
init();
</script></body></html>`;
