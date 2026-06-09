import { NAV_CSS, sideHtml, NAV_JS } from "./ui.js";

export const PAGINA = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Criador de Figurinhas - Bolao da Copa 26</title>
<style>
:root{--pri:#4361ee;--bg:#f3f4f8;--card:#fff;--tx:#1f2430;--mut:#7a8194;--bd:#e6e8f0;--ok:#1faa59;--no:#e23744;}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx)}
.app{display:flex;min-height:100vh}
.main{flex:1;min-width:0}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 24px;background:var(--card);border-bottom:1px solid var(--bd)}
.top h2{margin:0;font-size:18px}
.pad{padding:18px 24px 60px;max-width:1080px}
.card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:18px;margin-bottom:14px}
.card h3{margin:0 0 4px;font-size:15px}
.sub{color:var(--mut);font-size:12px;margin-bottom:8px}
label{display:block;font-size:12px;color:var(--mut);margin:8px 0 4px;font-weight:600}
input,select,textarea{width:100%;background:#fff;border:1px solid var(--bd);color:var(--tx);border-radius:9px;padding:9px 10px;font-size:14px}
input[type=color]{padding:3px;height:38px}
textarea{resize:vertical;font-size:12.5px;line-height:1.45}
button{background:var(--pri);color:#fff;border:0;border-radius:9px;padding:10px 16px;font-weight:700;cursor:pointer;font-size:13px}
button:disabled{opacity:.65;cursor:default}
button.gr{background:#14794a}button.sm{padding:7px 12px;font-size:12px}button.gh{background:#eef1fb;color:var(--pri)}
.row{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end}
.muted{color:var(--mut);font-size:13px}
.motor{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background:#e7f0ff;color:#1e50a2}
.motor.no{background:#fde8ea;color:var(--no)}
.tabs2{display:flex;gap:6px;margin:14px 0 4px}
.t2{padding:8px 14px;border-radius:10px;border:1px solid var(--bd);background:#eef1f6;color:var(--mut);font-weight:700;font-size:13px;cursor:pointer}
.t2.on{background:var(--pri);color:#fff;border-color:var(--pri)}
.method{border:1px solid var(--bd);border-radius:12px;padding:14px;background:#fafbff}
.ajustes{border:1px dashed var(--bd);border-radius:10px;padding:12px;margin:10px 0;background:#fff}
.grid4{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px}
.preview{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start;margin-top:16px}
.shot{width:250px;border:1px solid var(--bd);border-radius:12px;overflow:hidden;background:#eef1f6;position:relative}
.shot img{width:100%;display:block}
.shot.work{outline:3px solid var(--pri);outline-offset:-3px;animation:pulse 1.1s ease-in-out infinite}
.shot .cap{padding:7px 10px;font-size:12px;color:var(--mut);font-weight:700}
.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:46px 16px;text-align:center;background:repeating-linear-gradient(45deg,#eef1ff,#eef1ff 12px,#e6ebff 12px,#e6ebff 24px)}
.loading .tt{color:var(--pri);font-weight:800;font-size:15px}.loading .ss{color:var(--mut);font-weight:600;font-size:12px}
.spin{width:46px;height:46px;border:5px solid #cdd6ff;border-top-color:var(--pri);border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(67,97,238,0)}50%{box-shadow:0 0 0 5px rgba(67,97,238,.18)}}
.genbar{margin-top:10px;display:none;align-items:center;gap:10px;color:var(--pri);font-weight:800;font-size:13px}
.genbar.show{display:flex}
.genbar .dot{width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid #cdd6ff;border-top-color:var(--pri);animation:spin .8s linear infinite}
#toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:60;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none}
.tmsg{background:#1f2430;color:#fff;padding:11px 18px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.28);opacity:0;transform:translateY(12px);transition:.25s;max-width:520px;text-align:center}
.tmsg.show{opacity:1;transform:translateY(0)}.tmsg.ok{background:#14794a}.tmsg.err{background:#c01f2e}
.hide{display:none}
${NAV_CSS}
</style></head><body>
<div class="app">
 ${sideHtml("criador")}
 <main class="main">
  <div class="top"><h2>&#127912; Criador de Figurinhas &mdash; base por selecao</h2><span id="conn" class="muted">conectando...</span></div>
  <div class="pad">

   <div class="card" id="motor-card"><h3>Motor de imagem (so pro nano banana)</h3>
    <div class="sub">O metodo pago usa o motor EM USO da aba <b>Motor de Imagem</b>. O metodo Local nao usa IA nem custa nada.</div>
    <div id="motor" class="motor no">verificando...</div></div>

   <div class="card"><h3>&#129514; Gerar base silhueta</h3>
    <div class="row"><div style="flex:1;min-width:180px"><label>Selecao</label><select id="time" onchange="carregarTiles()"></select></div>
     <div style="flex:1;min-width:200px"><label>Referencia (jogador base)</label><select id="ref" onchange="mostrarRef()"></select></div></div>

    <div class="tabs2">
     <div class="t2 on" data-m="local" onclick="metodo('local')">&#129513; Local (gratis)</div>
     <div class="t2" data-m="nano" onclick="metodo('nano')">&#127820; Nano banana (IA, pago)</div>
    </div>

    <div class="method" id="m-local">
     <div class="sub">Deterministico. <b>R$ 0</b>. Cinza so na CABECA + tarjas <b>auto-detectadas</b> por tile (pesca a cor da pontinha e some o texto). Largura/altura das tarjas saem certas sozinhas.</div>

     <div class="ajustes">
      <div style="font-weight:700;font-size:13px;margin-bottom:4px">&#9881;&#65039; Ajustes do corte (Local)</div>
      <div class="grid4">
       <div><label>Cor da silhueta</label><input type="color" id="aj-cor" value="#989ca2"></div>
       <div><label>Suavizar borda</label><input type="number" id="aj-blur" step="0.1" min="0" max="5" value="1.0"></div>
       <div><label>Silhueta</label><select id="aj-modo"><option value="cabeca">Cabeca (auto)</option><option value="cab_fixo">Cabeca (altura fixa)</option><option value="cheia">Busto inteiro</option></select></div>
       <div><label>Ombro / corte (0-1)</label><input type="number" id="aj-ombro" step="0.02" value="0.72"></div>
       <div><label>Altura fixa cabeca (y)</label><input type="number" id="aj-caby" step="0.005" value="0.46"></div>
       <div><label>Tarjas</label><select id="aj-tarja"><option value="cor_real">Cor real (auto)</option><option value="fixo">Cor real (coord. fixas)</option><option value="preta">Preta</option><option value="off">Nao mexer</option></select></div>
       <div><label>Ponta da tarja (x)</label><input type="number" id="aj-palx" step="0.005" value="0.085"></div>
       <div><label>Largura tarja x0</label><input type="number" id="aj-x0" step="0.002" value="0.062"></div>
       <div><label>Largura tarja x1</label><input type="number" id="aj-x1" step="0.002" value="0.745"></div>
      </div>
      <div class="grid4" style="margin-top:8px">
       <div><label>Fallback NOME y0</label><input type="number" id="aj-n0" step="0.002" value="0.822"></div>
       <div><label>Fallback NOME y1</label><input type="number" id="aj-n1" step="0.002" value="0.900"></div>
       <div><label>Fallback CLUBE y0</label><input type="number" id="aj-p0" step="0.002" value="0.908"></div>
       <div><label>Fallback CLUBE y1</label><input type="number" id="aj-p1" step="0.002" value="0.960"></div>
      </div>
      <div style="margin-top:8px"><button class="sm gh" onclick="salvarAjustes()">Salvar ajustes como padrao</button></div>
     </div>

     <button class="gr" id="btn-local" onclick="gerar('local')">Gerar local (gratis)</button>
     <div class="genbar" id="gb-local"><span class="dot"></span> Processando silhueta na biblioteca...</div>
    </div>

    <div class="method hide" id="m-nano">
     <div class="sub">Generativo (gemini-2.5-flash-image). <b>~R$ 0,20/imagem</b>. Regenera a figurinha do zero &mdash; pode variar a camisa e a resolucao.</div>
     <button id="btn-nano" onclick="gerar('nano')">Gerar com nano banana (pago)</button>
     <div class="genbar" id="gb-nano"><span class="dot"></span> Gerando no nano banana... aguarde alguns segundos.</div>
    </div>

    <div class="preview">
     <div class="shot"><div id="ref-wrap"></div><div class="cap" id="ref-cap">Referencia (entrada)</div></div>
     <div class="shot" id="out-shot"><div id="out-wrap"><div class="muted" style="padding:20px">escolha o metodo e clique em Gerar</div></div><div class="cap" id="out-cap">Resultado</div></div>
    </div>
   </div>

   <div id="prompts-nano">
    <div class="card"><h3>&#128221; Prompt base (so do nano banana)</h3>
     <div class="sub">Editavel e reutilizavel. Usado pra gerar a base no metodo pago.</div>
     <textarea id="p-base" rows="11"></textarea>
     <div style="margin-top:10px"><button class="sm" onclick="salvarPrompts()">Salvar prompts</button></div></div>

    <div class="card"><h3>&#128100; Prompt do jogador (troca de rosto) &mdash; usado depois</h3>
     <div class="sub">Mesma logica, mas troca a silhueta pela foto do jogador. Sera usado no criador do jogador.</div>
     <textarea id="p-jog" rows="8"></textarea>
     <div style="margin-top:10px"><button class="sm" onclick="salvarPrompts()">Salvar prompts</button></div></div>
   </div>

  </div>
 </main>
</div>
<div id="toast"></div>
<script>
${NAV_JS}
function H(){var h={"content-type":"application/json"};var s=localStorage.getItem("sessao");if(s){h["authorization"]="Bearer "+s;}return h;}
function toast(m,t){var c=document.getElementById("toast");var d=document.createElement("div");d.className="tmsg"+(t?(" "+t):"");d.textContent=m;c.appendChild(d);requestAnimationFrame(function(){d.classList.add("show");});setTimeout(function(){d.classList.remove("show");setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},300);},5000);}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c];});}
function val(id){var e=document.getElementById(id);return e?e.value:"";}
function setV(id,v){var e=document.getElementById(id);if(e&&v!==undefined&&v!==null)e.value=v;}
function hex2rgb(h){h=String(h||"").replace("#","");if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];var n=parseInt(h,16);return [(n>>16)&255,(n>>8)&255,n&255];}
function rgb2hex(a){if(!a||a.length<3)return "#989ca2";function p(x){return ("0"+(x|0).toString(16)).slice(-2);}return "#"+p(a[0])+p(a[1])+p(a[2]);}
function metodo(m){
 document.querySelectorAll(".t2").forEach(function(a){a.classList.toggle("on",a.getAttribute("data-m")===m);});
 document.getElementById("m-local").classList.toggle("hide",m!=="local");
 document.getElementById("m-nano").classList.toggle("hide",m!=="nano");
 document.getElementById("prompts-nano").classList.toggle("hide",m!=="nano");
 document.getElementById("motor-card").classList.toggle("hide",m!=="nano");
}
function cfgLocal(){return {cinza:hex2rgb(val("aj-cor")),blur:Number(val("aj-blur")||1.0),modo:val("aj-modo"),ombro:Number(val("aj-ombro")),cab_y:Number(val("aj-caby")),tarja_modo:val("aj-tarja"),pal_x:Number(val("aj-palx")),x0:Number(val("aj-x0")),x1:Number(val("aj-x1")),nome_y0:Number(val("aj-n0")),nome_y1:Number(val("aj-n1")),pos_y0:Number(val("aj-p0")),pos_y1:Number(val("aj-p1"))};}
function carregarAjustes(L){if(!L)return;setV("aj-cor",rgb2hex(L.cinza));setV("aj-blur",L.blur);setV("aj-modo",L.modo);setV("aj-ombro",L.ombro);setV("aj-caby",L.cab_y);setV("aj-tarja",L.tarja_modo);setV("aj-palx",L.pal_x);setV("aj-x0",L.x0);setV("aj-x1",L.x1);setV("aj-n0",L.nome_y0);setV("aj-n1",L.nome_y1);setV("aj-p0",L.pos_y0);setV("aj-p1",L.pos_y1);}
async function init(){
 var c=document.getElementById("conn");
 var r=await fetch(_b()+"/admin/criador-fig/prompts",{headers:H()});
 if(!r.ok){c.textContent="faca login no /admin";c.style.color="#e23744";return;}
 c.textContent="conectado";c.style.color="#1faa59";
 var d=await r.json();
 document.getElementById("p-base").value=d.base||"";
 document.getElementById("p-jog").value=d.jogador||"";
 carregarAjustes(d.local);
 var mo=document.getElementById("motor");
 if(d.motor){mo.className="motor";mo.textContent=d.motor.provedor+" / "+d.motor.modelo+(d.motor.em_uso?" (EM USO)":" (NAO em uso)");}
 else{mo.className="motor no";mo.textContent="nenhum motor de imagem configurado (so afeta o metodo pago)";}
 var t=await (await fetch(_b()+"/admin/criador-fig/times",{headers:H()})).json();
 document.getElementById("time").innerHTML=(t.times||[]).map(function(x){return '<option>'+esc(x)+'</option>';}).join("");
 metodo("local");
 carregarTiles();
}
async function carregarTiles(){
 var t=document.getElementById("time").value;var sel=document.getElementById("ref");
 if(!t){sel.innerHTML="";return;}
 var d=await (await fetch(_b()+"/admin/criador-fig/tiles?time="+encodeURIComponent(t),{headers:H()})).json();
 sel.innerHTML=(d.tiles||[]).map(function(x){
  var lab=x.file+(x.tipo?(" ["+x.tipo+"]"):"")+(x.nome?(" - "+x.nome):"");
  return '<option value="'+esc(x.file)+'"'+(x.file===d.ref?" selected":"")+'>'+esc(lab)+'</option>';
 }).join("");
 mostrarRef();
}
function mostrarRef(){
 var t=document.getElementById("time").value;var f=document.getElementById("ref").value||"08.png";
 document.getElementById("ref-wrap").innerHTML=t?('<img src="'+_b()+'/fig/raw/'+encodeURIComponent(t)+'/'+encodeURIComponent(f)+'" onerror="this.style.opacity=.2">'):'';
 document.getElementById("ref-cap").textContent="Referencia ("+f+")";
}
async function salvarPrompts(){
 var r=await fetch(_b()+"/admin/criador-fig/prompts",{method:"POST",headers:H(),body:JSON.stringify({base:document.getElementById("p-base").value,jogador:document.getElementById("p-jog").value})});
 toast(r.ok?"Prompts salvos":"erro ao salvar",r.ok?"ok":"err");
}
async function salvarAjustes(){
 var r=await fetch(_b()+"/admin/criador-fig/prompts",{method:"POST",headers:H(),body:JSON.stringify({local:cfgLocal()})});
 toast(r.ok?"Ajustes salvos como padrao":"erro ao salvar",r.ok?"ok":"err");
}
async function gerar(metodo){
 var t=document.getElementById("time").value;if(!t){toast("Escolha a selecao","err");return;}
 var f=document.getElementById("ref").value;
 var pago=(metodo==="nano");
 var btn=document.getElementById(pago?"btn-nano":"btn-local");var gb=document.getElementById(pago?"gb-nano":"gb-local");
 btn.disabled=true;var orig=btn.textContent;btn.textContent="Gerando...";gb.classList.add("show");
 document.getElementById("out-shot").classList.add("work");
 document.getElementById("out-cap").textContent=pago?"Resultado nano banana (pago)":"Resultado local (gratis)";
 document.getElementById("out-wrap").innerHTML='<div class="loading"><div class="spin"></div><div class="tt">'+(pago?"nano banana gerando...":"biblioteca processando...")+'</div><div class="ss">'+(pago?"alguns segundos":"deterministico")+'</div></div>';
 toast((pago?"Gerando (pago) ":"Gerando (gratis) ")+t+"...","ok");
 try{
  var ep=pago?"/admin/criador-fig/base":"/admin/criador-fig/local";
  var corpo={time:t,ref:f};if(!pago)corpo.cfg=cfgLocal();
  var r=await fetch(_b()+ep,{method:"POST",headers:H(),body:JSON.stringify(corpo)});
  var j=await r.json().catch(function(){return {};});
  if(!j.ok){toast("Falhou: "+(j.erro||"erro"),"err");document.getElementById("out-wrap").innerHTML='<div class="loading" style="background:#fdeef0"><div class="tt" style="color:#c01f2e">falhou</div><div class="ss">'+esc(j.erro||"")+'</div></div>';}
  else{document.getElementById("out-wrap").innerHTML='<img src="'+_b()+j.url+'">';toast("Pronto! Base "+(pago?"(pago)":"(gratis)")+" com ref "+j.ref+".","ok");}
 }catch(e){toast("Erro: "+e,"err");}
 btn.disabled=false;btn.textContent=orig;gb.classList.remove("show");document.getElementById("out-shot").classList.remove("work");
}
init();
</script></body></html>`;
