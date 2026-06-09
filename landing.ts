import type { FastifyInstance } from "fastify";

export async function rotasLanding(app: FastifyInstance) {
  app.get("/", async (_req, reply) => reply.type("text/html").send(LANDING));
}

const LANDING = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bolao da Copa 26</title>
<script src="https://accounts.google.com/gsi/client" async defer></script>
<style>
:root{--pri:#4361ee;--card:#fff;--tx:#1f2430;--mut:#7a8194;--bd:#e6e8f0;}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;color:var(--tx);background:linear-gradient(135deg,#0e1430,#27347a);min-height:100vh}
.nav{display:flex;align-items:center;justify-content:space-between;padding:16px 28px;color:#fff}
.nav .brand{font-weight:800;font-size:18px}
.nav a{color:#cdd6ff;text-decoration:none;font-weight:600;font-size:14px}
.hero{max-width:1000px;margin:0 auto;padding:40px 24px;display:grid;grid-template-columns:1.1fr .9fr;gap:32px;align-items:center}
.hero h1{color:#fff;font-size:34px;line-height:1.15;margin:0 0 12px}
.hero p{color:#c7d0f5;font-size:16px}
.card{background:var(--card);border-radius:16px;padding:22px;box-shadow:0 18px 50px rgba(0,0,0,.35)}
.tabs{display:flex;gap:8px;margin-bottom:14px}
.tabs button{flex:1;background:#eef1fb;color:var(--pri);border:0;border-radius:9px;padding:9px;font-weight:700;cursor:pointer}
.tabs button.on{background:var(--pri);color:#fff}
label{display:block;font-size:13px;color:var(--mut);margin:10px 0 4px;font-weight:600}
input{width:100%;border:1px solid var(--bd);border-radius:9px;padding:11px;font-size:14px}
.go{width:100%;margin-top:16px;background:var(--pri);color:#fff;border:0;border-radius:10px;padding:12px;font-weight:800;cursor:pointer;font-size:15px}
.msg{margin-top:10px;font-size:13px;min-height:18px}
.err{color:#e23744}.ok{color:#1faa59}
.ou{text-align:center;color:var(--mut);font-size:12px;margin:14px 0 8px}
.gwrap{display:flex;justify-content:center}
@media(max-width:780px){.hero{grid-template-columns:1fr}}
</style></head><body>
<div class="nav"><div class="brand">&#9917; Bolao da Copa 26</div><a href="#entrar">Entrar</a></div>
<div class="hero">
 <div>
  <h1>Palpite, escale seu time e dispute o ranking da Copa 2026.</h1>
  <p>Bolao, figurinhas e batalhas com a sua moeda virtual. Cadastre-se gr&aacute;tis e ganhe 500 Tokens de boas-vindas.</p>
 </div>
 <div class="card" id="entrar">
  <div class="tabs"><button id="tb-login" class="on" onclick="aba('login')">Entrar</button><button id="tb-cad" onclick="aba('cad')">Cadastrar</button></div>
  <div id="f-login">
   <label>E-mail</label><input id="l-email" type="email" autocomplete="email">
   <label>Senha</label><input id="l-senha" type="password" autocomplete="current-password">
   <button class="go" onclick="entrar()">Entrar</button>
   <div id="l-msg" class="msg"></div>
  </div>
  <div id="f-cad" style="display:none">
   <label>Nome</label><input id="c-nome">
   <label>E-mail</label><input id="c-email" type="email">
   <label>Senha</label><input id="c-senha" type="password">
   <button class="go" onclick="cadastrar()">Criar conta</button>
   <div id="c-msg" class="msg"></div>
  </div>
  <div class="ou">ou</div>
  <div id="g-wrap" class="gwrap"></div>
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
 if(!GCID)return;
 var n=0;var t=setInterval(function(){
  n++;
  if(window.google&&google.accounts&&google.accounts.id){
   clearInterval(t);
   google.accounts.id.initialize({client_id:GCID,callback:gcb});
   google.accounts.id.renderButton(document.getElementById("g-wrap"),{theme:"outline",size:"large",width:300,text:"continue_with"});
  }else if(n>50){clearInterval(t);}
 },200);
}
window.addEventListener("load",initGoogle);
</script></body></html>`;
