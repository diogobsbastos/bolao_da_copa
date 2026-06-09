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
.jbody{flex:1;min-width:0;display:grid;grid-template-columns:1.4fr auto 0.9fr;align-items:center;column-gap:8px;row-gap:9px;padding:10px 12px}
.cn{display:flex;align-items:center;gap:8px;min-width:0;overflow:hidden}
.cs{display:flex;align-items:center;gap:7px;justify-self:center}
.cm{justify-self:end;display:flex;align-items:center}
.cmtop{gap:12px}
.cmbot{gap:5px}
.ccol{flex:1;min-width:0;display:flex;flex-direction:column}
.chead{display:flex;align-items:center;justify-content:flex-end;gap:7px;padding:7px 12px 0;font-size:11px;color:var(--mut)}
.rows{padding:3px 12px 12px;display:flex;flex-direction:column;gap:9px}
.oddbtn{cursor:pointer;transition:.15s}.oddbtn:hover{transform:scale(1.12)}
.times{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;justify-content:center}
.lin{display:flex;align-items:center;gap:8px}
.nmw{display:flex;align-items:center;gap:8px;min-width:0;overflow:hidden}
.fl{width:26px;height:19px;object-fit:cover;border-radius:3px;background:#e6e8f0;flex:none}
.nm{flex:1;font-size:13.5px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.scw{display:flex;align-items:center;gap:7px;flex:none}
.sp{flex:1}
.ix{background:#eef1fb;color:var(--pri);border:0;border-radius:6px;padding:3px 6px;font-size:12px;cursor:pointer;font-weight:700;flex:none}
.pl{width:46px;text-align:center;font-size:16px;font-weight:800;padding:6px 5px;border:1px solid var(--bd);border-radius:8px;flex:none}
.pl::-webkit-inner-spin-button,.pl::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
.pl{-moz-appearance:textfield}
.step{display:flex;flex-direction:column;gap:2px;flex:none}
.su{background:#eef1fb;color:#9aa3b6;border:0;border-radius:4px;width:16px;height:13px;font-size:7px;line-height:1;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center}.su:hover,.su:active,.su:focus{background:var(--rc,var(--pri));color:#fff}
.ib{background:transparent;border:0;cursor:pointer;font-size:16px;padding:0 2px;line-height:1;flex:none;opacity:.85}.ib:hover{opacity:1}
.od1{font-size:13px;font-weight:800;color:var(--tx);min-width:30px;text-align:right;flex:none}
.foot{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--mut);margin-top:8px;padding-top:7px;border-top:1px dashed var(--bd);flex-wrap:wrap}.foot b{color:var(--tx);font-weight:800}.hora{font-size:9.5px;font-weight:700;color:var(--mut)}.thead{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--mut);margin-bottom:3px}.oem b{color:var(--tx)}
.oddh{font-size:8px;font-weight:800;letter-spacing:.5px;color:var(--mut);text-align:right;text-transform:uppercase;line-height:1;margin-bottom:1px}
.meta{display:flex;flex-direction:column;justify-content:space-between;align-items:flex-end;min-width:124px;gap:6px}
.mtop{display:flex;align-items:center;gap:6px}
.mtop{display:flex;align-items:center;justify-content:space-between;width:100%;gap:12px}
.mbot{display:flex;align-items:center;gap:6px}
.fav{display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:13px;color:var(--tx)}
.fav i{font-style:normal;font-size:9px;font-weight:800;color:var(--mut)}
.fav b{font-size:16px}
.fav .fl{width:22px;height:16px}
.o365sm{height:19px;width:auto;border-radius:3px;cursor:pointer;transition:.15s}
.o365sm:hover{transform:scale(1.12)}
.live365{position:relative;display:inline-flex;border-radius:50%}
.live365::after{content:"";position:absolute;inset:0;border-radius:50%;pointer-events:none;animation:radar365 1.9s ease-out infinite}
@keyframes radar365{0%{box-shadow:0 0 0 0 rgba(20,170,89,.55)}70%{box-shadow:0 0 0 7px rgba(20,170,89,0)}100%{box-shadow:0 0 0 0 rgba(20,170,89,0)}}
.data{font-size:11.5px;color:var(--mut);font-weight:700;text-align:right}
.odds{display:flex;flex-direction:column;justify-content:space-between;gap:2px;min-width:66px;align-self:stretch;padding:2px 0}.odds>span{display:flex;justify-content:space-between;gap:8px;font-size:10.5px;line-height:1.35;color:var(--mut)}.odds i{font-style:normal;font-weight:700}.odds b{color:var(--tx);font-weight:800}.tagrow{display:flex;align-items:center;gap:5px}.o365big{height:17px;width:auto;border-radius:3px;opacity:.95}
.pal{font-size:11px;color:#6d28d9;font-weight:700;text-align:right}
.tag{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;background:#e4f6ec;color:#14794a}
.tag.ag{background:#eef1fb;color:var(--pri)}
.mov{position:fixed;inset:0;background:rgba(20,24,30,.5);backdrop-filter:blur(3px);display:none;align-items:center;justify-content:center;z-index:100;padding:18px}
.mov.show{display:flex}
.modal{background:var(--card);border-radius:16px;padding:18px;max-width:480px;width:100%;box-shadow:0 24px 70px rgba(0,0,0,.3);max-height:84vh;overflow:auto}
.modal h3{margin:0 0 4px;font-size:16px;display:flex;align-items:center;gap:9px}
.cols{display:flex;gap:16px;align-items:flex-start}
.col{flex:1;min-width:0}
@media(max-width:680px){.cols{flex-direction:column}}
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
.s365link{display:flex;align-items:center;justify-content:center;margin-top:14px;padding:9px 10px;background:#f3f4f8;border-radius:10px;color:var(--pri);font-weight:700;font-size:12px;text-decoration:none}
.s365link:hover{background:#eef1fb}
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
function modal(html,foot){document.getElementById("mbody").innerHTML=html;document.getElementById("mfoot").innerHTML=foot||"";var _m=document.querySelector(".modal");if(_m){_m.style.setProperty("--sb",CORES[ATIVA]||"#cbd2e0");_m.style.maxWidth="";}document.getElementById("mov").classList.add("show");}
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
function fmtHora(iso){if(!iso)return "";var d=new Date(iso);return ("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2);}
function card(j){
 var enc=j.status==="encerrado";
 var cor=CORES[chaveTab(j)]||"#222838";
 var gtab=j.grupo?('<div class="gtab" style="background:'+cor+'">GRUPO '+esc(j.grupo)+'</div>'):'';
 function cn(tm){return '<div class="cn">'+fl(tm.iso)+'<span class="nm">'+esc(tm.pt)+'</span></div>';}
 function cs(casa,val){var fld=casa?"pc":"pv";var en=casa?j.casa.en:j.visitante.en;return '<div class="cs"><button class="ix" title="Stats e noticias" onclick="info(\\''+esc(en)+'\\')">&#128202;</button><input class="pl" id="'+fld+'-'+j.id+'" type="number" min="0" max="99" value="'+(val==null?"":val)+'" onchange="salvar('+j.id+')"><span class="step"><button class="su" onclick="stp('+j.id+','+(casa?1:0)+',1)">&#9650;</button><button class="su" onclick="stp('+j.id+','+(casa?1:0)+',-1)">&#9660;</button></span></div>';}
 var logo=(j.odds&&/365/.test(j.odds.fonte||""))?('<span class="live365"><img class="o365sm oddbtn" src="'+S365LOGO+'" title="odds ao vivo — mercado 365scores" onclick="odds('+j.id+')"></span>'):'';
 var fav="";
 if(j.odds){var c=parseFloat(j.odds.casa),x=parseFloat(j.odds.empate),f=parseFloat(j.odds.fora);var ar=[["c",c],["e",x],["f",f]].filter(function(a){return !isNaN(a[1]);});if(ar.length){ar.sort(function(a,b){return a[1]-b[1];});var bb=ar[0][0];
  if(bb==="c")fav='<span class="fav" onclick="odds('+j.id+')" title="favorito"><i>FAV</i>'+fl(j.casa.iso)+'<b>'+esc(j.odds.casa)+'</b></span>';
  else if(bb==="f")fav='<span class="fav" onclick="odds('+j.id+')" title="favorito"><i>FAV</i>'+fl(j.visitante.iso)+'<b>'+esc(j.odds.fora)+'</b></span>';
  else fav='<span class="fav" onclick="odds('+j.id+')" title="tendencia"><i>EMP</i><b>'+esc(j.odds.empate)+'</b></span>';}}
 var tag=enc?'<span class="tag">encerrado</span>':'<span class="tag ag">&#128336; '+esc(fmtHora(j.inicio))+'</span>';
 var jb='<div class="jbody">'+cn(j.casa)+cs(1,j.placar_casa)+'<div class="cm cmtop">'+tag+logo+'</div>'+cn(j.visitante)+cs(0,j.placar_visitante)+'<div class="cm cmbot">'+fav+'</div></div>';
 return '<div class="jogo" style="--rc:'+cor+'">'+gtab+jb+'</div>';
}

function odds(id){
 var j=JOGOS.find(function(x){return String(x.id)===String(id);}); if(!j||!j.odds){toast("sem odds para este jogo","err");return;}
 var o=j.odds;
 function ro(lbl,v){return '<div class="mr"><span style="flex:1">'+lbl+'</span><b style="font-size:16px">'+esc(v||"-")+'</b></div>';}
 modal('<h3>'+fl(j.casa.iso)+' '+esc(j.casa.pt)+' &times; '+esc(j.visitante.pt)+' '+fl(j.visitante.iso)+'</h3><div class="muted" style="font-size:12px;margin-bottom:8px">Odds 1X2 &middot; '+esc(o.fonte||"")+'</div>'+ro(fl(j.casa.iso)+' '+esc(j.casa.pt)+' (vitória)',o.casa)+ro('Empate',o.empate)+ro(fl(j.visitante.iso)+' '+esc(j.visitante.pt)+' (vitória)',o.fora)+(o.gid?('<a class="s365link" href="https://www.365scores.com/pt-br/football/match/g-'+esc(o.gid)+'#id='+esc(o.gid)+'" target="_blank"><img src="'+S365LOGO+'" style="height:18px;margin-right:7px;vertical-align:middle">Ver todas as estatísticas no 365scores &#8599;</a>'):''));
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
function stp(id,casa,d){var e=document.getElementById((casa?"pc-":"pv-")+id);if(!e)return;var v=(parseInt(e.value)||0)+d;if(v<0)v=0;if(v>99)v=99;e.value=v;salvar(id);}
async function salvar(id){
 var pc=document.getElementById("pc-"+id).value, pv=document.getElementById("pv-"+id).value;
 var r=await fetch(_b()+"/admin/jogos-placar/placar",{method:"POST",headers:H(),body:JSON.stringify({id:id,placar_casa:pc,placar_visitante:pv})});
 var d=await r.json().catch(function(){return{};});
 if(d&&d.ok){toast("Placar salvo","ok");var j=JOGOS.find(function(x){return String(x.id)===String(id);});if(j){j.placar_casa=pc===""?null:+pc;j.placar_visitante=pv===""?null:+pv;j.status=d.status;}}
 else{toast("erro ao salvar","err");}
}
async function salvarNewsKey(){
 var v=(document.getElementById("newskey").value||"").trim();
 if(!v){toast("Cole a chave primeiro","err");return;}
 var r=await fetch(_b()+"/admin/config",{method:"POST",headers:H(),body:JSON.stringify({newsdata_api_key:v})});
 if(r.ok){toast("Chave NewsData salva. Gere os palpites de novo p/ usar as noticias.","ok");document.getElementById("newskey").value="";}
 else{toast("Erro ao salvar a chave","err");}
}
function noticiasBody(d){
 var html='<div style="font-size:12px;font-weight:800;color:var(--mut);margin-bottom:6px">&#128240; NOTÍCIAS</div>';
 if(!d||!d.ok){return html+'<div class="muted">noticias indisponivel</div>';}
 if(d.semChave){return html+'<div class="muted">noticias nao configuradas.</div>';}
 if(!d.noticias||!d.noticias.length){return html+'<div class="muted">sem noticias recentes para este time.'+(d.debug?(' <br><small>API: '+esc(d.debug.status)+', total '+esc(d.debug.total)+(d.debug.msg?(' &middot; '+esc(d.debug.msg)):'')+'</small>'):'')+'</div>';}
 return html+d.noticias.map(function(n){var lk=n.link?('<a class="lkbtn" href="'+esc(n.link)+'" target="_blank">abrir &#8599;</a>'):'';var meta=[];if(n.data)meta.push(fmtData(n.data));if(n.fonte)meta.push('fonte: '+esc(n.fonte));var src=meta.length?('<div class="muted" style="font-size:11px;margin-top:2px">'+meta.join(' &middot; ')+'</div>'):'';return '<div class="mr" style="align-items:flex-start"><span>&#128240;</span><div style="flex:1;min-width:0"><div>'+esc(n.title)+'</div>'+src+'</div>'+lk+'</div>';}).join("");
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
function statsBody(d){
 if(!d||!d.ok){return '<div class="muted">dados indisponivel</div>';}
 var rk=d.ranking?('<span class="rk">Ranking FIFA #'+d.ranking+'</span>'):'';
 var html='<div style="font-size:12px;font-weight:800;color:var(--mut);margin-bottom:6px">&#128202; DADOS</div><div style="margin-bottom:8px">'+rk+'</div>';
 if(d.grupo){html+='<div class="mr"><b>Grupo '+esc(String(d.grupo.nome).replace("Grupo ",""))+'</b><span class="od">'+d.grupo.pos+'º &middot; '+d.grupo.pts+'pts ('+d.grupo.v+'V '+d.grupo.e+'E '+d.grupo.d+'D)</span></div>';}
 function jline(lbl,j){if(!j)return '';var dd=j.data?fmtData(j.data):'';var pl=j.placar?(' <b>'+esc(j.placar)+'</b>'):'';return '<div class="mr"><span class="muted" style="width:52px;flex:none">'+lbl+'</span>'+fl(j.adversario.iso)+'<span style="flex:1;min-width:0">'+(j.casa?'vs ':'@ ')+esc(j.adversario.pt)+'</span>'+pl+'</div>';}
 html+=jline('Próximo',d.proximo)+jline('Último',d.ultimo);
 var u=d.ultimaCopa||[];
 if(u.length){html+='<div class="muted" style="font-size:12px;margin:10px 0 4px">Copa 2022:</div>'+u.map(function(g){return '<div class="mr"><span class="bdg b'+g.res+'">'+g.res+'</span><b>'+esc(g.placar)+'</b>'+fl(g.adversario.iso)+'<span>'+esc(g.adversario.pt)+'</span><span class="od">'+esc(faseCurta(g.fase))+'</span></div>';}).join("");}
 else{html+='<div class="muted" style="font-size:12px;margin:10px 0 4px">Copa 2022:</div><div class="mr"><span class="muted" style="line-height:1.4">Não disputou a Copa de 2022.'+(d.regiao?(' Chega via <b>'+esc(d.regiao)+'</b>.'):'')+'</span></div>';}
 var el=d.elenco||[];
 if(el.length){html+='<div style="display:flex;align-items:center;gap:8px;margin:12px 0 4px"><span class="muted" style="font-size:12px;flex:1">Elenco ('+el.length+')</span><button class="ix" style="padding:5px 9px" onclick="escalacao()">🔮 Escalação</button></div><div id="esc-box"></div>'+el.map(linhaJog).join("");}
 return html;
}
async function info(en){
 CUR_EN=en;
 modal('<div class="muted">carregando '+esc(en)+'...</div>');
 var sd=null,nd=null;
 try{var sr=await fetch(_b()+"/admin/jogos-placar/stats?en="+encodeURIComponent(en),{headers:H()});sd=await sr.json();}catch(e){}
 try{var nr=await fetch(_b()+"/admin/jogos-placar/noticias?en="+encodeURIComponent(en),{headers:H()});nd=await nr.json();}catch(e){}
 var t=(sd&&sd.time)||(nd&&nd.time)||{pt:en,iso:""};
 modal('<h3>'+fl(t.iso)+' '+esc(t.pt)+'</h3><div class="cols"><div class="col">'+statsBody(sd)+'</div><div class="col">'+noticiasBody(nd)+'</div></div>');
 var m=document.querySelector(".modal");if(m)m.style.maxWidth="780px";
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
