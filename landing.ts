import type { FastifyInstance } from "fastify";

export async function rotasLanding(app: FastifyInstance) {
  app.get("/", async (_req, reply) => reply.type("text/html").send(LANDING));
}

const LANDING = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bolão da Copa 26</title>
<script src="https://accounts.google.com/gsi/client" async defer></script>
<style>
:root{--pri:#1faa59;--pri2:#14794a;--gold:#f5c451;--tx:#eef1f6;--mut:#9aa6ba;--no:#ff5a6a;}
*{box-sizing:border-box}html,body{margin:0;min-height:100%}
body{font-family:system-ui,Segoe UI,Roboto,sans-serif;color:var(--tx);background:#070b18;min-height:100vh;overflow-x:hidden}
.bg{position:fixed;inset:0;z-index:0;overflow:hidden;background:radial-gradient(120% 120% at 50% -10%,#0b3d2e 0%,#0a1228 52%,#070b18 100%)}
.glow{position:absolute;border-radius:50%;filter:blur(70px);opacity:.55;mix-blend-mode:screen;animation:flo 13s ease-in-out infinite}
.g1{width:420px;height:420px;background:#1faa59;top:-90px;left:-70px}
.g2{width:460px;height:460px;background:#3b6fff;bottom:-140px;right:-90px;animation-delay:-4s}
.g3{width:320px;height:320px;background:var(--gold);top:38%;left:52%;opacity:.28;animation-delay:-8s}
@keyframes flo{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(34px,-30px) scale(1.12)}}
.sweep{position:absolute;inset:-60%;background:conic-gradient(from 0deg,transparent 0 78%,rgba(245,196,81,.07) 88%,transparent 100%);animation:spin 22s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.pitch{position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.028) 0 2px,transparent 2px 130px);animation:slide 26s linear infinite}
@keyframes slide{to{background-position:260px 0}}
.ball{position:absolute;bottom:-40px;opacity:.16;animation:rise linear infinite;user-select:none}
@keyframes rise{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(-115vh) rotate(420deg)}}
.shell{position:relative;z-index:2;display:flex;flex-direction:column;min-height:100vh}
.nav{display:flex;align-items:center;justify-content:space-between;padding:12px 30px;flex:none}
.brand{font-weight:800;font-size:18px;letter-spacing:.3px}
.brand b{color:var(--pri)}
.enter{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);color:#fff;font-weight:700;font-size:14px;padding:9px 20px;border-radius:999px;cursor:pointer;transition:.15s}
.enter:hover{background:var(--pri);border-color:var(--pri);transform:translateY(-1px)}
.cd{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.05);border:1px solid rgba(245,196,81,.3);border-radius:999px;padding:8px 16px}
.cdlab{font-size:12px;color:var(--mut);font-weight:700}
.cdval{font-weight:850;font-size:15px;color:var(--gold);font-variant-numeric:tabular-nums;letter-spacing:.5px;min-width:118px;text-align:right}
@media(max-width:560px){.cdlab{display:none}.cdval{min-width:0}}
.hero{max-width:1080px;width:100%;margin:0 auto;padding:0 24px 18px;display:grid;grid-template-columns:1.05fr .95fr;gap:40px;align-items:center;flex:1}
.badge{display:inline-flex;align-items:center;gap:7px;background:rgba(245,196,81,.12);color:var(--gold);border:1px solid rgba(245,196,81,.3);padding:6px 14px;border-radius:999px;font-size:12px;font-weight:800;letter-spacing:.4px}
.copy h1{font-size:36px;line-height:1.1;margin:12px 0 10px;font-weight:850;letter-spacing:-.5px}
.copy h1 .hl{background:linear-gradient(90deg,var(--pri),var(--gold));-webkit-background-clip:text;background-clip:text;color:transparent}
.copy p{color:#c4cfe4;font-size:15px;line-height:1.45;max-width:470px}
.feats{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;padding:0;list-style:none}
.feats li{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:8px 13px;font-size:13px;font-weight:600;color:#dbe3f2}
.card{position:relative;background:rgba(17,21,30,.72);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.09);border-radius:20px;padding:20px 22px;box-shadow:0 34px 80px rgba(0,0,0,.55)}
.card:before{content:"";position:absolute;top:0;left:24px;right:24px;height:3px;border-radius:0 0 4px 4px;background:linear-gradient(90deg,var(--pri),var(--gold))}
.tabs{display:flex;gap:6px;background:rgba(255,255,255,.05);padding:5px;border-radius:12px;margin-bottom:18px}
.tabs button{flex:1;background:transparent;color:var(--mut);border:0;border-radius:9px;padding:10px;font-weight:800;cursor:pointer;font-size:14px;transition:.15s}
.tabs button.on{background:var(--pri);color:#fff;box-shadow:0 6px 16px rgba(31,170,89,.35)}
label{display:block;font-size:12px;color:var(--mut);margin:9px 0 4px;font-weight:700;letter-spacing:.2px}
input{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#fff;border-radius:11px;padding:11px 13px;font-size:14px;outline:none;transition:.15s}
input::placeholder{color:#6b7790}
input:focus{border-color:var(--pri);background:rgba(255,255,255,.09);box-shadow:0 0 0 3px rgba(31,170,89,.18)}
.go{width:100%;margin-top:14px;background:linear-gradient(135deg,var(--pri),var(--pri2));color:#fff;border:0;border-radius:12px;padding:13px;font-weight:850;cursor:pointer;font-size:15px;box-shadow:0 10px 24px rgba(31,170,89,.32);transition:.15s}
.go:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(31,170,89,.42)}
.go:active{transform:translateY(0)}
.msg{margin-top:11px;font-size:13px;min-height:18px}
.err{color:var(--no)}.ok{color:var(--pri)}
.ou{display:flex;align-items:center;gap:12px;color:var(--mut);font-size:12px;margin:12px 0 8px}
.ou:before,.ou:after{content:"";flex:1;height:1px;background:rgba(255,255,255,.12)}
.gwrap{display:flex;justify-content:center;min-height:44px}
.gbtn{position:relative;width:fit-content;margin:0 auto;padding:3px;border-radius:999px;background:linear-gradient(90deg,#4285F4,#1faa59,#f5c451,#ea4335,#4285F4);background-size:300% 100%;animation:gsh 6s linear infinite;box-shadow:0 10px 28px rgba(66,133,244,.34);transition:transform .15s,box-shadow .15s}
.gbtn:hover{transform:translateY(-2px);box-shadow:0 16px 40px rgba(31,170,89,.45)}
.gbtn .gwrap{border-radius:999px;overflow:hidden;min-height:auto}
@keyframes gsh{to{background-position:300% 0}}
.fineprint{color:#6b7790;font-size:11px;text-align:center;margin-top:9px;line-height:1.45}
@media(max-width:820px){.shell{min-height:auto}.hero{grid-template-columns:1fr;gap:22px;padding-top:8px}.copy h1{font-size:30px}.nav{padding:12px 18px}}
</style></head><body>
<div class="bg">
 <div class="glow g1"></div><div class="glow g2"></div><div class="glow g3"></div>
 <div class="sweep"></div><div class="pitch"></div>
 <span class="ball" style="left:8%;font-size:30px;animation-duration:17s;animation-delay:-2s">&#9917;</span>
 <span class="ball" style="left:24%;font-size:20px;animation-duration:23s;animation-delay:-9s">&#9917;</span>
 <span class="ball" style="left:46%;font-size:26px;animation-duration:20s;animation-delay:-5s">&#9917;</span>
 <span class="ball" style="left:68%;font-size:18px;animation-duration:26s;animation-delay:-13s">&#9917;</span>
 <span class="ball" style="left:84%;font-size:34px;animation-duration:19s;animation-delay:-7s">&#9917;</span>
 <span class="ball" style="left:92%;font-size:22px;animation-duration:24s;animation-delay:-15s">&#127942;</span>
</div>
<div class="shell">
 <div class="nav">
  <div class="brand">&#9917; Bol&atilde;o da Copa <b>26</b></div>
  <div class="cd"><span class="cdlab">&#9201; A Copa come&ccedil;a em</span><span class="cdval" id="cdval">--</span></div>
 </div>
 <div class="hero">
  <div class="copy">
   <span class="badge">&#127942; COPA DO MUNDO 2026 &middot; EUA &middot; CAN &middot; MEX</span>
   <h1>Palpite, escale seu time e dispute o <span class="hl">ranking da Copa</span>.</h1>
   <p>Bol&atilde;o gr&aacute;tis, figurinhas colecion&aacute;veis e batalhas de times com a sua moeda virtual. Cadastre-se e ganhe <b>500 Tokens</b> de boas-vindas.</p>
   <ul class="feats">
    <li>&#9917; Bol&atilde;o sem risco</li>
    <li>&#127183; Figurinhas</li>
    <li>&#9876; Batalha de Times</li>
    <li>&#129689; 500 Tokens gr&aacute;tis</li>
   </ul>
  </div>
  <div class="card" id="entrar">
   <div class="tabs"><button id="tb-login" class="on" onclick="aba('login')">Entrar</button><button id="tb-cad" onclick="aba('cad')">Cadastrar</button></div>
   <div id="f-login">
    <label>E-mail</label><input id="l-email" type="email" autocomplete="email" placeholder="voce@email.com">
    <label>Senha</label><input id="l-senha" type="password" autocomplete="current-password" placeholder="sua senha">
    <button class="go" onclick="entrar()">Entrar</button>
    <div id="l-msg" class="msg"></div>
   </div>
   <div id="f-cad" style="display:none">
    <label>Nome</label><input id="c-nome" placeholder="Como te chamam">
    <label>E-mail</label><input id="c-email" type="email" placeholder="voce@email.com">
    <label>Senha</label><input id="c-senha" type="password" placeholder="crie uma senha">
    <button class="go" onclick="cadastrar()">Criar conta gr&aacute;tis</button>
    <div id="c-msg" class="msg"></div>
   </div>
   <div id="g-block"><div class="ou">ou</div><div class="gbtn"><div id="g-wrap" class="gwrap"></div></div></div>
   <div class="fineprint">Ambiente fechado &middot; moeda virtual sem valor monet&aacute;rio. Token n&atilde;o compr&aacute;vel, sem saque.</div>
  </div>
 </div>
</div>
<script>
var BASE=(function(){var p=location.pathname;if(p.length>1&&p.charAt(p.length-1)==="/")return p.slice(0,-1);return p;})();
var GCID="";
function aba(a){
 document.getElementById("f-login").style.display=a==="login"?"block":"none";
 document.getElementById("f-cad").style.display=a==="cad"?"block":"none";
 document.getElementById("tb-login").classList.toggle("on",a==="login");
 document.getElementById("tb-cad").classList.toggle("on",a==="cad");
}
function focoLogin(){aba("login");var e=document.getElementById("entrar");if(e)e.scrollIntoView({behavior:"smooth",block:"center"});var i=document.getElementById("l-email");if(i)setTimeout(function(){i.focus();},250);}
async function entrar(){
 var m=document.getElementById("l-msg");m.className="msg";m.textContent="entrando...";
 var r=await fetch(BASE+"/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:document.getElementById("l-email").value,senha:document.getElementById("l-senha").value})});
 var j=await r.json();
 if(!r.ok){m.className="msg err";m.textContent=j.erro||"falha";return;}
 entrou(j,m);
}
async function cadastrar(){
 var m=document.getElementById("c-msg");m.className="msg";m.textContent="criando...";
 var r=await fetch(BASE+"/usuarios",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({nome:document.getElementById("c-nome").value,email:document.getElementById("c-email").value,senha:document.getElementById("c-senha").value})});
 var j=await r.json();
 if(!r.ok){m.className="msg err";m.textContent=j.erro||"falha";return;}
 m.className="msg ok";m.textContent="Conta criada! Voce ganhou 500 Tokens. Agora e so entrar.";
 aba("login");
}
function entrou(j,m){
 localStorage.setItem("sessao",j.token);localStorage.setItem("papel",j.papel);
 if(j.papel==="admin"){location.href=BASE+"/admin";}
 else{location.href=BASE+"/jogar";}
}
async function gcb(resp){
 var m=document.getElementById("l-msg");m.className="msg";m.textContent="entrando com Google...";
 var r=await fetch(BASE+"/auth/google",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({credential:resp.credential})});
 var j=await r.json();
 if(!r.ok){m.className="msg err";m.textContent=j.erro||"falha no Google";return;}
 entrou(j,m);
}
async function initGoogle(){
 try{var r=await fetch(BASE+"/auth/google/clientid");var j=await r.json();GCID=j.clientId||"";}catch(e){}
 if(!GCID){var gb=document.getElementById("g-block");if(gb)gb.style.display="none";return;}
 var n=0;var t=setInterval(function(){
  n++;
  if(window.google&&google.accounts&&google.accounts.id){
   clearInterval(t);
   google.accounts.id.initialize({client_id:GCID,callback:gcb});
   google.accounts.id.renderButton(document.getElementById("g-wrap"),{theme:"outline",shape:"pill",size:"large",width:330,logo_alignment:"center",text:"continue_with"});
  }else if(n>50){clearInterval(t);}
 },200);
}
var ALVO=new Date("2026-06-11T16:00:00-03:00").getTime();
function z(n){return ("0"+n).slice(-2);}
function tickCd(){var el=document.getElementById("cdval");if(!el)return;var d=ALVO-Date.now();if(d<=0){el.textContent="AGORA! \u26bd";return;}var dia=Math.floor(d/86400000),h=Math.floor(d/3600000)%24,m=Math.floor(d/60000)%60,sg=Math.floor(d/1000)%60;el.textContent=dia+"d "+z(h)+"h "+z(m)+"m "+z(sg)+"s";}
setInterval(tickCd,1000);tickCd();
window.addEventListener("load",initGoogle);
</script></body></html>`;
