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

   <section id="pg-integ" class="sec hide">
    <h2>Integra&ccedil;&otilde;es / Crons</h2>

    <div class="card">
     <h3>&#128260; Sincroniza&ccedil;&atilde;o autom&aacute;tica (cron interno)</h3>
     <div class="muted">S&oacute; o servidor puxa das APIs e grava no banco. Os jogadores <b>s&oacute; leem do banco</b> &mdash; nunca chamam API direto, ent&atilde;o nunca estoura o teto.</div>
     <div id="integ-live" class="muted" style="margin-top:12px">conecte (token/login) para carregar o estado...</div>
     <div class="save"><button class="sm" onclick="forcarRefresh()">&#9889; For&ccedil;ar atualiza&ccedil;&atilde;o agora</button><span id="integ-msg" class="muted"></span></div>
    </div>

    <div class="card" style="margin-top:14px">
     <h3>&#9200; Agenda dos jobs</h3>
     <table><thead><tr><th>Job</th><th>Quando</th><th>O que faz</th><th>Status</th></tr></thead><tbody>
      <tr><td>Refresh di&aacute;rio</td><td>No boot + 1&times;/dia</td><td>Puxa odds 1X2 + escala&ccedil;&otilde;es do 365scores &rarr; banco</td><td><span class="pill ok">ativo</span></td></tr>
      <tr><td>Cron 01 &mdash; Resumo IA</td><td>Madrugada</td><td>Resumo de 3 linhas do jogo do dia seguinte</td><td><span class="pill no">a fazer</span></td></tr>
      <tr><td>Cron 02 &mdash; Trava no apito</td><td>30 min antes</td><td>Trava palpites/apostas no in&iacute;cio do jogo</td><td><span class="pill no">a fazer</span></td></tr>
      <tr><td>Cron 03 &mdash; Resultado real + pontua&ccedil;&atilde;o</td><td>Ap&oacute;s cada jogo (di&aacute;rio)</td><td>Grava o placar REAL e roda a r&eacute;gua/tabela de pontos &rarr; ranking</td><td><span class="pill no">a fazer</span></td></tr>
      <tr><td>Cron 04 &mdash; Palpites de longo prazo</td><td>19/jul (final)</td><td>Campe&atilde;o, vice, artilheiro &rarr; ranking</td><td><span class="pill no">a fazer</span></td></tr>
     </tbody></table>
    </div>

    <div class="card" style="margin-top:14px">
     <h3>&#128197; Calend&aacute;rio da Copa 2026 (EUA &middot; Canad&aacute; &middot; M&eacute;xico)</h3>
     <table><tbody>
      <tr><th>Abertura</th><td>11/jun/2026</td></tr>
      <tr><th>Fase de grupos</th><td>11&ndash;28/jun &middot; 12 grupos &middot; 72 jogos &middot; 3 rodadas</td></tr>
      <tr><th>Mata-mata (32 &rarr; final)</th><td>28/jun &rarr; 19/jul</td></tr>
      <tr><th>Final</th><td>19/jul/2026</td></tr>
      <tr><th>Congelamento</th><td>Fim dos grupos: Marketplace fecha e saldo congela</td></tr>
     </tbody></table>
    </div>

    <div class="card" style="margin-top:14px">
     <h3>&#127919; Tabela de pontos (b&oacute;l&atilde;o)</h3>
     <div class="muted">Quanto cada palpite vale ao comparar com o resultado real. Edit&aacute;vel em <code>config.pontos_regra</code>.</div>
     <table style="margin-top:8px"><thead><tr><th>Acerto</th><th>Pontos</th></tr></thead><tbody id="pontos-tb">
      <tr><td>Placar exato (cravou)</td><td><b id="pt-exato">10</b></td></tr>
      <tr><td>Vencedor + saldo de gols</td><td><b id="pt-vsaldo">7</b></td></tr>
      <tr><td>S&oacute; o vencedor / empate</td><td><b id="pt-venc">5</b></td></tr>
      <tr><td>Gols certos de um time (b&ocirc;nus)</td><td><b id="pt-gol">1</b></td></tr>
     </tbody></table>
    </div>

    <div class="card" style="margin-top:14px">
     <h3>&#127922; Regra do palpite autom&aacute;tico (1 clique, gr&aacute;tis)</h3>
     <div class="muted">Preenche o placar pela l&oacute;gica das odds; sem odds, usa ranking FIFA.</div>
     <table style="margin-top:8px"><thead><tr><th>Odd do favorito</th><th>Placar sugerido</th></tr></thead><tbody>
      <tr><td>&le; 1.30 (favorita&ccedil;o)</td><td>3 &times; 0</td></tr>
      <tr><td>1.31 &ndash; 1.70 (forte)</td><td>2 &times; 0</td></tr>
      <tr><td>1.71 &ndash; 2.40 (moderado)</td><td>2 &times; 1</td></tr>
      <tr><td>&gt; 2.40 (magro)</td><td>1 &times; 0</td></tr>
      <tr><td>Empate prov&aacute;vel / odds parelhas</td><td>1 &times; 1 (ou 0 &times; 0 muito truncado)</td></tr>
      <tr><td>Sem odds</td><td>Ranking FIFA</td></tr>
     </tbody></table>
    </div>

    <div class="card" style="margin-top:14px">
     <h3>&#128268; Fontes de dados</h3>
     <table><thead><tr><th>Fonte</th><th>Usa pra</th><th>Custo</th></tr></thead><tbody>
      <tr><td>365scores</td><td>Odds 1X2 + escala&ccedil;&atilde;o prov&aacute;vel + stats</td><td><span class="pill ok">gr&aacute;tis</span></td></tr>
      <tr><td>ESPN</td><td>Not&iacute;cias das sele&ccedil;&otilde;es</td><td><span class="pill ok">gr&aacute;tis</span></td></tr>
      <tr><td>StatsBomb</td><td>Desempenho na Copa 2022</td><td><span class="pill ok">gr&aacute;tis</span></td></tr>
      <tr><td>football-data.org</td><td>Jogos, elencos, classifica&ccedil;&atilde;o</td><td><span class="pill ok">gr&aacute;tis</span></td></tr>
     </tbody></table>
    </div>

    <div class="card" style="margin-top:14px">
     <h3>&#128202; R&eacute;gua de notas (fantasy / Arena)</h3>
     <table><tbody>
      <tr><th>Gol</th><td>+8.0</td><th>Assist&ecirc;ncia</th><td>+5.0</td></tr>
      <tr><th>Desarme</th><td>+1.5</td><th>Defesa dif&iacute;cil (GK)</th><td>+3.0</td></tr>
      <tr><th>P&ecirc;nalti defendido</th><td>+7.0</td><th>Cart&atilde;o amarelo</th><td>&minus;2.0</td></tr>
      <tr><th>Cart&atilde;o vermelho</th><td>&minus;5.0</td><th></th><td></td></tr>
     </tbody></table>
    </div>

    <div class="card" style="margin-top:14px">
     <h3>&#129689; Tokenomics</h3>
     <table><tbody>
      <tr><th>Saldo inicial</th><td>500 (Colecionador 200 &middot; Apostas 200 &middot; Arena 100)</td></tr>
      <tr><th>Recarga por rodada</th><td>+50 (Colecionador +20 &middot; Apostas +20 &middot; Arena +10)</td></tr>
      <tr><th>Venda de "bagre"</th><td>5 tokens por figurinha duplicada/baixa</td></tr>
     </tbody></table>
    </div>
   </section>

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
 if(pg==="integ")loadInteg();
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
async function loadInteg(){
 var b=document.getElementById("integ-live");if(!b)return;b.textContent="carregando...";
 var r=await fetch(BASE+"/admin/integracoes",{headers:H()});
 if(!r.ok){b.textContent="conecte (token/login) para ver o estado.";return;}
 var d=await r.json();var c=d.contagem||{};var lu=d.lineups||{};var p=d.pontos||{};
 if(p.exato!=null)document.getElementById("pt-exato").textContent=p.exato;
 if(p.vencedor_saldo!=null)document.getElementById("pt-vsaldo").textContent=p.vencedor_saldo;
 if(p.vencedor!=null)document.getElementById("pt-venc").textContent=p.vencedor;
 if(p.gol_time!=null)document.getElementById("pt-gol").textContent=p.gol_time;
 b.innerHTML='<table><tbody>'
  +'<tr><th>&Uacute;ltimo refresh di&aacute;rio</th><td><b>'+esc(d.ultimo_refresh||"\u2014")+'</b></td></tr>'
  +'<tr><th>Jogos com odds</th><td>'+(c.com_odds||0)+' de '+(c.com_times||0)+'</td></tr>'
  +'<tr><th>Jogos com escala&ccedil;&atilde;o</th><td>'+(c.com_lineup||0)+'</td></tr>'
  +'<tr><th>Jogos com palpite preenchido</th><td>'+(c.com_palpite||0)+'</td></tr>'
  +'<tr><th>&Uacute;ltima sincroniza&ccedil;&atilde;o de escala&ccedil;&otilde;es</th><td>'+esc(String(lu.em||"").replace("T"," ").slice(0,16))+'</td></tr>'
  +'</tbody></table>';
}
async function forcarRefresh(){
 var m=document.getElementById("integ-msg");if(m)m.textContent="atualizando odds + escala&ccedil;&otilde;es (pode levar ~30s)...";
 try{var r=await fetch(BASE+"/admin/scores365/refresh",{method:"POST",headers:H()});await r.json().catch(function(){});if(m)m.textContent="pronto.";}catch(e){if(m)m.textContent="falhou.";}
 loadInteg();
}
if(localStorage.getItem("sessao")){conectar();}
(function(){var q=new URLSearchParams(location.search).get("pg");if(q&&document.getElementById("pg-"+q))nav(q);})();
</script></body></html>`;
