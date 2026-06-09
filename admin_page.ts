import { NAV_CSS, sideHtml, NAV_JS } from "./ui.js";

export const PAGINA = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bolao da Copa 26 - Admin</title>
<style>
:root{--pri:#4361ee;--bg:#f3f4f8;--card:#fff;--tx:#1f2430;--mut:#7a8194;--bd:#e6e8f0;--ok:#1faa59;--no:#e23744;}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx)}
.app{display:flex;min-height:100vh}
.main{flex:1;min-width:0}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 24px;background:var(--card);border-bottom:1px solid var(--bd);position:sticky;top:0;z-index:5}
.top h2{margin:0;font-size:18px}
.tokrow{display:flex;gap:8px;align-items:center}
.content{padding:24px;max-width:1040px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
.card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:18px;box-shadow:0 1px 2px rgba(20,30,60,.04)}
.card h3{margin:0 0 4px;font-size:14px}
.stat{font-size:22px;font-weight:800;margin-top:6px}
label{display:block;font-size:13px;color:var(--mut);margin:12px 0 4px;font-weight:600}
input,select,textarea{background:#fff;border:1px solid var(--bd);color:var(--tx);border-radius:9px;padding:10px;font-size:14px}
input,textarea{width:100%}
button{background:var(--pri);color:#fff;border:0;border-radius:9px;padding:10px 16px;font-weight:700;cursor:pointer}
button.ghost{background:#eef1fb;color:var(--pri)}
button.sm{padding:6px 11px;font-size:12px}
.pill{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700}
.pill.ok{background:#e4f6ec;color:var(--ok)}.pill.no{background:#fde8ea;color:var(--no)}
.muted{color:var(--mut);font-size:13px}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--bd)}th{color:var(--mut);font-weight:700}
.hide{display:none}.sec h2{font-size:18px;margin:0 0 14px}
.soon{padding:40px;text-align:center;color:var(--mut)}
.save{margin-top:12px;display:flex;align-items:center;gap:10px}
${NAV_CSS}
</style></head><body>
<div class="app">
 ${sideHtml("dash")}
 <main class="main">
  <div class="top">
   <h2 id="ttl">Dashboard</h2>
   <div class="tokrow">
    <input id="tok" type="password" placeholder="token de admin (ou faca login)" style="width:200px">
    <button class="sm" onclick="conectar()">Conectar</button>
    <span id="conn" class="pill no">offline</span>
   </div>
  </div>
  <div class="content">

   <section id="pg-dash" class="sec">
    <h2>Vis&atilde;o geral</h2>
    <div class="grid">
     <div class="card"><h3>Banco de dados</h3><div class="stat"><span id="d-db" class="pill no">?</span></div><div class="muted">bolao_copa26</div><div class="save"><button class="sm ghost" onclick="ping('db','d-db','pd-db')">Ping</button><span id="pd-db" class="muted"></span></div></div>
     <div class="card"><h3>Fonte de jogos</h3><div class="stat"><span id="d-af" class="pill no">?</span></div><div class="muted">football-data.org</div><div class="save"><button class="sm ghost" onclick="ping('jogos','d-af','pd-af')">Ping</button><span id="pd-af" class="muted"></span></div></div>
     <div class="card"><h3>The-Odds-API</h3><div class="stat"><span id="d-od" class="pill no">?</span></div><div class="muted">odds dos confrontos</div><div class="save"><button class="sm ghost" onclick="ping('odds','d-od','pd-od')">Ping</button><span id="pd-od" class="muted"></span></div></div>
     <div class="card"><h3>Criador de Figurinhas</h3><div class="muted" style="margin-top:8px">Gera a base silhueta por selecao (nano banana)</div><div class="save"><button class="sm" onclick="go('/admin/criador-fig')">Abrir</button></div></div>
     <div class="card"><h3>Tokenomics</h3><div class="muted" style="margin-top:8px">Economia do jogo: dinheiro real, tokens e custos de IA</div><div class="save"><button class="sm" onclick="go('/admin/tokenomics')">Abrir</button></div></div>
     <div class="card"><h3>Configuracoes</h3><div class="muted" style="margin-top:8px">APIs, LLMs, Custos, Motor de Imagem, Cortes e Banco</div><div class="save"><button class="sm" onclick="go('/admin/config-hub')">Abrir hub</button></div></div>
    </div>
   </section>

   <section id="pg-jogos" class="sec hide">
    <h2>Jogos / Rodadas</h2>
    <div class="card">
     <div class="muted">Puxa todos os jogos da Copa 2026 (1 chamada) e grava no banco.</div>
     <div style="margin-top:10px"><button onclick="importarJogos()">Importar jogos da Copa</button> <span id="imp-msg" class="muted"></span></div>
     <div id="jogos-box" style="margin-top:14px" class="muted">conecte e clique para listar.</div>
    </div>
   </section>

   <section id="pg-users" class="sec hide"><h2>Usu&aacute;rios &amp; Carteiras</h2><div class="card"><div id="users-box" class="muted">conecte para carregar.</div></div></section>

   <section id="pg-rank" class="sec hide"><h2>Ranking</h2><div class="card"><div id="rank-box" class="muted">conecte para carregar.</div></div></section>

   <section id="pg-integ" class="sec hide"><h2>Integra&ccedil;&otilde;es / Crons</h2><div class="card soon">Em breve.</div></section>

  </div>
 </main>
</div>
<script>
${NAV_JS}
var BASE=_b();
var TITLES={dash:"Dashboard",jogos:"Jogos / Rodadas",users:"Usuarios & Carteiras",rank:"Ranking",integ:"Integracoes / Crons"};
function nav(pg){
 document.querySelectorAll(".sec").forEach(function(s){s.classList.add("hide")});
 var el=document.getElementById("pg-"+pg);if(el)el.classList.remove("hide");
 document.getElementById("ttl").textContent=TITLES[pg]||"Admin";
 if(pg==="users")loadUsers();
 if(pg==="rank")loadRank();
 if(pg==="jogos")loadJogos();
}
function tok(){return document.getElementById("tok").value.trim();}
function H(){var t=tok();var h={"content-type":"application/json"};if(t){h["x-admin-token"]=t;}else{var s=localStorage.getItem("sessao");if(s){h["authorization"]="Bearer "+s;}}return h;}
function setp(id,on){var e=document.getElementById(id);e.textContent=on?"online":"offline";e.className="pill "+(on?"ok":"no");}
function esc(v){return String(v==null?"":v).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];});}
function tabela(rows,keys,heads){
 if(!rows||!rows.length)return '<div class="muted">nenhum registro ainda.</div>';
 var h="<table><thead><tr>"+heads.map(function(x){return "<th>"+esc(x)+"</th>"}).join("")+"</tr></thead><tbody>";
 h+=rows.map(function(r){return "<tr>"+keys.map(function(k){return "<td>"+esc(r[k])+"</td>"}).join("")+"</tr>"}).join("");
 return h+"</tbody></table>";
}
async function conectar(){
 var r=await fetch(BASE+"/admin/config",{headers:H()});
 if(r.status===401){var e=document.getElementById("conn");e.textContent="login/token invalido";e.className="pill no";return;}
 setp("conn",true);document.getElementById("conn").textContent="conectado";
 var s=await (await fetch(BASE+"/admin/status",{headers:H()})).json();
 setp("d-db",s.db);setp("d-af",s.jogos_fonte);setp("d-od",s.odds_api);
}
async function ping(alvo,pillId,msgId){
 var m=document.getElementById(msgId);if(m)m.textContent="...";
 var r=await fetch(BASE+"/admin/ping?alvo="+alvo,{headers:H()});
 var j=await r.json();
 if(pillId)setp(pillId,!!j.ok);
 if(m)m.textContent=(j.ok?"OK ":"FALHOU ")+(j.detalhe||"");
}
async function importarJogos(){
 var m=document.getElementById("imp-msg");m.textContent="importando...";
 var r=await fetch(BASE+"/admin/jogos/importar",{method:"POST",headers:H()});
 var j=await r.json();
 m.textContent=r.ok?("ok: "+(j.importados||0)+" jogos"):("erro: "+(j.erro||""));
 loadJogos();
}
async function loadJogos(){
 var b=document.getElementById("jogos-box");b.textContent="carregando...";
 var r=await fetch(BASE+"/admin/jogos",{headers:H()});
 if(!r.ok){b.textContent="conecte para ver.";return;}
 b.innerHTML=tabela(await r.json(),["id","fase","rodada","casa","visit","inicio","status","pc","pv"],["ID","Fase","Rod","Casa","Visitante","Inicio","Status","C","V"]);
}
async function loadUsers(){
 var b=document.getElementById("users-box");b.textContent="carregando...";
 var r=await fetch(BASE+"/admin/usuarios",{headers:H()});
 if(!r.ok){b.textContent="conecte para ver.";return;}
 b.innerHTML=tabela(await r.json(),["id","email","nome","papel","col","apo","are"],["ID","E-mail","Nome","Papel","Colec.","Apostas","Arena"]);
}
async function loadRank(){
 var b=document.getElementById("rank-box");b.textContent="carregando...";
 var r=await fetch(BASE+"/admin/ranking",{headers:H()});
 if(!r.ok){b.textContent="conecte para ver.";return;}
 b.innerHTML=tabela(await r.json(),["nome","pb","pa"],["Jogador","Pts Bolao","Pts Arena"]);
}
if(localStorage.getItem("sessao")){conectar();}
(function(){var q=new URLSearchParams(location.search).get("pg");if(q&&document.getElementById("pg-"+q))nav(q);})();
</script></body></html>`;
