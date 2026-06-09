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
.odds{display:flex;flex-direction:column;gap:1px;align-items:stretch;min-width:54px;margin:2px 0}.odds .o365{height:12px;width:auto;align-self:flex-end;margin-bottom:2px;border-radius:2px}.odds>span{display:flex;justify-content:space-between;gap:8px;font-size:10.5px;line-height:1.3;color:var(--mut)}.odds i{font-style:normal;font-weight:700}.odds b{color:var(--tx);font-weight:800}
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
.modal{scrollbar-width:thin;scrollbar-color:var(--sb,#cbd2e0) transparent}
.modal::-webkit-scrollbar{width:8px}
.modal::-webkit-scrollbar-track{background:transparent;margin:8px 0}
.modal::-webkit-scrollbar-thumb{background:var(--sb,#cbd2e0);border-radius:8px;border:2px solid var(--card)}
.modal::-webkit-scrollbar-thumb:hover{background:#9aa3b6}
.modal{position:relative}
.mx{position:absolute;top:9px;right:11px;background:transparent;color:var(--mut);border:0;font-size:24px;line-height:1;cursor:pointer;padding:0 6px;font-weight:700}
.mx:hover{color:var(--tx)}
.pf{width:26px;height:34px;object-fit:cover;border-radius:4px;background:#e6e8f0;flex:none}
.pf.nopf{display:inline-flex;align-items:center;justify-content:center;font-size:15px;color:#9aa3b6}
.lkbtn{display:inline-block;background:#eef1fb;color:var(--pri);font-weight:700;font-size:11px;padding:4px 11px;border-radius:999px;text-decoration:none;white-space:nowrap;margin-left:8px;transition:.15s}
.lkbtn:hover{background:var(--pri);color:#fff}
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
     <button class="sm gr" onclick="oddsS365()">&#127919; Odds 365scores</button>
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
<div class="mov" id="mov" onclick="if(event.target===this)fecha()"><div class="modal"><button class="mx" onclick="fecha()" title="Fechar">&times;</button><div id="mbody"></div><div id="mfoot" style="margin-top:12px;text-align:right"></div></div></div>
<div id="toast" style="position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:120;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none"></div>
<script>
${NAV_JS}
var CORES={g1:"#0e9488",g2:"#d97706",g3:"#dc2626",mm:"#4338ca"};
var S365LOGO="data:image/png;base64,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";
function H(){var h={"content-type":"application/json"};var s=localStorage.getItem("sessao");if(s){h["authorization"]="Bearer "+s;}return h;}
function toast(m,t){var c=document.getElementById("toast");var d=document.createElement("div");d.textContent=m;d.style.cssText="background:"+(t==="err"?"#c01f2e":(t==="ok"?"#14794a":"#1f2430"))+";color:#fff;padding:10px 16px;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.25)";c.appendChild(d);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},4800);}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function fecha(){document.getElementById("mov").classList.remove("show");}
function modal(html,foot){document.getElementById("mbody").innerHTML=html;document.getElementById("mfoot").innerHTML=foot||'<button class="sm gh" onclick="fecha()">Fechar</button>';var _m=document.querySelector(".modal");if(_m)_m.style.setProperty("--sb",CORES[ATIVA]||"#cbd2e0");document.getElementById("mov").classList.add("show");}
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
 var src365=(j.odds&&/365/.test(j.odds.fonte||""))?('<img class="o365" src="'+S365LOGO+'" title="'+esc(j.odds.fonte)+'">'):'';var od=j.odds?('<div class="odds">'+src365+'<span><i>1</i><b>'+(j.odds.casa||"-")+'</b></span><span><i>X</i><b>'+(j.odds.empate||"-")+'</b></span><span><i>2</i><b>'+(j.odds.fora||"-")+'</b></span></div>'):'';
 var pal=j.palpite?('&#128302; '+esc(j.palpite.pc)+'x'+esc(j.palpite.pv)+(j.palpite.conf!=null?(' ('+esc(j.palpite.conf)+'%)'):'')):'';
 return '<div class="jogo">'+gtab+'<div class="jbody"><div class="times">'
  +'<div class="lin">'+fl(j.casa.iso)+'<span class="nm">'+esc(j.casa.pt)+'</span><button class="ix" title="Stats" onclick="stats(\\''+esc(j.casa.en)+'\\')">&#128202;</button><button class="ix" title="Noticias" onclick="noticias(\\''+esc(j.casa.en)+'\\')">&#128240;</button><input class="pl" id="pc-'+j.id+'" type="number" min="0" max="99" value="'+(j.placar_casa==null?"":j.placar_casa)+'" onchange="salvar('+j.id+')"></div>'
  +'<div class="lin">'+fl(j.visitante.iso)+'<span class="nm">'+esc(j.visitante.pt)+'</span><button class="ix" title="Stats" onclick="stats(\\''+esc(j.visitante.en)+'\\')">&#128202;</button><button class="ix" title="Noticias" onclick="noticias(\\''+esc(j.visitante.en)+'\\')">&#128240;</button><input class="pl" id="pv-'+j.id+'" type="number" min="0" max="99" value="'+(j.placar_visitante==null?"":j.placar_visitante)+'" onchange="salvar('+j.id+')"></div>'
  +'</div><div class="meta">'
  +'<span class="data">'+esc(fmtData(j.inicio))+'</span>'
  +(od||"")
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
 else if(!d.noticias||!d.noticias.length){body='<div class="muted">sem noticias recentes para este time.'+(d.debug?(' <br><small>API: '+esc(d.debug.status)+', total '+esc(d.debug.total)+(d.debug.msg?(' &middot; '+esc(d.debug.msg)):'')+'</small>'):'')+'</div>';}
 else{body=d.noticias.map(function(n){var lk=n.link?('<a class="lkbtn" href="'+esc(n.link)+'" target="_blank">abrir &#8599;</a>'):'';var meta=[];if(n.data)meta.push(fmtData(n.data));if(n.fonte)meta.push('fonte: '+esc(n.fonte));var src=meta.length?('<div class="muted" style="font-size:11px;margin-top:2px">'+meta.join(' &middot; ')+'</div>'):'';return '<div class="mr" style="align-items:flex-start"><span>&#128240;</span><div style="flex:1;min-width:0"><div>'+esc(n.title)+'</div>'+src+'</div>'+lk+'</div>';}).join("");}
 modal('<h3>'+fl(t.iso)+' '+esc(t.pt)+' &mdash; ultimas noticias</h3>'+body);
}
var CUR_EN="";
async function escalacao(){
 var box=document.getElementById("esc-box"); if(!box)return;
 box.innerHTML='<div class="muted" style="font-size:12px;padding:6px 0">montando escalação provável (IA)...</div>';
 var r=await fetch(_b()+"/admin/jogos-placar/escalacao?en="+encodeURIComponent(CUR_EN),{headers:H()});
 var d=await r.json().catch(function(){return{};});
 if(!d||!d.ok){box.innerHTML='<div class="muted">'+esc((d&&d.erro)||"erro")+'</div>';return;}
 if(!d.titulares||!d.titulares.length){box.innerHTML='<div class="muted">sem elenco pra montar.</div>';return;}
 var h='<div class="mr" style="background:#f1effb;border-radius:8px;margin-top:4px"><b>Escalação provável</b><span class="od">'+esc(d.formacao||"")+(d.fonte==="ia"?" · IA":(d.fonte==="elenco"?" · por posição":""))+'</span></div>';
 h+=d.titulares.map(linhaJog).join("");
 box.innerHTML=h;
}
async function stats(en){
 CUR_EN=en;
 modal('<div class="muted">carregando '+esc(en)+'...</div>');
 var r=await fetch(_b()+"/admin/jogos-placar/stats?en="+encodeURIComponent(en),{headers:H()});
 var d=await r.json().catch(function(){return{};});
 if(!d||!d.ok){modal('<h3>Info</h3><div class="muted">Erro: '+esc((d&&d.erro)||"")+'</div>');return;}
 var t=d.time;
 var rk=d.ranking?('<span class="rk">Ranking FIFA #'+d.ranking+'</span>'):'';
 var html='<h3>'+fl(t.iso)+' '+esc(t.pt)+'</h3><div style="margin:2px 0 10px">'+rk+'</div>';
 if(d.grupo){html+='<div class="mr"><b>Grupo '+esc(String(d.grupo.nome).replace("Grupo ",""))+'</b><span class="od">'+d.grupo.pos+'º lugar &middot; '+d.grupo.pts+' pts ('+d.grupo.v+'V '+d.grupo.e+'E '+d.grupo.d+'D)</span></div>';}
 function jline(lbl,j){if(!j)return '';var dd=j.data?fmtData(j.data):'';var pl=j.placar?(' <b>'+esc(j.placar)+'</b>'):'';return '<div class="mr"><span class="muted" style="width:56px;flex:none">'+lbl+'</span>'+fl(j.adversario.iso)+'<span>'+(j.casa?'vs ':'@ ')+esc(j.adversario.pt)+'</span>'+pl+'<span class="od">'+esc(dd)+'</span></div>';}
 html+=jline('Próximo',d.proximo)+jline('Último',d.ultimo);
 var u=d.ultimaCopa||[];
 if(u.length){html+='<div class="muted" style="font-size:12px;margin:10px 0 4px">Copa 2022:</div>'+u.map(function(g){return '<div class="mr"><span class="bdg b'+g.res+'">'+g.res+'</span><b>'+esc(g.placar)+'</b>'+fl(g.adversario.iso)+'<span>'+esc(g.adversario.pt)+'</span><span class="od">'+esc(faseCurta(g.fase))+'</span></div>';}).join("");}
 else{html+='<div class="muted" style="font-size:12px;margin:10px 0 4px">Copa 2022:</div><div class="mr"><span class="muted" style="line-height:1.4">Não disputou a Copa de 2022.'+(d.regiao?(' Chega à Copa 2026 via <b>'+esc(d.regiao)+'</b>.'):'')+'</span></div>';}
 
var el=d.elenco||[];
 if(el.length){html+='<div style="display:flex;align-items:center;gap:8px;margin:12px 0 4px"><span class="muted" style="font-size:12px;flex:1">Elenco ('+el.length+')</span><button class="ix" style="padding:5px 9px" onclick="escalacao()">🔮 Escalação provável</button></div><div id="esc-box"></div>'+el.map(linhaJog).join("");}
 modal(html);
}
function imgFail(el){el.outerHTML='<span class="pf nopf">&#128100;</span>';}
function linhaJog(p){var av=p.figurinha?('<img class="pf" src="'+_b()+"/fig/"+p.figurinha+'" onerror="imgFail(this)">'):'<span class="pf nopf">&#128100;</span>';return '<div class="mr" style="padding:4px">'+av+'<span style="flex:1;min-width:0">'+esc(p.nome)+'</span><span class="od">'+esc(p.posicao||"")+(p.clube?(' &middot; '+esc(p.clube)):'')+'</span></div>';}
async function autoOdds(escopo){
 var r=await fetch(_b()+"/admin/jogos-placar/auto",{method:"POST",headers:H(),body:JSON.stringify(escopoBody(escopo))});
 var d=await r.json().catch(function(){return{};});
 if(d&&d.ok){toast(d.atualizados?("Odds: "+d.atualizados+" jogos"):"Mercado da Copa ainda sem odds (abre mais perto)","ok");recarrega();}
 else{toast("Falhou: "+((d&&d.erro)||"erro"),"err");}
}
async function oddsS365(){
 toast("Buscando odds de mercado (365scores)... ~15s");
 var r=await fetch(_b()+"/admin/scores365/odds",{method:"POST",headers:H()});
 var d=await r.json().catch(function(){return{};});
 if(d&&d.comOdds!=null){toast("Odds 365scores: "+d.comOdds+" jogos","ok");recarrega();}
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
