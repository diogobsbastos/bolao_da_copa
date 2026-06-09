import { NAV_CSS, sideHtml, NAV_JS } from "./ui.js";

export const PAGINA = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Configuracoes - Bolao da Copa 26</title>
<style>
:root{--pri:#4361ee;--bg:#f3f4f8;--card:#fff;--tx:#1f2430;--mut:#7a8194;--bd:#e6e8f0;--ok:#1faa59;--no:#e23744;}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx)}
.app{display:flex;min-height:100vh}
.main{flex:1;min-width:0}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 24px;background:var(--card);border-bottom:1px solid var(--bd);position:sticky;top:0;z-index:5}
.top h2{margin:0;font-size:18px}
.tabs{display:flex;gap:6px;flex-wrap:wrap;padding:14px 24px 0}
.tab{padding:9px 16px;border-radius:11px 11px 0 0;border:1px solid var(--bd);border-bottom:0;background:#eef1f6;color:var(--mut);font-weight:700;font-size:13px;cursor:pointer}
.tab.on{background:var(--card);color:var(--pri);box-shadow:0 -2px 0 var(--pri) inset}
.pad{padding:16px 24px 60px;max-width:1080px}
.card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:18px;margin-bottom:14px}
.cardhead{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.card h3{margin:0 0 4px;font-size:15px}
.sub{color:var(--mut);font-size:12px;margin-bottom:8px}
label{display:block;font-size:13px;color:var(--mut);margin:10px 0 4px;font-weight:600}
input,select,textarea{width:100%;background:#fff;border:1px solid var(--bd);color:var(--tx);border-radius:9px;padding:9px 10px;font-size:14px}
textarea{resize:vertical;font-family:ui-monospace,Consolas,monospace;font-size:12px}
.row{display:flex;gap:10px;flex-wrap:wrap}.row>*{flex:1;min-width:150px}
button{background:var(--pri);color:#fff;border:0;border-radius:9px;padding:9px 14px;font-weight:700;cursor:pointer;font-size:13px}
button.sm{padding:6px 11px;font-size:12px}
button.gh{background:#eef1fb;color:var(--pri)}button.dg{background:#fde8ea;color:var(--no)}button.gr{background:#e4f6ec;color:#14794a}
button.add{background:var(--no);color:#fff;white-space:nowrap}
button.cat{background:#1e50a2;color:#fff;white-space:nowrap}
button.full{width:100%;margin-top:6px}
.save{margin-top:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.muted{color:var(--mut);font-size:13px}
.prov{border:1px solid var(--bd);border-radius:12px;padding:12px 14px;margin-bottom:10px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.prov.uso{border-color:#9ec9b0;background:#f3fbf6}
.pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700}
.pill.uso{background:#e4f6ec;color:#14794a}.pill.local{background:#eef1fb;color:#4361ee}.pill.cloud{background:#e7f0ff;color:#1e50a2}.pill.ativo{background:#fff2d6;color:#9a6b00}.pill.img{background:#f0e7ff;color:#6a3bd0}
.pinfo{flex:1;min-width:180px}.pinfo b{font-size:14px}.pinfo .m{font-size:12px;color:var(--mut);font-family:ui-monospace,monospace}
.pacts{display:flex;gap:6px;flex-wrap:wrap}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{text-align:left;padding:7px 8px;border-bottom:1px solid var(--bd)}th{color:var(--mut);font-weight:700;font-size:12px}
td.num,th.num{text-align:right}
table input{padding:6px 7px;font-size:13px;text-align:right}
.dolarbox{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.dolarbig{font-size:30px;font-weight:800}
#toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:60;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none}
.tmsg{background:#1f2430;color:#fff;padding:11px 18px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.28);opacity:0;transform:translateY(12px);transition:.25s}
.tmsg.show{opacity:1;transform:translateY(0)}.tmsg.ok{background:#14794a}.tmsg.err{background:#c01f2e}
.hide{display:none}
${NAV_CSS}
</style></head><body>
<div class="app">
 ${sideHtml("config")}
 <main class="main">
  <div class="top"><h2>&#9881;&#65039; Configuracoes do jogo</h2><span id="conn" class="muted">conectando...</span></div>
  <div class="tabs">
   <div class="tab on" data-t="apis" onclick="aba('apis')">&#128268; APIs</div>
   <div class="tab" data-t="llms" onclick="aba('llms')">&#129504; LLMs (IA)</div>
   <div class="tab" data-t="custos" onclick="aba('custos')">&#128178; Custos / LLM</div>
   <div class="tab" data-t="img" onclick="aba('img')">&#127912; Motor de Imagem</div>
   <div class="tab" data-t="cortes" onclick="aba('cortes')">&#9986;&#65039; Cortes</div>
   <div class="tab" data-t="banco" onclick="aba('banco')">&#128190; Banco</div>
  </div>
  <div class="pad">

   <section id="pg-apis">
    <div class="card"><div class="cardhead"><div><h3>&#9917; Jogos / Classificacao &mdash; football-data.org <span class="pill uso">EM USO</span></h3>
      <div class="sub">Importa jogos, elencos e calcula a classificacao da Copa. Plano free.</div></div>
      <a style="text-decoration:none;background:#eef1fb;color:#4361ee;padding:7px 12px;border-radius:9px;font-size:12px;font-weight:700;white-space:nowrap;align-self:flex-start" href="https://www.football-data.org/" target="_blank">Ir ao site &#8599;</a></div>
     <label>Token</label><input id="football_data_token" placeholder="(em branco mantem)">
     <div class="save"><button class="sm" onclick="salvar(['football_data_token'])">Salvar</button><button class="sm gh" onclick="pingJogos()">&#128268; Testar</button><span id="m-jogos" class="muted"></span></div></div>
    <div class="card"><div class="cardhead"><div><h3>&#128202; Odds &amp; dados ao vivo &mdash; 365scores <span class="pill local">sem chave</span></h3>
      <div class="sub">Odds 1X2 de mercado por jogo (a Copa ja tem odds aqui). API publica, sem chave. Exibida como "mercado (365scores)". Em breve: escalacao/stats.</div></div>
      <a style="text-decoration:none;background:#eef1fb;color:#4361ee;padding:7px 12px;border-radius:9px;font-size:12px;font-weight:700;white-space:nowrap;align-self:flex-start" href="https://www.365scores.com/pt-br/football" target="_blank">Ir ao site &#8599;</a></div>
     <div class="save"><button class="sm gh" onclick="pingS365()">&#128268; Testar</button><span id="m-s365" class="muted"></span></div></div>
    <div class="card"><div class="cardhead"><div><h3>&#128203; Dados por time &mdash; API-Football <span class="pill ativo">pago p/ 2026</span></h3>
      <div class="sub">Elenco, lesoes, forma, escalacao provavel e artilheiros por selecao. ATENCAO: o plano free so cobre 2022-2024 &mdash; a Copa 2026 exige plano PAGO.</div></div>
      <a style="text-decoration:none;background:#eef1fb;color:#4361ee;padding:7px 12px;border-radius:9px;font-size:12px;font-weight:700;white-space:nowrap;align-self:flex-start" href="https://dashboard.api-football.com/register" target="_blank">Criar chave gratis &#8599;</a></div>
     <label>API Key (x-apisports-key)</label><input id="api_football_key" placeholder="(em branco mantem)">
     <div class="save"><button class="sm" onclick="salvar(['api_football_key'])">Salvar</button><button class="sm gh" onclick="pingApiFb()">&#128268; Testar</button><span id="m-apifb" class="muted"></span></div></div>
    
<div class="card"><div class="cardhead"><div><h3>&#128240; Noticias das selecoes &mdash; NewsData.io <span class="pill local">a configurar</span></h3>
      <div class="sub">Manchetes recentes de cada selecao (lesao, fase, escalacao) que entram no palpite da IA e no botao Noticias dos jogos. Plano free 200/dia, suporta PT.</div></div>
      <a style="text-decoration:none;background:#eef1fb;color:#4361ee;padding:7px 12px;border-radius:9px;font-size:12px;font-weight:700;white-space:nowrap;align-self:flex-start" href="https://newsdata.io/register" target="_blank">Criar chave gratis &#8599;</a></div>
     <label>API Key</label><input id="newsdata_api_key" placeholder="(em branco mantem)">
     <div class="save"><button class="sm" onclick="salvar(['newsdata_api_key'])">Salvar</button><button class="sm gh" onclick="pingNews()">&#128268; Testar</button><span id="m-news" class="muted"></span></div></div>
    <div class="card"><div class="cardhead"><div><h3>&#128176; Odds &mdash; The-Odds-API <span class="pill uso">EM USO</span></h3>
      <div class="sub">Cotacoes 1/X/2 do mercado (usado no auto-preencher dos jogos). Plano free.</div></div>
      <a style="text-decoration:none;background:#eef1fb;color:#4361ee;padding:7px 12px;border-radius:9px;font-size:12px;font-weight:700;white-space:nowrap;align-self:flex-start" href="https://the-odds-api.com/" target="_blank">Ir ao site &#8599;</a></div>
     <label>Chave</label><input id="odds_api_key" placeholder="(em branco mantem)">
     <div class="save"><button class="sm" onclick="salvar(['odds_api_key'])">Salvar</button><button class="sm gh" onclick="pingOdds()">&#128268; Testar</button><span id="m-odds" class="muted"></span></div></div>
    <div class="card"><div class="cardhead"><div><h3>&#128274; Login com Google <span class="pill uso">EM USO</span></h3>
      <div class="sub">OAuth do login dos jogadores.</div></div>
      <a style="text-decoration:none;background:#eef1fb;color:#4361ee;padding:7px 12px;border-radius:9px;font-size:12px;font-weight:700;white-space:nowrap;align-self:flex-start" href="https://console.cloud.google.com/apis/credentials" target="_blank">Console &#8599;</a></div>
     <label>Google Client ID</label><input id="google_client_id" placeholder="...apps.googleusercontent.com">
     <div class="save"><button class="sm" onclick="salvar(['google_client_id'])">Salvar</button></div></div>
   </section>

   <section id="pg-llms" class="hide">
    <div class="card"><div class="cardhead"><div><h3>&#129504; Motores de IA (texto) &mdash; pool</h3>
     <div class="sub">Gemini, OpenAI, Groq, Anthropic ou locais (Ollama / vLLM / LM Studio). O <b>EM USO</b> e o que o jogo usa.</div></div>
     <button class="add" onclick="abrirForm('texto')">&#10133; Adicionar LLM</button></div>
     <div id="lista-texto"></div></div>
    <div id="wrap-texto" class="card hide"><div class="cardhead"><h3 id="ti-texto">Adicionar provedor</h3><button class="sm gh" onclick="fecharForm('texto')">fechar</button></div><div id="form-texto"></div></div>
   </section>

   <section id="pg-custos" class="hide">
    <div class="card"><h3>&#128181; Cotacao do dolar</h3>
     <div class="sub">Usada pra converter o custo das LLMs (US$) em reais. Atualize manual ou ao vivo.</div>
     <div class="dolarbox"><div><div class="dolarbig">R$ <span id="dolar-v">5,2000</span></div><div class="muted" id="dolar-em">&mdash;</div></div>
      <div style="flex:1;min-width:160px"><label>Definir manualmente (R$)</label><input id="dolar-in" type="number" step="0.0001" placeholder="5.20"></div>
      <div style="display:flex;gap:8px;align-self:flex-end"><button class="sm" onclick="salvarDolar()">Salvar</button><button class="sm gh" onclick="atualizarDolar()">&#128260; Atualizar ao vivo</button></div></div></div>

    <div class="card"><div class="cardhead"><div><h3>&#128172; Modelos de TEXTO &mdash; preco por 1M tokens (US$)</h3>
     <div class="sub"><b>Buscar precos</b> puxa do catalogo publico da LiteLLM. Modelos locais ficam 0 (auto-hospedados).</div></div>
     <button class="cat" onclick="buscarCatalogo()">&#128269; Buscar precos (LiteLLM)</button></div>
     <div style="overflow:auto"><table><thead><tr><th>Modelo</th><th>Provedor</th><th class="num">In US$/1M</th><th class="num">Out US$/1M</th><th class="num">Cache US$/1M</th><th></th></tr></thead><tbody id="texto-body"><tr><td colspan="6" class="muted">carregando...</td></tr></tbody></table></div></div>

    <div class="card"><div class="cardhead"><div><h3>&#128247; Modelos de IMAGEM &mdash; preco por imagem gerada (US$)</h3>
     <div class="sub">Imagem cobra <b>por imagem</b>, nao por token. Ex.: <b>gemini-2.5-flash-image</b> &asymp; US$ 0,039/img. O calculo do log multiplica esse valor pela qtd de imagens.</div></div></div>
     <div style="overflow:auto"><table><thead><tr><th>Modelo</th><th>Provedor</th><th class="num">US$ / imagem</th><th class="num">~R$ / imagem</th><th></th></tr></thead><tbody id="imagem-body"><tr><td colspan="5" class="muted">carregando...</td></tr></tbody></table></div></div>

    <div class="card"><div class="cardhead"><h3>&#10133; Adicionar modelo manual</h3><button class="sm gh" id="man-tog" onclick="togManual()">abrir</button></div>
     <div id="man-body" class="hide">
      <div class="row"><div><label>Modelo</label><input id="np-modelo" placeholder="gemini-3.1-flash-image"></div>
       <div><label>Provedor</label><input id="np-prov" placeholder="gemini"></div>
       <div style="max-width:110px"><label>In /1M</label><input id="np-in" type="number" step="0.0001" placeholder="0"></div>
       <div style="max-width:110px"><label>Out /1M</label><input id="np-out" type="number" step="0.0001" placeholder="0"></div>
       <div style="max-width:110px"><label>Cache /1M</label><input id="np-cache" type="number" step="0.0001" placeholder="0"></div>
       <div style="max-width:120px"><label>US$/imagem</label><input id="np-img" type="number" step="0.0001" placeholder="0"></div></div>
      <div class="save"><button class="sm" onclick="addPreco()">Adicionar</button></div></div></div>
   </section>

   <section id="pg-img" class="hide">
    <div class="card"><div class="cardhead"><div><h3>&#127912; Motor de Imagem</h3>
     <div class="sub">Separado do cerebro &mdash; gera os moldes das figurinhas personalizadas e artes.</div></div>
     <button class="add" onclick="abrirForm('imagem')">&#10133; Adicionar motor</button></div>
     <div id="lista-imagem"></div></div>
    <div id="wrap-imagem" class="card hide"><div class="cardhead"><h3 id="ti-imagem">Adicionar motor de imagem</h3><button class="sm gh" onclick="fecharForm('imagem')">fechar</button></div><div id="form-imagem"></div></div>
   </section>

   <section id="pg-cortes" class="hide">
    <div class="card"><h3>&#9986;&#65039; Padrao de corte das figurinhas</h3>
     <div class="sub">JSON reutilizavel. Usado pra recortar e pro molde das figurinhas personalizadas.</div>
     <label>JSON das coordenadas</label><textarea id="corte_grade" rows="12"></textarea>
     <div class="save"><button class="sm" onclick="salvarCorte()">Salvar</button><span id="m-corte" class="muted"></span></div></div>
   </section>

   <section id="pg-banco" class="hide">
    <div class="card"><h3>&#128190; Banco de dados</h3><div class="sub">Banco dedicado <b>bolao_copa26</b> no Postgres da VPS.</div>
     <div id="banco-info" class="muted">carregando...</div></div>
   </section>

  </div>
 </main>
</div>
<div id="toast"></div>
<script>
${NAV_JS}
var BASE=_b();
function H(){var h={"content-type":"application/json"};var s=localStorage.getItem("sessao");if(s){h["authorization"]="Bearer "+s;}return h;}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c];});}
function toast(m,t){var c=document.getElementById("toast");var d=document.createElement("div");d.className="tmsg"+(t?(" "+t):"");d.textContent=m;c.appendChild(d);requestAnimationFrame(function(){d.classList.add("show");});setTimeout(function(){d.classList.remove("show");setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},300);},3600);}
function val(id){var e=document.getElementById(id);return e?e.value:"";}
function N(v){return v==null||v===""?0:Number(v);}
function num(v,c){c=c==null?4:c;return N(v).toLocaleString("pt-BR",{minimumFractionDigits:c,maximumFractionDigits:c});}
var DOLAR=5.2;
function ehImg(m){return (m.papel==="imagem")||/image|imagen|nano[- ]?banana/i.test(m.modelo);}
function aba(t){document.querySelectorAll("section").forEach(function(s){s.classList.add("hide");});document.getElementById("pg-"+t).classList.remove("hide");document.querySelectorAll(".tab").forEach(function(a){a.classList.toggle("on",a.getAttribute("data-t")===t);});if(t==="banco")loadBanco();if(t==="llms")loadLLM("texto");if(t==="img")loadLLM("imagem");if(t==="custos")loadCustos();}
function togManual(){var b=document.getElementById("man-body");var oculto=b.classList.toggle("hide");document.getElementById("man-tog").textContent=oculto?"abrir":"fechar";}
async function init(){
 var r=await fetch(BASE+"/admin/config",{headers:H()});
 var c=document.getElementById("conn");
 if(!r.ok){c.textContent="faca login no /admin";c.style.color="#e23744";return;}
 c.textContent="conectado";c.style.color="#1faa59";
 var cfg=await r.json();
 ["google_client_id","corte_grade"].forEach(function(k){var e=document.getElementById(k);if(e&&cfg[k]!==undefined)e.value=cfg[k];});
}
async function salvar(keys){
 var body={};keys.forEach(function(k){var v=val(k);if(v)body[k]=v;});
 var r=await fetch(BASE+"/admin/config",{method:"POST",headers:H(),body:JSON.stringify(body)});
 toast(r.ok?"Salvo!":"Erro ao salvar",r.ok?"ok":"err");
 keys.forEach(function(k){var e=document.getElementById(k);if(e&&(""+e.placeholder).indexOf("mantem")>=0)e.value="";});
}
async function pingNews(){
 var m=document.getElementById("m-news");m.textContent="testando...";m.style.color="";
 var r=await fetch(BASE+"/admin/ping?alvo=noticias",{headers:H()});
 var j=await r.json().catch(function(){return{};});
 m.textContent=(j.ok?"OK ":"Falhou ")+(j.detalhe||"");m.style.color=j.ok?"#14794a":"#c01f2e";
 toast(j.ok?"NewsData respondeu":"NewsData falhou","err".replace("err",j.ok?"ok":"err"));
}
async function pingApiFb(){
 var m=document.getElementById("m-apifb");m.textContent="testando...";m.style.color="";
 var r=await fetch(BASE+"/admin/ping?alvo=apifootball",{headers:H()});
 var j=await r.json().catch(function(){return{};});
 m.textContent=(j.ok?"OK ":"Falhou ")+(j.detalhe||"");m.style.color=j.ok?"#14794a":"#c01f2e";
}
async function pingJogos(){
 var m=document.getElementById("m-jogos");m.textContent="testando...";m.style.color="";
 var r=await fetch(BASE+"/admin/ping?alvo=jogos",{headers:H()});
 var j=await r.json().catch(function(){return{};});
 m.textContent=(j.ok?"OK ":"Falhou ")+(j.detalhe||"");m.style.color=j.ok?"#14794a":"#c01f2e";
}
async function pingOdds(){
 var m=document.getElementById("m-odds");m.textContent="testando...";m.style.color="";
 var r=await fetch(BASE+"/admin/ping?alvo=odds",{headers:H()});
 var j=await r.json().catch(function(){return{};});
 m.textContent=(j.ok?"OK ":"Falhou ")+(j.detalhe||"");m.style.color=j.ok?"#14794a":"#c01f2e";
}
async function pingS365(){
 var m=document.getElementById("m-s365");m.textContent="testando...";m.style.color="";
 var r=await fetch(BASE+"/admin/scores365/ping",{headers:H()});
 var j=await r.json().catch(function(){return{};});
 m.textContent=(j.ok?"OK ":"Falhou ")+(j.detalhe||"");m.style.color=j.ok?"#14794a":"#c01f2e";
}
async function salvarCorte(){
 var v=(val("corte_grade")||"").trim();var m=document.getElementById("m-corte");
 if(v){try{JSON.parse(v);}catch(e){m.textContent="JSON invalido";m.style.color="#e23744";return;}}
 m.style.color="";var r=await fetch(BASE+"/admin/config",{method:"POST",headers:H(),body:JSON.stringify({corte_grade:v})});
 m.textContent=r.ok?"salvo!":"erro";
}
async function loadBanco(){
 var b=document.getElementById("banco-info");
 var r=await fetch(BASE+"/admin/status",{headers:H()});
 if(!r.ok){b.textContent="conecte para ver.";return;}
 var s=await r.json();
 b.innerHTML='Banco: <b>bolao_copa26</b> &middot; status: '+(s.db?'<span style="color:#14794a;font-weight:700">online</span>':'<span style="color:#c01f2e">offline</span>')+'<br>Fonte de jogos: '+(s.jogos_fonte?"ok":"sem token")+' &middot; Odds: '+(s.odds_api?"ok":"sem chave");
}

/* ---------- Custos / LLM (precos + dolar) ---------- */
function badge(m){return m.em_uso?'<span class="pill uso">EM USO</span>':(m.ativo?'<span class="pill ativo">ATIVA</span>':'');}
async function loadCustos(){
 var r=await fetch(BASE+"/admin/custos/dados",{headers:H()});
 var tb=document.getElementById("texto-body");var ib=document.getElementById("imagem-body");
 if(!r.ok){tb.innerHTML='<tr><td colspan="6" class="muted">conecte para ver.</td></tr>';ib.innerHTML='<tr><td colspan="5" class="muted">conecte para ver.</td></tr>';return;}
 var d=await r.json();DOLAR=N(d.dolar)||5.2;
 document.getElementById("dolar-v").textContent=num(d.dolar,4);
 document.getElementById("dolar-em").textContent=d.dolar_em?("atualizado em "+d.dolar_em):"sem atualizacao registrada";
 var ativos=d.modelos.filter(function(m){return !m.arquivado;});
 var textos=ativos.filter(function(m){return !ehImg(m);});
 var imgs=ativos.filter(ehImg);
 tb.innerHTML=textos.length?textos.map(function(m){
  var b=esc(m.modelo);
  return '<tr data-m="'+b+'">'+
   '<td><b>'+b+'</b> '+badge(m)+'</td>'+
   '<td><input class="pp" data-f="provedor" value="'+esc(m.provedor)+'" style="text-align:left;width:90px"></td>'+
   '<td class="num"><input class="pp" data-f="in" type="number" step="0.0001" value="'+m.preco_in+'" style="width:96px"></td>'+
   '<td class="num"><input class="pp" data-f="out" type="number" step="0.0001" value="'+m.preco_out+'" style="width:96px"></td>'+
   '<td class="num"><input class="pp" data-f="cache" type="number" step="0.0001" value="'+m.preco_cache+'" style="width:96px"></td>'+
   '<td style="white-space:nowrap"><button class="sm" onclick="salvarPreco(this)">Salvar</button> <button class="sm gh" onclick="arquivar(this)">arquivar</button></td>'+
   '</tr>';
 }).join(""):'<tr><td colspan="6" class="muted">nenhum modelo de texto. Cadastre uma LLM ou adicione manual.</td></tr>';
 ib.innerHTML=imgs.length?imgs.map(function(m){
  var b=esc(m.modelo);
  return '<tr data-m="'+b+'">'+
   '<td><b>'+b+'</b> '+badge(m)+' <span class="pill img">IMAGEM</span></td>'+
   '<td><input class="pp" data-f="provedor" value="'+esc(m.provedor)+'" style="text-align:left;width:90px"></td>'+
   '<td class="num"><input class="pp" data-f="imagem" type="number" step="0.0001" value="'+m.preco_imagem+'" style="width:110px" oninput="recalcImg(this)"></td>'+
   '<td class="num"><span class="rbrl">R$ '+num(N(m.preco_imagem)*DOLAR,3)+'</span></td>'+
   '<td style="white-space:nowrap"><button class="sm" onclick="salvarPreco(this)">Salvar</button> <button class="sm gh" onclick="arquivar(this)">arquivar</button></td>'+
   '</tr>';
 }).join(""):'<tr><td colspan="5" class="muted">nenhum modelo de imagem. Adicione um motor na aba Motor de Imagem (ex.: gemini-2.5-flash-image).</td></tr>';
}
function recalcImg(inp){var tr=inp.closest("tr");var span=tr.querySelector(".rbrl");if(span)span.textContent="R$ "+num(N(inp.value)*DOLAR,3);}
function linhaDados(btn){var tr=btn.closest("tr");var o={modelo:tr.getAttribute("data-m")};tr.querySelectorAll(".pp").forEach(function(i){o[i.getAttribute("data-f")]=i.value;});return o;}
async function salvarPreco(btn){
 var o=linhaDados(btn);
 var r=await fetch(BASE+"/admin/precos/salvar",{method:"POST",headers:H(),body:JSON.stringify({modelo:o.modelo,provedor:o.provedor,preco_in:o.in,preco_out:o.out,preco_cache:o.cache,preco_imagem:o.imagem})});
 toast(r.ok?("Salvo: "+o.modelo):"erro",r.ok?"ok":"err");
}
async function arquivar(btn){
 var o=linhaDados(btn);
 var r=await fetch(BASE+"/admin/precos/arquivar",{method:"POST",headers:H(),body:JSON.stringify({modelo:o.modelo,arquivado:true})});
 toast(r.ok?"Arquivado":"erro",r.ok?"ok":"err");loadCustos();
}
async function addPreco(){
 var modelo=val("np-modelo").trim();if(!modelo){toast("Informe o modelo","err");return;}
 var r=await fetch(BASE+"/admin/precos/salvar",{method:"POST",headers:H(),body:JSON.stringify({modelo:modelo,provedor:val("np-prov"),preco_in:val("np-in"),preco_out:val("np-out"),preco_cache:val("np-cache"),preco_imagem:val("np-img")})});
 toast(r.ok?"Adicionado":"erro",r.ok?"ok":"err");
 if(r.ok){["np-modelo","np-prov","np-in","np-out","np-cache","np-img"].forEach(function(i){document.getElementById(i).value="";});loadCustos();}
}
async function buscarCatalogo(){
 toast("Baixando catalogo de precos (LiteLLM)...","ok");
 var r=await fetch(BASE+"/admin/precos/catalogo",{method:"POST",headers:H()});
 var j=await r.json().catch(function(){return {};});
 if(!j.ok){toast("Falhou: "+(j.erro||"erro"),"err");return;}
 var extra=(j.faltando&&j.faltando.length)?(" | sem catalogo: "+j.faltando.join(", ")):"";
 toast(j.atualizados+"/"+j.total+" modelos com preco do catalogo"+extra,"ok");
 loadCustos();
}
async function salvarDolar(){
 var v=N(val("dolar-in"));if(!(v>0)){toast("Informe um valor","err");return;}
 var r=await fetch(BASE+"/admin/precos/dolar",{method:"POST",headers:H(),body:JSON.stringify({valor:v})});
 toast(r.ok?"Dolar salvo":"erro",r.ok?"ok":"err");document.getElementById("dolar-in").value="";loadCustos();
}
async function atualizarDolar(){
 toast("Buscando cotacao...","ok");
 var r=await fetch(BASE+"/admin/precos/dolar",{method:"POST",headers:H(),body:JSON.stringify({atualizar:true})});
 var j=await r.json().catch(function(){return {};});
 toast(j.ok?("Dolar: R$ "+num(j.valor,4)):("Falhou: "+(j.erro||"")),j.ok?"ok":"err");loadCustos();
}

/* ---------- LLM pool ---------- */
function provLabel(p){return p.provedor==="gemini"?"cloud":(p.base_url?"local":"cloud");}
async function loadLLM(papel){
 var alvo=papel==="texto"?"lista-texto":"lista-imagem";
 var box=document.getElementById(alvo);box.innerHTML='<div class="muted">carregando...</div>';
 var r=await fetch(BASE+"/admin/llm?papel="+papel,{headers:H()});
 if(!r.ok){box.innerHTML='<div class="muted">conecte para ver.</div>';return;}
 var lista=await r.json();
 if(!lista.length){box.innerHTML='<div class="muted">nenhum provedor ainda. Clique em <b>Adicionar</b>.</div>';return;}
 box.innerHTML=lista.map(function(p){
  var loc=provLabel(p);
  var uso=p.em_uso?'<span class="pill uso">EM USO</span>':'';
  var tipo='<span class="pill '+loc+'">'+(loc==="local"?"LOCAL":"CLOUD")+'</span>';
  var teste=p.ultimo_teste?('<div class="m">'+esc(p.ultimo_teste)+'</div>'):'';
  return '<div class="prov'+(p.em_uso?" uso":"")+'">'+tipo+
   '<div class="pinfo"><b>'+esc(p.provedor)+'</b> &middot; <span class="m">'+esc(p.modelo)+'</span> '+uso+
   (p.base_url?('<div class="m">'+esc(p.base_url)+'</div>'):'')+teste+'</div>'+
   '<div class="pacts">'+
    (p.em_uso?'':'<button class="sm gr" onclick="usar('+p.id+')">usar</button>')+
    '<button class="sm gh" onclick="testar('+p.id+')">testar</button>'+
    '<button class="sm gh" onclick=\\'editar('+JSON.stringify(JSON.stringify(p))+',"'+papel+'")\\'>editar</button>'+
    '<button class="sm dg" onclick="del('+p.id+',\\''+papel+'\\')">x</button>'+
   '</div></div>';
 }).join("");
}
function abrirForm(papel,p){
 document.getElementById("ti-"+papel).textContent=(p&&p.id)?"Editar provedor":"Adicionar provedor";
 formProv(papel,p);
 document.getElementById("wrap-"+papel).classList.remove("hide");
 document.getElementById("wrap-"+papel).scrollIntoView({behavior:"smooth"});
}
function fecharForm(papel){document.getElementById("wrap-"+papel).classList.add("hide");}
function formProv(papel,p){
 p=p||{};var alvo=papel==="texto"?"form-texto":"form-imagem";
 var provs=papel==="imagem"?["gemini","openai"]:["gemini","openai","groq","anthropic","local"];
 var opts=provs.map(function(x){return '<option value="'+x+'"'+(p.provedor===x?" selected":"")+'>'+x+'</option>';}).join("");
 var modOpt=p.modelo?('<option value="'+esc(p.modelo)+'" selected>'+esc(p.modelo)+'</option>'):'<option value="">-- busque os modelos --</option>';
 document.getElementById(alvo).innerHTML=
  '<input type="hidden" id="'+papel+'_id" value="'+(p.id||"")+'">'+
  '<div class="row"><div><label>1. Provedor</label><select id="'+papel+'_provedor" onchange="onProv(\\''+papel+'\\')">'+opts+'</select></div>'+
  '<div><label>2. API Key</label><input id="'+papel+'_key" type="password" placeholder="'+(p.id?"(em branco mantem a salva)":"cole a chave")+'"></div></div>'+
  '<div class="row" id="'+papel+'_baserow" style="'+((p.provedor&&p.provedor!=="gemini")?"":"display:none")+'"><div><label>Base URL (local/openai-compativel)</label><input id="'+papel+'_base" value="'+esc(p.base_url||"")+'" placeholder="http://localhost:11434/v1"></div></div>'+
  '<button class="gh full" onclick="buscarModelos(\\''+papel+'\\')">&#128269; 3. Buscar modelos do provedor</button>'+
  '<label style="margin-top:12px">4. Modelo</label><select id="'+papel+'_modelo">'+modOpt+'</select>'+
  '<div class="save"><button class="gh sm" onclick="testarNovo(\\''+papel+'\\')">&#9889; Testar</button>'+
   '<button class="sm" onclick="salvarProv(\\''+papel+'\\')">'+(p.id?"Salvar alteracoes":"Salvar provedor")+'</button></div>';
}
function onProv(papel){var pv=val(papel+"_provedor");document.getElementById(papel+"_baserow").style.display=(pv&&pv!=="gemini")?"":"none";}
function editar(pjson,papel){try{var p=JSON.parse(pjson);abrirForm(papel,p);}catch(e){}}
function corpo(papel){return {id:val(papel+"_id")||null,papel:papel,provedor:val(papel+"_provedor"),modelo:val(papel+"_modelo"),base_url:val(papel+"_base"),api_key:val(papel+"_key")};}
async function buscarModelos(papel){
 toast("Buscando modelos...","ok");
 var r=await fetch(BASE+"/admin/llm/modelos",{method:"POST",headers:H(),body:JSON.stringify(corpo(papel))});
 var j=await r.json().catch(function(){return {};});
 if(!j.ok){toast("Falhou: "+(j.detalhe||"erro"),"err");return;}
 var sel=document.getElementById(papel+"_modelo");var atual=sel.value;
 sel.innerHTML='<option value="">-- escolha ('+j.modelos.length+') --</option>'+j.modelos.map(function(m){return '<option value="'+esc(m)+'"'+(m===atual?" selected":"")+'>'+esc(m)+'</option>';}).join("");
 toast(j.modelos.length+" modelos encontrados","ok");
}
async function testarNovo(papel){
 var b=corpo(papel);if(!b.modelo){toast("Escolha um modelo primeiro","err");return;}
 toast("Testando "+b.modelo+"...","ok");
 var r=await fetch(BASE+"/admin/llm/testar_params",{method:"POST",headers:H(),body:JSON.stringify(b)});
 var j=await r.json().catch(function(){return {};});
 toast(j.ok?("OK: "+(j.resposta||"respondeu")):("FALHOU: "+(j.detalhe||"")),j.ok?"ok":"err");
}
async function salvarProv(papel){
 var b=corpo(papel);if(!b.modelo){toast("Busque e escolha um modelo","err");return;}
 var r=await fetch(BASE+"/admin/llm",{method:"POST",headers:H(),body:JSON.stringify(b)});
 if(!r.ok){toast("Erro ao salvar","err");return;}
 toast("Provedor salvo (entrou na biblioteca de precos)","ok");fecharForm(papel);loadLLM(papel);
}
async function usar(id){var r=await fetch(BASE+"/admin/llm/usar",{method:"POST",headers:H(),body:JSON.stringify({id:id})});toast(r.ok?"Definido como EM USO":"erro",r.ok?"ok":"err");loadLLM("texto");loadLLM("imagem");}
async function del(id,papel){if(!confirm("Remover este provedor?"))return;var r=await fetch(BASE+"/admin/llm/del",{method:"POST",headers:H(),body:JSON.stringify({id:id})});toast(r.ok?"Removido":"erro",r.ok?"ok":"err");loadLLM(papel);}
async function testar(id){toast("Testando...","ok");var r=await fetch(BASE+"/admin/llm/testar",{method:"POST",headers:H(),body:JSON.stringify({id:id})});var j=await r.json().catch(function(){return{};});toast(j.ok?("OK: "+(j.resposta||"")):("FALHOU: "+(j.detalhe||"")),j.ok?"ok":"err");loadLLM("texto");loadLLM("imagem");}
init();
</script></body></html>`;
