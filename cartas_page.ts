import { NAV_CSS, sideHtml, NAV_JS } from "./ui.js";

// Pagina (HTML + CSS + JS do cliente) da Fabrica de Figurinhas (/admin/cartas).
// Separada da logica (cartas.ts) pra editar barato. Endpoints usados: ver cartas.ts.
export const PAGINA = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fabrica de Figurinhas - Bolao da Copa 26</title>
<style>
:root{--pri:#4361ee;--bg:#f3f4f8;--card:#fff;--tx:#1f2430;--mut:#7a8194;--bd:#e6e8f0;--ok:#1faa59;--no:#e23744;}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx)}
.app{display:flex;min-height:100vh}.main{flex:1;min-width:0}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 24px;background:var(--card);border-bottom:1px solid var(--bd)}
.top h2{margin:0;font-size:18px}
.pad{padding:18px 24px 60px;max-width:1080px}
.card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:18px;margin-bottom:14px}
.card h3{margin:0 0 4px;font-size:15px}
.cardhead{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.sub{color:var(--mut);font-size:12px;margin-bottom:8px}
label{display:block;font-size:12px;color:var(--mut);margin:8px 0 4px;font-weight:600}
input,select,textarea{width:100%;background:#fff;border:1px solid var(--bd);color:var(--tx);border-radius:9px;padding:9px 10px;font-size:14px}
textarea{resize:vertical;font-size:12.5px;line-height:1.45;font-family:ui-monospace,Consolas,monospace}
button{background:var(--pri);color:#fff;border:0;border-radius:9px;padding:9px 14px;font-weight:700;cursor:pointer;font-size:13px}
button:disabled{opacity:.6}button.sm{padding:7px 11px;font-size:12px}button.gh{background:#eef1fb;color:var(--pri)}button.gr{background:#14794a}
.row{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end}
.muted{color:var(--mut);font-size:13px}
.slots{display:flex;gap:16px;flex-wrap:wrap}
.slot{flex:1;min-width:300px;border:1px solid var(--bd);border-radius:12px;padding:12px}
.imgs{display:flex;gap:12px;align-items:flex-start;margin:10px 0}
.box{position:relative;border:1px solid var(--bd);border-radius:10px;overflow:hidden;background:#eef1f6;display:flex;align-items:center;justify-content:center}
.box img{width:100%;height:100%;object-fit:contain;display:block}
.molde{width:200px;height:266px}.ref{width:92px;height:122px}.res{width:170px;height:226px}
.cap{font-size:11px;color:var(--mut);text-align:center;padding:4px;font-weight:700}
.delx{position:absolute;top:6px;right:6px;width:26px;height:26px;border-radius:50%;background:var(--no);color:#fff;border:2px solid #fff;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;padding:0;box-shadow:0 2px 6px rgba(0,0,0,.3);z-index:5}
.chk{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--tx);font-weight:600;margin:0}
.chk input{width:auto;margin:0}
.cor{display:flex;flex-direction:column;gap:2px}.cor input{width:48px;height:36px;padding:2px}
.fld{display:flex;flex-direction:column;gap:2px}.fld input{width:64px}
.pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700}
.pill.ok{background:#e4f6ec;color:#14794a}.pill.no{background:#fde8ea;color:#c01f2e}.pill.gk{background:#fff2d6;color:#9a6b00}
.lista{max-height:360px;overflow:auto;border:1px solid var(--bd);border-radius:10px}
.jl{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 12px;border-bottom:1px solid var(--bd);cursor:pointer}
.jl:hover{background:#eef1fb}.jl b{font-size:13px}.jl .p{font-size:12px;color:var(--mut)}.jl input{width:auto;margin-right:8px}
.gal{display:flex;gap:14px;flex-wrap:wrap}
.hide{display:none}
#toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:90;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none}
.tmsg{background:#1f2430;color:#fff;padding:11px 18px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.28);opacity:0;transform:translateY(12px);transition:.25s;max-width:520px;text-align:center}
.tmsg.show{opacity:1;transform:translateY(0)}.tmsg.ok{background:#14794a}.tmsg.err{background:#c01f2e}
.mov{position:fixed;inset:0;background:rgba(20,24,30,.46);backdrop-filter:blur(3px);display:none;align-items:center;justify-content:center;z-index:100;padding:20px}
.mov.show{display:flex}
.modal{background:var(--card);border:1px solid var(--bd);border-radius:18px;padding:22px 22px 18px;max-width:430px;width:100%;box-shadow:0 24px 70px rgba(0,0,0,.32);transform:scale(.95);opacity:0;transition:.18s}
.mov.show .modal{transform:scale(1);opacity:1}
.modal .ic{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;background:#eef1fb;margin-bottom:12px}
.modal h3{margin:0 0 6px;font-size:17px}
.modal p{margin:0 0 18px;font-size:13.5px;line-height:1.5;color:var(--mut)}
.modal .acts{display:flex;gap:10px;justify-content:flex-end}
.modal .acts button{padding:10px 18px}
${NAV_CSS}
</style></head><body>
<div class="app">
 ${sideHtml("cartas")}
 <main class="main">
  <div class="top"><h2>&#127981; Fabrica de Figurinhas</h2><span id="conn" class="muted">conectando...</span></div>
  <div class="pad">

   <div class="card"><div class="row"><div style="flex:1;min-width:160px"><label>Selecao (pasta)</label><select id="time" onchange="carregar()"></select></div>
    <div style="flex:1;min-width:160px"><label>Elenco (auto, corrija so se errar)</label><select id="sel" onchange="carregar(true)"></select></div></div></div>

   <div class="card"><div class="cardhead"><h3>&#128221; Prompt da base (nano banana)</h3><button class="sm gh" onclick="togPrompt()" id="pp-tog">mostrar</button></div>
    <div id="pp-wrap" class="hide"><div class="sub">Mesmo prompt do Criador. "Gerar nano" usa ESTE.</div>
     <textarea id="pp" rows="11"></textarea><div style="margin-top:8px"><button class="sm" onclick="salvarPrompt()">Salvar prompt</button></div></div>
   </div>

   <div class="card"><h3>1) Moldes do time <span id="cabtime" class="muted"></span></h3>
    <div class="sub">Goleiro = primeiro tile de jogador; Jogador de linha = foto 8. Gere pelo nano ou <b>suba a base externa</b>. Bases ficam numa subpasta (nao aparecem nos recortes). O <b>X</b> apaga a base pra refazer.</div>
    <div class="slots">
     <div class="slot"><b>&#9917; Jogador</b> <span id="st-j" class="pill no">sem base</span>
      <div class="imgs"><div><div class="box molde" id="sh-j"></div><div class="cap">MOLDE (base)</div></div><div><div class="box ref" id="rt-j"></div><div class="cap">ref</div></div></div>
      <div class="row"><div style="flex:1"><label>Ref nano</label><select id="ref-j" onchange="mostraRef('j')"></select></div><button class="sm" onclick="nano('jogador')">Gerar nano</button></div>
      <label>Subir base externa (PNG)</label><input type="file" accept="image/png,image/jpeg" id="up-j" onchange="subir('jogador')"></div>
     <div class="slot"><b>&#129508; Goleiro</b> <span id="st-g" class="pill no">sem base</span>
      <div class="imgs"><div><div class="box molde" id="sh-g"></div><div class="cap">MOLDE (base)</div></div><div><div class="box ref" id="rt-g"></div><div class="cap">ref</div></div></div>
      <div class="row"><div style="flex:1"><label>Ref nano</label><select id="ref-g" onchange="mostraRef('g')"></select></div><button class="sm" onclick="nano('goleiro')">Gerar nano</button></div>
      <label>Subir base externa (PNG)</label><input type="file" accept="image/png,image/jpeg" id="up-g" onchange="subir('goleiro')"></div>
    </div>
   </div>

   <div class="card"><div class="cardhead"><h3>&#9999;&#65039; Padrao do texto (editavel)</h3><button class="sm" onclick="salvarEstilo()">Salvar padrao</button></div>
    <div class="sub">Aplicado ao gerar. Tam.= fonte (%). <b>X</b> = esquerda(-)/direita(+). <b>Y</b> = sobe(-)/desce(+). Ajuste fino na mao.</div>
    <div class="slots">
     <div class="slot"><b>Titulo (nome)</b>
      <div class="row" style="margin-top:8px;align-items:center">
       <div class="cor"><label style="margin:0">Cor</label><input type="color" id="e-nome-cor" value="#ffffff"></div>
       <div class="fld"><label style="margin:0">Tam. %</label><input type="number" id="e-nome-tam" value="100" min="40" max="220" step="5"></div>
       <div class="fld"><label style="margin:0">X &#8596;</label><input type="number" id="e-nome-dx" value="0" min="-25" max="25" step="1"></div>
       <div class="fld"><label style="margin:0">Y &#8597;</label><input type="number" id="e-nome-dy" value="0" min="-25" max="25" step="1"></div>
       <label class="chk"><input type="checkbox" id="e-nome-caps" checked> CAPS</label>
       <label class="chk"><input type="checkbox" id="e-nome-bold" checked> Bold</label>
      </div>
     </div>
     <div class="slot"><b>Posicao do jogador</b>
      <div class="row" style="margin-top:8px;align-items:center">
       <div class="cor"><label style="margin:0">Cor</label><input type="color" id="e-pos-cor" value="#ffffff"></div>
       <div class="fld"><label style="margin:0">Tam. %</label><input type="number" id="e-pos-tam" value="100" min="40" max="220" step="5"></div>
       <div class="fld"><label style="margin:0">X &#8596;</label><input type="number" id="e-pos-dx" value="0" min="-25" max="25" step="1"></div>
       <div class="fld"><label style="margin:0">Y &#8597;</label><input type="number" id="e-pos-dy" value="0" min="-25" max="25" step="1"></div>
       <label class="chk"><input type="checkbox" id="e-pos-caps" checked> CAPS</label>
       <label class="chk"><input type="checkbox" id="e-pos-bold"> Bold</label>
      </div>
     </div>
    </div>
   </div>

   <div class="card"><div class="cardhead"><div><h3>2) Jogadores SEM figurinha <span id="cnt" class="muted"></span></h3>
     <div class="sub">Marque quem quer fazer. Goleiro usa o molde de goleiro; o resto, o de jogador.</div></div>
     <div class="row"><button class="sm gh" onclick="marcarTodos(true)">Marcar todos</button><button class="sm gh" onclick="marcarTodos(false)">Desmarcar</button><button class="gr" id="btn-lote" onclick="gerarLote()">&#9881;&#65039; Gerar selecionados</button></div></div>
    <div class="lista" id="lista" style="margin-top:8px"><div class="muted" style="padding:14px">selecione o time...</div></div>
   </div>

   <div class="card"><div class="cardhead"><h3>3) Resultado <span id="rescnt" class="muted"></span></h3>
     <button class="gr" id="btn-env" onclick="enviarEscalacao()">&#128228; Enviar pro plantel (Escalacao)</button></div>
    <div class="sub">Cada carta gerada fica salva no time. <b>Enviar pro plantel</b> ja atribui as cartas aos jogadores (ficam REAL na Escalacao na hora) - sem ajustar uma a uma.</div>
    <div class="gal" id="galeria"><div class="muted">gere os selecionados acima.</div></div>
   </div>

  </div>
 </main>
</div>

<div class="mov" id="mov"><div class="modal">
 <div class="ic" id="mic">&#9889;</div>
 <h3 id="mtit">Confirmar</h3>
 <p id="mmsg"></p>
 <div class="acts"><button class="gh" id="mno">Cancelar</button><button class="gr" id="mok">Confirmar</button></div>
</div></div>

<div id="toast"></div>
<script>
${NAV_JS}
function H(){var h={"content-type":"application/json"};var s=localStorage.getItem("sessao");if(s){h["authorization"]="Bearer "+s;}return h;}
function toast(m,t){var c=document.getElementById("toast");var d=document.createElement("div");d.className="tmsg"+(t?(" "+t):"");d.textContent=m;c.appendChild(d);requestAnimationFrame(function(){d.classList.add("show");});setTimeout(function(){d.classList.remove("show");setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},300);},4500);}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function ask(opt){
 opt=opt||{};var ov=document.getElementById("mov");
 document.getElementById("mtit").textContent=opt.titulo||"Confirmar";
 document.getElementById("mmsg").textContent=opt.msg||"";
 document.getElementById("mic").innerHTML=opt.icone||"&#9889;";
 var ok=document.getElementById("mok"),no=document.getElementById("mno");
 ok.textContent=opt.ok||"Confirmar";no.textContent=opt.no||"Cancelar";
 if(opt.perigo){ok.style.background="var(--no)";}else{ok.style.background="";}
 ov.classList.add("show");
 return new Promise(function(res){
  function fim(v){ov.classList.remove("show");ok.onclick=null;no.onclick=null;ov.onclick=null;document.onkeydown=null;res(v);}
  ok.onclick=function(){fim(true);};no.onclick=function(){fim(false);};
  ov.onclick=function(e){if(e.target===ov)fim(false);};
  document.onkeydown=function(e){if(e.key==="Escape")fim(false);if(e.key==="Enter")fim(true);};
 });
}
function togPrompt(){var w=document.getElementById("pp-wrap");var h=w.classList.toggle("hide");document.getElementById("pp-tog").textContent=h?"mostrar":"esconder";}
async function init(){
 var c=document.getElementById("conn");
 var pr=await fetch(_b()+"/admin/cartas/prompt",{headers:H()});
 if(!pr.ok){c.textContent="faca login no /admin";c.style.color="#e23744";return;}
 c.textContent="conectado";c.style.color="#1faa59";
 document.getElementById("pp").value=(await pr.json()).prompt||"";
 await carregarEstilo();
 var d=await (await fetch(_b()+"/admin/cartas/times",{headers:H()})).json();
 document.getElementById("time").innerHTML=(d.times||[]).map(function(x){return '<option>'+esc(x)+'</option>';}).join("");
 carregar();
}
async function salvarPrompt(){var r=await fetch(_b()+"/admin/cartas/prompt",{method:"POST",headers:H(),body:JSON.stringify({prompt:document.getElementById("pp").value})});toast(r.ok?"Prompt salvo":"erro",r.ok?"ok":"err");}
async function carregarEstilo(){
 try{var d=await (await fetch(_b()+"/admin/cartas/estilo",{headers:H()})).json();var e=d.estilo||{};
 document.getElementById("e-nome-cor").value=e.nome_cor||"#ffffff";
 document.getElementById("e-nome-tam").value=e.nome_tam||100;
 document.getElementById("e-nome-dx").value=(e.nome_dx||0);
 document.getElementById("e-nome-dy").value=(e.nome_dy||0);
 document.getElementById("e-nome-caps").checked=e.nome_caps!==false;
 document.getElementById("e-nome-bold").checked=e.nome_bold!==false;
 document.getElementById("e-pos-cor").value=e.pos_cor||"#ffffff";
 document.getElementById("e-pos-tam").value=e.pos_tam||100;
 document.getElementById("e-pos-dx").value=(e.pos_dx||0);
 document.getElementById("e-pos-dy").value=(e.pos_dy||0);
 document.getElementById("e-pos-caps").checked=e.pos_caps!==false;
 document.getElementById("e-pos-bold").checked=!!e.pos_bold;}catch(_){}
}
async function salvarEstilo(){
 var body={nome_cor:document.getElementById("e-nome-cor").value,nome_tam:document.getElementById("e-nome-tam").value,nome_dx:document.getElementById("e-nome-dx").value,nome_dy:document.getElementById("e-nome-dy").value,nome_caps:document.getElementById("e-nome-caps").checked,nome_bold:document.getElementById("e-nome-bold").checked,pos_cor:document.getElementById("e-pos-cor").value,pos_tam:document.getElementById("e-pos-tam").value,pos_dx:document.getElementById("e-pos-dx").value,pos_dy:document.getElementById("e-pos-dy").value,pos_caps:document.getElementById("e-pos-caps").checked,pos_bold:document.getElementById("e-pos-bold").checked};
 var r=await fetch(_b()+"/admin/cartas/estilo",{method:"POST",headers:H(),body:JSON.stringify(body)});
 toast(r.ok?"Padrao do texto salvo":"erro ao salvar",r.ok?"ok":"err");
}
function mostraRef(k){var tm=document.getElementById("time").value;var f=document.getElementById(k==="g"?"ref-g":"ref-j").value;document.getElementById("rt-"+k).innerHTML=(tm&&f)?('<img src="'+_b()+'/fig/raw/'+encodeURIComponent(tm)+'/'+encodeURIComponent(f)+'" onerror="this.style.opacity=.2">'):'';}
async function carregar(manterSel){
 var tm=document.getElementById("time").value;if(!tm)return;
 document.getElementById("cabtime").textContent="("+tm+")";
 var sel=manterSel?("&selecao="+encodeURIComponent(document.getElementById("sel").value)):"";
 var d=await (await fetch(_b()+"/admin/cartas/estado?time="+encodeURIComponent(tm)+sel,{headers:H()})).json();
 var jogs=(d.tiles||[]).filter(function(x){return String(x.tipo||"").indexOf("jogador")>=0;}).map(function(x){return x.file;});
 function tem(f){return jogs.indexOf(f)>=0;}
 var opts=(d.tiles||[]).map(function(x){var lab=x.file+(x.tipo?(" ["+x.tipo+"]"):"")+(x.nome?(" - "+x.nome):"");return '<option value="'+esc(x.file)+'">'+esc(lab)+'</option>';}).join("");
 var rj=document.getElementById("ref-j");rj.innerHTML=opts;rj.value=(tem("08.png")?"08.png":(jogs[6]||jogs[jogs.length-1]||"08.png"));
 var rg=document.getElementById("ref-g");rg.innerHTML=opts;rg.value=(jogs[0]||"02.png");
 mostraRef("j");mostraRef("g");
 var ss=document.getElementById("sel");ss.innerHTML='<option value="">(detectar)</option>'+(d.selecoes||[]).map(function(s){return '<option'+(s===d.selecao?" selected":"")+'>'+esc(s)+'</option>';}).join("");
 marca("j",d.tem_jogador,tm,"jogador");marca("g",d.tem_goleiro,tm,"goleiro");
 var L=document.getElementById("lista");var js=d.jogadores||[];window.__JS=js;
 document.getElementById("cnt").textContent="("+js.length+(d.selecao?(" - "+d.selecao):" - sem elenco")+")";
 document.getElementById("rescnt").textContent=(d.geradas?("("+d.geradas+" cartas prontas pra enviar)"):"");
 if(!js.length){L.innerHTML='<div class="muted" style="padding:14px">'+(d.selecao?("todos de "+esc(d.selecao)+" ja tem figurinha."):"elenco nao encontrado. Importe os elencos (football-data) ou ajuste no dropdown Elenco.")+'</div>';}
 else{L.innerHTML=js.map(function(j,i){return '<label class="jl"><span style="display:flex;align-items:center"><input type="checkbox" class="ck" data-i="'+i+'" checked><span><b>'+esc(j.nome)+'</b> <span class="p">'+esc(j.posicao)+'</span></span></span>'+(j.gk?'<span class="pill gk">goleiro</span>':'')+'</label>';}).join("");}
 document.getElementById("galeria").innerHTML='<div class="muted">gere os selecionados acima.</div>';
}
function marca(k,tem,tm,tipo){
 var p=document.getElementById("st-"+k);p.textContent=tem?"base ok":"sem base";p.className="pill "+(tem?"ok":"no");
 var box=document.getElementById("sh-"+k);
 if(tem){box.innerHTML='<img src="'+_b()+'/fig/cartabase/'+encodeURIComponent(tm)+'/'+tipo+'.png?v='+Date.now()+'"><button class="delx" title="Apagar base" onclick="apagarBase(\\''+tipo+'\\')">&#10005;</button>';}
 else{box.innerHTML='<div class="muted" style="font-size:11px">sem base</div>';}
}
async function apagarBase(tipo){
 if(!(await ask({titulo:"Apagar base",msg:"Apagar a base de "+tipo+"? Voce vai poder gerar outra.",ok:"Apagar",icone:"&#128465;",perigo:true})))return;
 var tm=document.getElementById("time").value;
 var r=await fetch(_b()+"/admin/cartas/apagar-base",{method:"POST",headers:H(),body:JSON.stringify({time:tm,tipo:tipo})});
 var j=await r.json().catch(function(){return{};});
 if(j&&j.ok){toast("Base "+tipo+" apagada","ok");carregar();}else{toast("erro ao apagar","err");}
}
function marcarTodos(v){var cks=document.querySelectorAll(".ck");for(var i=0;i<cks.length;i++)cks[i].checked=v;}
async function nano(tipo){var tm=document.getElementById("time").value;var ref=document.getElementById(tipo==="goleiro"?"ref-g":"ref-j").value;toast("Gerando base "+tipo+"...","ok");var r=await fetch(_b()+"/admin/cartas/nano",{method:"POST",headers:H(),body:JSON.stringify({time:tm,tipo:tipo,ref:ref})});var j=await r.json().catch(function(){return{};});if(!j.ok){toast("Falhou: "+(j.erro||""),"err");return;}toast("Base "+tipo+" gerada!","ok");carregar();}
async function subir(tipo){var tm=document.getElementById("time").value;var inp=document.getElementById(tipo==="goleiro"?"up-g":"up-j");var f=inp.files&&inp.files[0];if(!f)return;var rd=new FileReader();rd.onload=async function(){toast("Subindo base "+tipo+" pra "+tm+"...","ok");var r=await fetch(_b()+"/admin/cartas/subir",{method:"POST",headers:H(),body:JSON.stringify({time:tm,tipo:tipo,imagem:rd.result})});var j=await r.json().catch(function(){return{};});if(j.ok){toast("Base "+tipo+" salva!","ok");carregar();}else{toast("erro ao subir","err");}};rd.readAsDataURL(f);}
async function gerarLote(){
 var tm=document.getElementById("time").value;var js=window.__JS||[];
 var escolhidos=[];document.querySelectorAll(".ck").forEach(function(ck){if(ck.checked){var j=js[+ck.getAttribute("data-i")];if(j)escolhidos.push(j);}});
 if(!escolhidos.length){toast("Marque pelo menos um jogador","err");return;}
 var btn=document.getElementById("btn-lote");btn.disabled=true;btn.textContent="Gerando "+escolhidos.length+"...";
 document.getElementById("galeria").innerHTML='<div class="muted">gerando '+escolhidos.length+' figurinhas...</div>';
 var r=await fetch(_b()+"/admin/cartas/lote",{method:"POST",headers:H(),body:JSON.stringify({time:tm,jogadores:escolhidos})});
 var d=await r.json().catch(function(){return{};});
 if(!d.ok){toast("Falhou: "+(d.erro||""),"err");}
 else{
  document.getElementById("rescnt").textContent="("+d.feitos+"/"+d.total+")";
  document.getElementById("galeria").innerHTML=(d.resultados||[]).map(function(x){return '<div><div class="box res">'+(x.ok?('<img src="'+_b()+x.url+'">'):('<div class="muted" style="padding:12px;text-align:center">'+esc(x.erro||"erro")+'</div>'))+'</div><div class="cap">'+esc(x.nome)+(x.gk?' (gol)':'')+'</div></div>';}).join("");
  toast("Feitas "+d.feitos+" de "+d.total+"! Agora pode Enviar pro plantel.","ok");
 }
 btn.disabled=false;btn.textContent="Gerar selecionados";
}
async function enviarEscalacao(){
 var tm=document.getElementById("time").value;if(!tm)return;
 if(!(await ask({titulo:"Enviar pro plantel",msg:"Atribuir as cartas geradas de "+tm+" aos jogadores na Escalacao?",ok:"Enviar",icone:"&#128228;"})))return;
 var btn=document.getElementById("btn-env");btn.disabled=true;btn.textContent="Enviando...";
 var sel=document.getElementById("sel").value;
 var r=await fetch(_b()+"/admin/cartas/enviar-escalacao",{method:"POST",headers:H(),body:JSON.stringify({time:tm,selecao:sel})});
 var d=await r.json().catch(function(){return{};});
 if(d&&d.ok){toast("Atribuidas "+d.enviados+" na Escalacao"+((d.sem_carta&&d.sem_carta.length)?(" ("+d.sem_carta.length+" sem carta ainda)"):""),"ok");carregar();}
 else{toast("Falhou: "+((d&&d.erro)||""),"err");}
 btn.disabled=false;btn.textContent="Enviar pro plantel (Escalacao)";
}
init();
</script></body></html>`;
