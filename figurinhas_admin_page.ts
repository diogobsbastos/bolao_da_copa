// pagina de /admin/figurinhas (separada da logica)
export const PAGINA = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Figurinhas - Elencos</title>
<style>
:root{--pri:#4361ee;--bg:#f3f4f8;--card:#fff;--tx:#1f2430;--mut:#7a8194;--bd:#e6e8f0;--ok:#1faa59;--no:#e23744;}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx)}
.top{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 22px;background:var(--card);border-bottom:1px solid var(--bd);position:sticky;top:0;z-index:9}
.top h2{margin:0;font-size:17px}
.btnv{padding:8px 14px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;border:1px solid transparent;background:var(--pri);color:#fff}
.btnv.ghost{background:#eef1fb;color:var(--pri);border-color:#dbe2fb}
.btnv.auto{background:#fff3d6;color:#9a6b00;border-color:#f0d97a}
.btnv.pdf{background:#e7f0ff;color:#1e50a2;border-color:#bcd3ff}
.btnv.big{background:#14794a;color:#fff;border-color:#14794a;padding:10px 18px;font-size:14px}
.btnv.rb{background:#fff;color:#41495c;border-color:var(--bd)}
.btnv.rb:hover{background:#f3f5f9}
.btnv:disabled{opacity:.55;cursor:default}
input{background:#fff;border:1px solid var(--bd);color:var(--tx);border-radius:9px;padding:9px 10px;font-size:14px}
.banner{margin:14px 22px 0;padding:11px 14px;background:#eef1fb;border:1px solid #d7defb;border-radius:10px;font-size:13px;color:#2a3566}
.banner b{color:var(--pri)}
.pad{padding:16px 22px 60px}
.times{display:grid;grid-template-columns:repeat(auto-fill,minmax(146px,1fr));gap:14px}
.time{background:var(--card);border:2px solid var(--bd);border-radius:12px;padding:13px;text-align:center;cursor:pointer;transition:.12s}
.time:hover{box-shadow:0 4px 14px rgba(20,30,60,.14);transform:translateY(-2px)}
.time img{width:60px;height:40px;object-fit:cover;border-radius:5px;box-shadow:0 1px 3px rgba(0,0,0,.18)}
.time .nm{font-weight:800;font-size:14px;margin-top:8px}
.time .ct{font-size:11px;margin-top:3px;color:var(--mut)}
.time .ct b{color:var(--ok)}
.toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;flex-wrap:wrap}
.tacts{display:flex;gap:8px;flex-wrap:wrap}
.profile{display:flex;align-items:center;gap:16px;background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:14px 18px;margin-bottom:12px;flex-wrap:wrap}
.pflag{width:56px;height:38px;object-fit:cover;border-radius:5px;box-shadow:0 1px 4px rgba(0,0,0,.2)}
.pmain{min-width:120px}
.pmain h2{margin:0;font-size:22px}
.prank{font-size:12px;color:var(--mut);margin-top:3px}
.pescudo{height:90px;width:auto;border-radius:7px;margin-left:auto;box-shadow:0 1px 5px rgba(0,0,0,.12)}
.pfoto{height:90px;width:auto;border-radius:9px;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.pgap{margin-left:auto}
.pjogos{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center}
.pjogos .lbl{font-size:12px;color:var(--mut);font-weight:700;width:100%}
.jchip{background:var(--card);border:1px solid var(--bd);border-radius:9px;padding:6px 10px;font-size:12px}
.jchip b{font-weight:800}
.wrap{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:880px){.wrap{grid-template-columns:1fr}}
.col{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:14px}
.col h3{margin:0 0 4px;font-size:14px}
.col .sub{color:var(--mut);font-size:12px;margin-bottom:10px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(116px,1fr));gap:11px}
.thumb{position:relative;width:100%;aspect-ratio:5/7;background:#eef0f4;border-radius:8px;overflow:hidden;display:block;cursor:pointer}
.thumb img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}
.thumb .ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.thumb .ph svg{width:60%;height:auto;opacity:.85}
.item{text-align:center}.item .meta{margin-top:5px}
.raw{border:2px solid transparent;border-radius:10px;padding:3px}
.raw.sel{border-color:var(--pri);box-shadow:0 0 0 2px rgba(67,97,238,.2)}
.raw.used .thumb{opacity:.5}
.ocrin{width:100%;margin-top:5px;border:1px solid var(--bd);border-radius:6px;padding:4px 5px;font-size:11px;text-align:center;text-transform:uppercase}
.adj{width:100%;margin-top:4px;background:#e4f6ec;color:#1faa59;border:0;border-radius:6px;padding:5px;font-size:11px;font-weight:700;cursor:pointer}
.adj:hover{background:#cdeed9}
.tsel{width:100%;margin-top:4px;border:1px solid var(--bd);border-radius:6px;padding:3px;font-size:10px;color:var(--mut);background:#fafbff}
.who{font-size:10px;color:var(--ok);font-weight:700;margin-top:4px;line-height:1.1;min-height:12px}
.especial{font-size:11px;font-weight:800;color:#9a6b00;margin-top:6px}
.jog{border:2px solid var(--bd);border-radius:10px;padding:5px;cursor:pointer;background:#fff}
.jog:hover{box-shadow:0 2px 10px rgba(20,30,60,.13)}
.nm{font-size:12px;font-weight:700;margin-top:4px;line-height:1.15}
.ps{font-size:11px;color:var(--mut)}
.tag{font-size:10px;font-weight:700;padding:1px 6px;border-radius:6px;display:inline-block;margin-top:3px}
.tag.r{background:#e4f6ec;color:var(--ok)}.tag.g{background:#fde8ea;color:var(--no)}
.xbtn{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;background:rgba(226,55,68,.92);color:#fff;border:0;font-size:13px;line-height:1;cursor:pointer;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 1px 3px rgba(0,0,0,.3);z-index:2}
.xbtn:hover{background:#c01f2e}
.muted{color:var(--mut);font-size:13px}
#armada{position:sticky;bottom:0;background:#fff;border-top:1px solid var(--bd);padding:9px 22px;font-size:13px;display:none;align-items:center;gap:10px;z-index:8}
#armada img{height:42px;border-radius:6px}
#busy{position:fixed;inset:0;background:rgba(247,248,251,.86);display:none;align-items:center;justify-content:center;flex-direction:column;gap:16px;z-index:70;backdrop-filter:blur(2px)}
.spin{width:48px;height:48px;border:5px solid #d7defb;border-top-color:var(--pri);border-radius:50%;animation:rot .8s linear infinite}
@keyframes rot{to{transform:rotate(360deg)}}
#busy .bt{font-weight:800;color:#2a3566;font-size:15px}
#busy .bs{font-size:12px;color:var(--mut)}
#mask{position:fixed;inset:0;background:rgba(18,24,44,.48);display:none;align-items:center;justify-content:center;z-index:50;padding:20px;backdrop-filter:blur(2px)}
.mbox{background:#fff;border-radius:16px;padding:22px 22px 18px;max-width:380px;width:100%;box-shadow:0 18px 50px rgba(0,0,0,.32);animation:pop .15s ease}
@keyframes pop{from{transform:scale(.94);opacity:.4}to{transform:scale(1);opacity:1}}
.mbox .mt{font-size:16px;font-weight:800;margin-bottom:8px}
.mbox .mx{font-size:14px;color:#41495c;line-height:1.5;white-space:pre-line}
.mbtns{display:flex;gap:10px;justify-content:flex-end;margin-top:20px}
.mbtn{padding:9px 18px;border-radius:10px;border:0;font-weight:700;cursor:pointer;background:var(--pri);color:#fff}
.mbtn.gh{background:#eef1f6;color:#41495c}.mbtn.dg{background:var(--no)}
#toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:60;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none}
.tmsg{background:#1f2430;color:#fff;padding:11px 18px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.28);opacity:0;transform:translateY(12px);transition:.25s;max-width:90vw}
.tmsg.show{opacity:1;transform:translateY(0)}.tmsg.ok{background:#14794a}.tmsg.err{background:#c01f2e}
</style></head><body>
<div class="top">
 <button class="btnv ghost" onclick="voltar()">&#8592; Admin</button>
 <h2>&#127183; Figurinhas / Elencos</h2>
 <input id="busca" placeholder="buscar jogador..." oninput="renderJog()" style="width:170px;display:none">
 <span id="conn" class="muted">conectando...</span>
</div>

<div id="view-times" class="pad">
 <div class="toolbar">
  <div class="muted" style="font-weight:700">Todas as selecoes</div>
  <div class="tacts">
   <button class="btnv big" onclick="cortarTodos()">&#128193; Cortar TODAS (pasta do album)</button>
   <button class="btnv auto" onclick="casarTodos()">&#9889; Casar TODOS (pelos nomes)</button>
  </div>
 </div>
 <input type="file" id="dirin" webkitdirectory directory multiple style="display:none" onchange="enviarPasta(this)">
 <div class="banner">As fotos ja estao no servidor. Clique <b>Casar TODOS</b> pra atribuir os jogadores pelos nomes nos 48 times de uma vez. Ou clique num time pra ajustar so ele. <b id="resumo"></b></div>
 <div id="times" class="times" style="margin-top:14px"><div class="muted">carregando times...</div></div>
</div>

<div id="view-time" class="pad" style="display:none">
 <div class="toolbar">
  <button class="btnv ghost" onclick="mostrarTimes()">&#8592; Todos os times</button>
  <div class="tacts">
   <button class="btnv pdf a-act" onclick="cortarPdf()">&#128196; Cortar do PDF</button>
   <button class="btnv auto a-act" onclick="autoCasar()">&#9889; Preencher automatico</button>
   <button class="btnv rb a-act" onclick="reocr()">&#128301; Refazer OCR</button>
  </div>
 </div>
 <input type="file" id="pdfin" accept="application/pdf,.pdf" style="display:none" onchange="enviarPdf(this)">
 <div class="profile">
  <img id="p-flag" class="pflag">
  <div class="pmain"><h2 id="t-nome"></h2><div id="p-rank" class="prank"></div></div>
  <div class="pgap"></div>
  <img id="p-escudo" class="pescudo" style="display:none">
  <img id="p-foto" class="pfoto" style="display:none">
 </div>
 <div id="p-jogos" class="pjogos"></div>
 <div class="banner" style="margin:0 0 12px">Marque o <b>escudo</b> e a <b>foto do time</b> no seletor dos recortes sem nome. <b>&#9889; Preencher automatico</b> casa os jogadores. Tudo salva na hora.</div>
 <div class="wrap">
  <div class="col">
   <h3>Escalacao <span id="qjog" class="muted"></span></h3>
   <div class="sub">verde = foto real | vermelho = silhueta (sem foto)</div>
   <div id="jog" class="cards"></div>
  </div>
  <div class="col">
   <h3>Figurinhas recortadas <span id="qraw" class="muted"></span></h3>
   <div class="sub">nome do OCR (editavel) + tipo de cada recorte</div>
   <div id="raw" class="cards"></div>
  </div>
 </div>
</div>

<div id="armada"><span>Figurinha selecionada:</span><img id="armada-img"><b id="armada-file"></b><span class="muted">agora clique no jogador (esquerda)</span><button class="btnv ghost" onclick="limparSel()">cancelar</button></div>
<div id="busy"><div class="spin"></div><div class="bt" id="busy-t">Processando...</div><div class="bs" id="busy-s">aguarde, nao feche a pagina</div></div>
<div id="mask"><div class="mbox"><div class="mt" id="m-ti"></div><div class="mx" id="m-tx"></div><div class="mbtns"><button class="mbtn gh" id="m-cancel">Cancelar</button><button class="mbtn" id="m-ok">Confirmar</button></div></div></div>
<div id="toast"></div>
<script>
var BASE=(function(){var p=location.pathname;var i=p.indexOf("/admin");if(i>=0)return p.substring(0,i);return p;})();
var SIL='<svg viewBox="0 0 80 104" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="33" r="19" fill="#c2c6cf"/><path d="M10 100 a30 32 0 0 1 60 0 z" fill="#c2c6cf"/></svg>';
var TIMES=[], DADOS=null, SELRAW=null, COR="#4361ee";
function H(){var h={"content-type":"application/json"};var s=localStorage.getItem("sessao");if(s){h["authorization"]="Bearer "+s;}return h;}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c];});}
function hexA(h,a){h=(h||"#4361ee").replace("#","");if(h.length===3)h=h.charAt(0)+h.charAt(0)+h.charAt(1)+h.charAt(1)+h.charAt(2)+h.charAt(2);var n=parseInt(h,16);return "rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+a+")";}
function vimg(u){return BASE+u;}
function voltar(){location.href=BASE+"/admin";}
function busy(on,t,s){var b=document.getElementById("busy");if(t)document.getElementById("busy-t").textContent=t;if(s!==undefined)document.getElementById("busy-s").textContent=s;b.style.display=on?"flex":"none";}
function modal(t,x,ok,perigo){return new Promise(function(res){var mk=document.getElementById("mask");document.getElementById("m-ti").textContent=t||"";document.getElementById("m-tx").textContent=x||"";var b=document.getElementById("m-ok"),c=document.getElementById("m-cancel");b.textContent=ok||"Confirmar";b.className="mbtn"+(perigo?" dg":"");mk.style.display="flex";function fim(v){mk.style.display="none";b.onclick=null;c.onclick=null;res(v);}b.onclick=function(){fim(true);};c.onclick=function(){fim(false);};});}
function toast(msg,tipo){var c=document.getElementById("toast");var d=document.createElement("div");d.className="tmsg"+(tipo?(" "+tipo):"");d.textContent=msg;c.appendChild(d);requestAnimationFrame(function(){d.classList.add("show");});setTimeout(function(){d.classList.remove("show");setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},300);},4000);}
function nrm(s){return (s||"").toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();}
function normf(s){return (s||"").toUpperCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^A-Z0-9]/g,"");}
function bigr(s){s=s.replace(/ /g,"");var r=[];for(var i=0;i<s.length-1;i++)r.push(s.substr(i,2));return r;}
function dice(a,b){if(!a||!b)return 0;if(a===b)return 1;var A=bigr(a),B=bigr(b);if(!A.length||!B.length)return 0;var used={},m=0;for(var i=0;i<A.length;i++){for(var j=0;j<B.length;j++){if(!used[j]&&A[i]===B[j]){used[j]=1;m++;break;}}}return 2*m/(A.length+B.length);}
function score(a,b){var ka=nrm(a),kb=nrm(b);var full=dice(ka.replace(/ /g,""),kb.replace(/ /g,""));var ta=ka.split(" ").filter(function(w){return w.length>2;}),tb=kb.split(" ").filter(function(w){return w.length>2;});var tp=0;ta.forEach(function(x){tb.forEach(function(y){var d=dice(x,y);if(d>tp)tp=d;});});return Math.max(full,tp*0.9);}
function matchJog(nome){var best=null,bs=0;(DADOS.jogadores||[]).forEach(function(j){var sc=score(nome,j.nome);if(sc>bs){bs=sc;best=j;}});return {jog:best,score:bs};}
function fileB64(f){return new Promise(function(res,rej){var rd=new FileReader();rd.onload=function(){res(String(rd.result).split(",").pop());};rd.onerror=function(){rej(new Error("read"));};rd.readAsDataURL(f);});}
async function init(){
 var r=await fetch(BASE+"/admin/figs/selecoes",{headers:H()});
 var c=document.getElementById("conn");
 if(!r.ok){c.textContent="faca login no /admin primeiro";c.style.color="#e23744";return;}
 c.textContent="conectado";c.style.color="#1faa59";
 TIMES=await r.json();
 var tr=0,tt=0;TIMES.forEach(function(t){tr+=t.reais;tt+=t.qtd;});
 document.getElementById("resumo").textContent=TIMES.length+" times | "+tr+"/"+tt+" figurinhas reais ja atribuidas";
 renderTimes();
}
function renderTimes(){
 var box=document.getElementById("times");
 if(!TIMES.length){box.innerHTML='<div class="muted">nenhum time.</div>';return;}
 box.innerHTML=TIMES.map(function(t,i){
  var fl=t.bandeira?('<img src="'+t.bandeira+'" loading="lazy">'):'<div style="font-size:34px">&#127937;</div>';
  var st="border-color:"+(t.cor||"#ccc")+";background:"+hexA(t.cor,0.06);
  return '<div class="time" style="'+st+'" onclick="abrirTime('+i+')">'+fl+'<div class="nm">'+esc(t.selecao_pt)+'</div><div class="ct"><b>'+t.reais+'</b>/'+t.qtd+' reais</div></div>';
 }).join("");
}
function mostrarTimes(){document.getElementById("view-time").style.display="none";document.getElementById("view-times").style.display="block";document.getElementById("busca").style.display="none";document.getElementById("armada").style.display="none";init();}
async function carregarTime(selecao){
 var r=await fetch(BASE+"/admin/figs/dados?selecao="+encodeURIComponent(selecao),{headers:H()});
 if(!r.ok){document.getElementById("raw").innerHTML='<div class="muted">erro ao carregar</div>';return;}
 DADOS=await r.json();COR=DADOS.cor||COR;renderPerfil();renderRaw();renderJog();
}
async function abrirTime(i){
 var t=TIMES[i];SELRAW=null;COR=t.cor||"#4361ee";
 document.getElementById("view-times").style.display="none";
 document.getElementById("view-time").style.display="block";
 document.getElementById("busca").style.display="inline-block";
 document.getElementById("armada").style.display="none";
 document.getElementById("t-nome").textContent=t.selecao_pt;
 document.getElementById("t-nome").style.color=COR;
 document.getElementById("p-flag").src=t.bandeira||"";
 document.getElementById("p-escudo").style.display="none";
 document.getElementById("p-foto").style.display="none";
 document.getElementById("p-jogos").innerHTML="";
 document.getElementById("jog").innerHTML='<div class="muted">carregando...</div>';
 document.getElementById("raw").innerHTML='<div class="muted">carregando...</div>';
 await carregarTime(t.selecao);
}
function renderPerfil(){
 document.getElementById("p-flag").src=DADOS.bandeira||"";
 document.getElementById("p-rank").textContent="Ranking FIFA: a cadastrar";
 var es=document.getElementById("p-escudo");if(DADOS.escudo){es.src=vimg(DADOS.escudo);es.style.display="";}else es.style.display="none";
 var fo=document.getElementById("p-foto");if(DADOS.foto){fo.src=vimg(DADOS.foto);fo.style.display="";}else fo.style.display="none";
 var jb=document.getElementById("p-jogos");var js=DADOS.jogos||[];
 if(!js.length){jb.innerHTML="";return;}
 jb.innerHTML='<div class="lbl">Jogos na Copa</div>'+js.map(function(g){
  var pl=(g.pc!=null&&g.pv!=null)?(g.pc+" x "+g.pv):"vs";
  return '<div class="jchip">'+esc(g.data)+' &middot; <b>'+esc(g.casa)+'</b> '+pl+' <b>'+esc(g.visit)+'</b></div>';
 }).join("");
}
function tsel(i,tipo){
 function o(v,l){return '<option value="'+v+'"'+(tipo===v?" selected":"")+'>'+l+'</option>';}
 return '<select class="tsel" onclick="event.stopPropagation()" onchange="marcar('+i+',this.value)">'+o("jogador","jogador")+o("escudo","escudo")+o("time","foto do time")+'</select>';
}
function renderRaw(){
 var box=document.getElementById("raw");var raw=DADOS.raw||[];
 document.getElementById("qraw").textContent="("+raw.length+")";
 if(!raw.length){box.innerHTML='<div class="muted">nenhum recorte. Use <b>Cortar do PDF</b>.</div>';return;}
 box.innerHTML=raw.map(function(rw,i){
  var who=rw.jogador_nome?('<div class="who">&#10003; '+esc(rw.jogador_nome)+'</div>'):'<div class="who"></div>';
  var cls="item raw"+(rw.jogador_id?" used":"");
  var meio="",sel="";
  if(rw.tipo==="escudo"||rw.tipo==="time"){
   meio='<div class="especial">'+(rw.tipo==="escudo"?"&#127942; escudo":"&#128247; foto do time")+'</div>';sel=tsel(i,rw.tipo);
  }else if(rw.tipo==="jogador"){
   meio='<input class="ocrin" id="ocr'+i+'" value="'+esc(rw.ocr||"")+'" onclick="event.stopPropagation()" onchange="DADOS.raw['+i+'].ocr=this.value"><button class="adj" onclick="ajustarAuto('+i+')">ajustar</button>';
  }else{
   meio='<input class="ocrin" id="ocr'+i+'" value="'+esc(rw.ocr||"")+'" onclick="event.stopPropagation()" onchange="DADOS.raw['+i+'].ocr=this.value"><button class="adj" onclick="ajustarAuto('+i+')">ajustar</button>';sel=tsel(i,rw.tipo);
  }
  return '<div class="'+cls+'" data-i="'+i+'"><div class="thumb" onclick="pickRaw('+i+')"><img src="'+vimg(rw.url)+'" loading="lazy"></div>'+meio+sel+who+'</div>';
 }).join("");
}
function pickRaw(i){
 var rw=DADOS.raw[i];if(rw.tipo==="escudo"||rw.tipo==="time"){toast("Esse recorte esta marcado como "+(rw.tipo==="escudo"?"escudo":"foto do time")+".","err");return;}
 SELRAW=rw;document.querySelectorAll(".raw").forEach(function(e){e.classList.toggle("sel",e.getAttribute("data-i")==String(i));});
 var a=document.getElementById("armada");a.style.display="flex";document.getElementById("armada-img").src=vimg(SELRAW.url);document.getElementById("armada-file").textContent=SELRAW.file;
}
function limparSel(){SELRAW=null;document.getElementById("armada").style.display="none";document.querySelectorAll(".raw").forEach(function(e){e.classList.remove("sel");});}
async function marcar(i,tipo){
 var rw=DADOS.raw[i];
 var r=await fetch(BASE+"/admin/figs/marcar",{method:"POST",headers:H(),body:JSON.stringify({selecao:DADOS.selecao,file:rw.file,tipo:tipo})});
 if(!r.ok){toast("Erro ao marcar","err");return;}
 toast(tipo==="escudo"?"Marcado como escudo":(tipo==="time"?"Marcado como foto do time":"Voltou para jogador"),"ok");
 await carregarTime(DADOS.selecao);
}
function renderJog(){
 if(!DADOS){return;}
 var box=document.getElementById("jog");var q=(document.getElementById("busca").value||"").toLowerCase();
 var list=(DADOS.jogadores||[]).filter(function(j){return !q||(j.nome||"").toLowerCase().indexOf(q)>=0;});
 document.getElementById("qjog").textContent="("+list.length+")";
 if(!list.length){box.innerHTML='<div class="muted">nada encontrado.</div>';return;}
 var bg=hexA(COR,0.10),bd=hexA(COR,0.45);
 box.innerHTML=list.map(function(j){
  var bust=j.bust||DADOS.v;
  var inner=j.figurinha?('<img src="'+BASE+"/fig/"+j.figurinha+"?v="+bust+'" loading="lazy">'):('<div class="ph">'+SIL+'</div>');
  var x=j.real?'<button class="xbtn" title="desconectar figurinha" onclick="event.stopPropagation();remover('+j.id+')">&#10005;</button>':'';
  var tag=j.real?'<span class="tag r">REAL</span>':'<span class="tag g">silhueta</span>';
  var st="background:"+bg+";border-color:"+bd;
  return '<div class="item jog" style="'+st+'" onclick="atribuir('+j.id+')"><div class="thumb">'+inner+x+'</div><div class="meta">'+tag+'<div class="nm">'+esc(j.nome)+'</div><div class="ps">'+esc(j.posicao_pt)+'</div></div></div>';
 }).join("");
}
async function doAssign(rw,jid){
 var r=await fetch(BASE+"/admin/figs/atribuir",{method:"POST",headers:H(),body:JSON.stringify({jogador_id:jid,folder:DADOS.folder,file:rw.file})});
 if(!r.ok){var e=await r.json().catch(function(){return {};});toast("Erro: "+(e.erro||r.status),"err");return false;}
 await carregarTime(DADOS.selecao);
 var j=(DADOS.jogadores||[]).filter(function(x){return x.id==jid;})[0];
 if(j)toast("Salvo: "+j.nome,"ok");return true;
}
async function atribuir(jid){if(!SELRAW){toast("Clique numa figurinha (direita) ou use o botao ajustar.","err");return;}await doAssign(SELRAW,jid);}
async function ajustarAuto(i){
 var rw=DADOS.raw[i];var nome=(document.getElementById("ocr"+i).value||"").trim();
 if(!nome){toast("Digite o nome do jogador no campo.","err");return;}
 var m=matchJog(nome);if(!m.jog){toast("Nenhum jogador parecido encontrado.","err");return;}
 var pct=Math.round(m.score*100);
 var ok=await modal("Confirmar atribuicao","Figurinha para:\\n"+m.jog.nome+"  ("+m.jog.posicao_pt+")\\nsemelhanca: "+pct+"%","Atribuir");
 if(!ok){return;}await doAssign(rw,m.jog.id);
}
async function remover(jid){
 var j=(DADOS.jogadores||[]).filter(function(x){return x.id==jid;})[0];
 var ok=await modal("Desconectar figurinha","Desconectar a figurinha de "+(j?j.nome:"")+"? Ela volta pra silhueta.","Desconectar",true);
 if(!ok){return;}
 var r=await fetch(BASE+"/admin/figs/remover",{method:"POST",headers:H(),body:JSON.stringify({jogador_id:jid})});
 if(!r.ok){var e=await r.json().catch(function(){return {};});toast("Erro: "+(e.erro||r.status),"err");return;}
 await carregarTime(DADOS.selecao);toast("Desconectado","ok");
}
function cortarPdf(){if(!DADOS){return;}document.getElementById("pdfin").click();}
async function enviarPdf(inp){
 if(!DADOS||!inp.files||!inp.files[0]){return;}
 var f=inp.files[0];inp.value="";
 var ok=await modal("Cortar do PDF","Cortar "+DADOS.selecao_pt+' do PDF "'+f.name+'"?',"Cortar");
 if(!ok){return;}
 busy(true,"Cortando "+DADOS.selecao_pt+"...","renderizando + lendo nomes (ate ~1 min)");
 try{
  var b64=await fileB64(f);
  var r=await fetch(BASE+"/admin/figs/cortar",{method:"POST",headers:H(),body:JSON.stringify({selecao:DADOS.selecao,pdf_base64:b64})});
  var j=await r.json().catch(function(){return {};});
  if(!r.ok||j.erro){busy(false);toast("Erro: "+(j.erro||j.detalhe||r.status),"err");return;}
  await carregarTime(DADOS.selecao);busy(false);
  toast("Cortado! "+(j.tiles||0)+" figurinhas, "+(j.jogadores||0)+" nomes.","ok");
 }catch(e){busy(false);toast("Erro no corte","err");}
}
function cortarTodos(){document.getElementById("dirin").click();}
async function enviarPasta(inp){
 var files=Array.prototype.slice.call(inp.files||[]);inp.value="";
 if(!files.length){return;}
 var byNorm={};TIMES.forEach(function(t){byNorm[normf(t.folder)]=t;});
 var porSel={};
 files.forEach(function(f){
  if(!/\\.pdf$/i.test(f.name))return;
  var up=f.name.toUpperCase();
  if(up.indexOf("GUIA")>=0||up.indexOf("NEYMAR")>=0)return;
  var parts=(f.webkitRelativePath||f.name).split("/");
  var t=null;
  for(var k=0;k<parts.length;k++){if(byNorm[normf(parts[k])]){t=byNorm[normf(parts[k])];break;}}
  if(!t){var nf=normf(f.name.replace(/\\.pdf$/i,""));if(byNorm[nf])t=byNorm[nf];}
  if(!t)return;
  var cur=porSel[t.selecao];
  if(!cur||f.size>cur.file.size)porSel[t.selecao]={t:t,file:f};
 });
 var lista=Object.keys(porSel).map(function(s){return porSel[s];});
 if(!lista.length){toast("Nenhum PDF de selecao encontrado. Escolha a pasta ALBUM COMPLETO DA COPA.","err");return;}
 var ok=await modal("Cortar TODAS","Achei "+lista.length+" selecoes. Cortar todas no servidor agora?\\n\\nLeva alguns minutos. Nao feche a pagina.","Cortar todas");
 if(!ok){return;}
 var done=0,err=0,en=[];
 for(var i=0;i<lista.length;i++){
  var it=lista[i];
  busy(true,"Cortando "+(i+1)+"/"+lista.length+": "+it.t.selecao_pt,"renderizando + lendo nomes...");
  try{
   var b64=await fileB64(it.file);
   var r=await fetch(BASE+"/admin/figs/cortar",{method:"POST",headers:H(),body:JSON.stringify({selecao:it.t.selecao,pdf_base64:b64})});
   var j=await r.json().catch(function(){return {};});
   if(r.ok&&!j.erro)done++;else{err++;en.push(it.t.selecao_pt);}
  }catch(e){err++;en.push(it.t.selecao_pt);}
 }
 busy(false);
 toast("Pronto! "+done+" times cortados"+(err?(" | "+err+" falharam: "+en.join(", ")):"")+".","ok");
 init();
}
async function casarTodos(){
 var ok=await modal("Casar TODOS","Casar automaticamente as figurinhas de todos os "+TIMES.length+" times pelos nomes?\\n\\nSo preenche os vazios.","Casar todos");
 if(!ok){return;}
 var totalNovas=0;
 for(var i=0;i<TIMES.length;i++){
  var t=TIMES[i];
  busy(true,"Casando "+(i+1)+"/"+TIMES.length+": "+t.selecao_pt,"");
  try{
   var r=await fetch(BASE+"/admin/figs/auto",{method:"POST",headers:H(),body:JSON.stringify({selecao:t.selecao})});
   var j=await r.json().catch(function(){return {};});
   if(r.ok&&j.novas)totalNovas+=j.novas;
  }catch(e){}
 }
 busy(false);
 toast("Pronto! "+totalNovas+" figurinhas casadas no total.","ok");
 init();
}
async function autoCasar(){
 if(!DADOS){return;}
 var ok=await modal("Preencher automatico","Completar os jogadores vazios de "+DADOS.selecao_pt+" pelo nome?","Preencher");
 if(!ok){return;}busy(true,"Casando figurinhas...","");
 var r=await fetch(BASE+"/admin/figs/auto",{method:"POST",headers:H(),body:JSON.stringify({selecao:DADOS.selecao})});
 if(!r.ok){busy(false);var e=await r.json().catch(function(){return {};});toast("Erro: "+(e.erro||r.status),"err");return;}
 var j=await r.json();await carregarTime(DADOS.selecao);busy(false);
 toast("Preenchidas "+j.novas+" novas (de "+j.total+").","ok");
}
async function reocr(){
 if(!DADOS){return;}
 var ok=await modal("Refazer OCR","Reler os nomes de "+DADOS.selecao_pt+"?","Refazer OCR");
 if(!ok){return;}busy(true,"Relendo os nomes...","");
 var r=await fetch(BASE+"/admin/figs/reocr",{method:"POST",headers:H(),body:JSON.stringify({selecao:DADOS.selecao})});
 if(!r.ok){busy(false);var e=await r.json().catch(function(){return {};});toast("Erro: "+(e.erro||r.status),"err");return;}
 await carregarTime(DADOS.selecao);busy(false);toast("OCR refeito.","ok");
}
init();
</script></body></html>`;
