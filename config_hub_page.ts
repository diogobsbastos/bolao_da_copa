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
   <div class="tab" data-t="pay" onclick="aba('pay')">&#128179; Hub de Pagamento</div>
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
    <div class="card"><div class="cardhead"><div><h3>&#128240; Not&iacute;cias &mdash; ESPN <span class="pill local">gr&aacute;tis &middot; sem chave</span></h3>
      <div class="sub">Feed oficial da Copa (ESPN), filtrado por sele&ccedil;&atilde;o (PT+EN). T&iacute;tulo + descri&ccedil;&atilde;o. Embutido no c&oacute;digo, sem configura&ccedil;&atilde;o. Alimenta o popup de not&iacute;cias e o contexto da LLM.</div></div>
      <a style="text-decoration:none;background:#eef1fb;color:#4361ee;padding:7px 12px;border-radius:9px;font-size:12px;font-weight:700;white-space:nowrap;align-self:flex-start" href="https://www.espn.com.br/futebol/" target="_blank">Ir ao site &#8599;</a></div>
     <div class="save"><button class="sm gh" onclick="pingEspn()">&#128268; Testar</button><span id="m-espn" class="muted"></span></div></div>
    <div class="card"><div class="cardhead"><div><h3>&#128202; Copa 2022 &mdash; StatsBomb <span class="pill local">gr&aacute;tis &middot; sem chave</span></h3>
      <div class="sub">Dados abertos da Copa 2022 (resultados e fases). Usado no hist&oacute;rico/forma de cada sele&ccedil;&atilde;o. Embutido, sem chave.</div></div>
      <a style="text-decoration:none;background:#eef1fb;color:#4361ee;padding:7px 12px;border-radius:9px;font-size:12px;font-weight:700;white-space:nowrap;align-self:flex-start" href="https://github.com/statsbomb/open-data" target="_blank">Ir ao site &#8599;</a></div>
     <div class="save"><button class="sm gh" onclick="pingStatsbomb()">&#128268; Testar</button><span id="m-statsbomb" class="muted"></span></div></div>
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
    <div class="card" style="margin-top:14px;border-left:4px solid #7c3aed;background:linear-gradient(90deg,rgba(124,58,237,.08),transparent 55%)"><div class="cardhead"><div><h3 style="color:#7c3aed">&#128240; Leitor de Not&iacute;cias &mdash; LLM dedicada <span style="display:inline-block;vertical-align:middle;margin-left:8px;font-size:10.5px;font-weight:800;letter-spacing:.5px;color:#fff;background:#7c3aed;padding:2px 9px;border-radius:999px">SERVI&Ccedil;O DEDICADO</span></h3>
     <div class="sub">Escolha qual LLM (das cadastradas acima) resume as not&iacute;cias na madrugada. Um modelo leve 7B basta &mdash; pode ser free tier (Groq, Gemini) ou local.</div></div></div>
     <div style="margin-top:8px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px"><div><label style="font-size:12.5px;font-weight:800;color:var(--ok,#16a34a);display:block;margin-bottom:5px;letter-spacing:.2px">1&ordf; OP&Ccedil;&Atilde;O (principal)</label><select id="sel-noticias-1" onchange="salvarNoticiasLLM()" style="width:100%;padding:9px;border:1px solid var(--bd);border-radius:9px"></select></div><div><label style="font-size:12.5px;font-weight:800;color:var(--tx,#1f2937);display:block;margin-bottom:5px;letter-spacing:.2px">2&ordf; OP&Ccedil;&Atilde;O (fallback)</label><select id="sel-noticias-2" onchange="salvarNoticiasLLM()" style="width:100%;padding:9px;border:1px solid var(--bd);border-radius:9px"></select></div><div><label style="font-size:12.5px;font-weight:800;color:var(--tx,#1f2937);display:block;margin-bottom:5px;letter-spacing:.2px">3&ordf; OP&Ccedil;&Atilde;O (fallback)</label><select id="sel-noticias-3" onchange="salvarNoticiasLLM()" style="width:100%;padding:9px;border:1px solid var(--bd);border-radius:9px"></select></div></div><div style="margin-top:6px"><span id="msg-noticias" class="muted"></span> <span class="sub">Tenta a 1&ordf;; se falhar/estourar limite, espera e tenta 2&ordf;, depois 3&ordf; (e volta pra 1&ordf;).</span></div>
     <div style="margin-top:12px;border-top:1px solid var(--bd);padding-top:10px"><label class="muted">Hor&aacute;rios da rotina de resumo (empilha os resumos dos jogos que v&ecirc;m):</label>
      <div id="hor-noticias" style="display:flex;gap:6px;flex-wrap:wrap;margin:7px 0"></div>
      <div style="display:flex;gap:6px;align-items:center"><input type="time" id="hor-novo" value="04:00" style="padding:7px;border:1px solid var(--bd);border-radius:8px"><button class="sm" onclick="addHorNoticias()">&#10133; Adicionar hor&aacute;rio</button></div></div></div>
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
    <div style="display:flex;gap:8px;margin-bottom:12px">
     <button id="imgtab-llm" class="sm" onclick="imgTab('llm')">&#129504; LLM (Gemini/outros)</button>
     <button id="imgtab-nv" class="sm gh" onclick="imgTab('nv')">&#127918; NVIDIA FLUX</button></div>
    <div id="img-llm">
     <div class="card"><div class="cardhead"><div><h3>&#127912; Motor de Imagem</h3>
      <div class="sub">Separado do cerebro &mdash; gera os moldes das figurinhas personalizadas e artes. Configure quantos motores quiser; o marcado <b>EM USO</b> e o que gera.</div></div>
      <button class="add" onclick="abrirForm('imagem')">&#10133; Adicionar motor</button></div>
      <div id="lista-imagem"></div></div>
     <div id="wrap-imagem" class="card hide"><div class="cardhead"><h3 id="ti-imagem">Adicionar motor de imagem</h3><button class="sm gh" onclick="fecharForm('imagem')">fechar</button></div><div id="form-imagem"></div></div>
    </div>
    <div id="img-nvidia" class="hide">
     <div class="card" style="border-left:4px solid #76b900">
      <div class="cardhead"><div><h3>&#127918; NVIDIA FLUX &mdash; geracao de imagem</h3>
       <div class="sub">Config self-contained (migravel p/ outros projetos). Endpoint fixo: <code>https://ai.api.nvidia.com/v1/genai/&lt;modelo&gt;</code> &middot; chave <code>nvapi-</code>.</div></div></div>
      <div class="row"><div><label>API Key (nvapi-) <span id="nv-keyset" class="muted" style="font-weight:400"></span></label><input id="nv-key" type="password" placeholder="cole a chave nvapi- (em branco mantem a salva)"></div></div>
      <label style="margin-top:10px">Modelo FLUX</label>
      <input id="nv-modelo" list="nv-dl" placeholder="black-forest-labs/flux.1-dev" autocomplete="off" style="width:100%">
      <datalist id="nv-dl"><option value="black-forest-labs/flux.1-dev"><option value="black-forest-labs/flux.1-schnell"><option value="black-forest-labs/flux.1-kontext-dev"><option value="black-forest-labs/flux.1-canny-dev"><option value="black-forest-labs/flux.1-depth-dev"></datalist>
      <div class="sub" style="margin-top:6px"><b>flux.1-dev</b>: texto&rarr;imagem (teste rapido). <b>flux.1-kontext-dev</b>: edita a partir de uma foto (p/ figurinha por pessoa).</div>
      <div class="save" style="margin-top:12px">
       <button class="sm" onclick="salvarNvidia()">Salvar config</button>
       <button class="sm gr" onclick="usarNvidia()">Usar este motor</button>
       <button class="sm gh" onclick="testarImgNvidia()">&#9889; Testar geracao</button>
       <span id="nv-msg" class="muted"></span></div>
      <div style="margin-top:10px"><input id="nv-prompt" placeholder="prompt de teste (opcional)" style="width:100%"></div>
      <div id="nv-result" style="margin-top:12px"></div>
     </div>
    </div>
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
    <div class="card" style="margin-top:14px"><div class="cardhead"><div><h3>&#129302; Raspagem de jogadores (365)</h3>
      <div class="sub">Baixa a ficha completa de <b>todos</b> os jogadores da Copa (posi&ccedil;&atilde;o detalhada, idade, clube, n&uacute;mero, dados crus) pro nosso banco. Roda em <b>segundo plano</b>, com pausa entre chamadas pra n&atilde;o estourar o 365.</div></div></div>
     <div id="j365-status" class="muted" style="margin:6px 0 10px">carregando&hellip;</div>
     <div class="save"><button class="sm" id="j365-start" onclick="startJ365()">&#9654;&#65039; Iniciar raspagem</button><button class="sm gh" onclick="limparJ365()">Limpar status</button><span id="j365-msg" class="muted"></span></div>
    </div>
   </section>

   <section id="pg-pay" class="hide">
    <div class="card"><div class="cardhead"><div><h3>&#128179; Mercado Pago &mdash; PIX <span id="pay-pill" class="pill">&hellip;</span></h3>
      <div class="sub">Recebe os dep&oacute;sitos via PIX (QR din&acirc;mico). O jogador paga <b>R$ <span id="pay-preco">10</span></b> e ganha o <b>pacote base</b> (11 figurinhas).</div></div>
      <a style="text-decoration:none;background:#eef1fb;color:#4361ee;padding:7px 12px;border-radius:9px;font-size:12px;font-weight:700;white-space:nowrap;align-self:flex-start" href="https://www.mercadopago.com.br/developers/panel/app" target="_blank">Editar no Mercado Pago &#8599;</a></div>
     <div id="pay-conta" class="muted" style="margin:4px 0 12px">carregando&hellip;</div>
     <label>Access Token (em branco mant&eacute;m o atual)</label><input id="pay-token" placeholder="TEST-... (teste) ou APP_USR-... (produ&ccedil;&atilde;o)">
     <label>Pre&ccedil;o do pacote base (R$)</label><input id="pay-precoin" type="number" min="1" step="1" placeholder="10">
     <div class="save"><button class="sm" onclick="savePay()">Salvar</button><button class="sm gh" onclick="testPay()">&#128268; Testar conex&atilde;o</button><span id="pay-msg" class="muted"></span></div>
     <div id="pay-stats" class="muted" style="margin-top:12px;border-top:1px solid #e6e8f0;padding-top:10px"></div>
     <div class="muted" style="margin-top:8px;font-size:12px">&#128274; Token guardado no servidor (config), nunca no front. Sandbox move s&oacute; dinheiro de teste &mdash; troque pelo token de produ&ccedil;&atilde;o no lan&ccedil;amento.</div>
    </div>
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
function aba(t){document.querySelectorAll("section").forEach(function(s){s.classList.add("hide");});document.getElementById("pg-"+t).classList.remove("hide");document.querySelectorAll(".tab").forEach(function(a){a.classList.toggle("on",a.getAttribute("data-t")===t);});if(t==="banco"){loadBanco();loadJ365();}if(t==="llms"){loadLLM("texto");loadNoticiasLLM();loadHorNoticias();}if(t==="img")loadLLM("imagem");if(t==="custos")loadCustos();if(t==="pay")loadPay();}
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
async function pingEspn(){var m=document.getElementById("m-espn");m.textContent="testando...";m.style.color="";var r=await fetch(BASE+"/admin/fontes/espn",{headers:H()});var j=await r.json().catch(function(){return{};});m.textContent=(j.ok?"OK ":"Falhou ")+(j.detalhe||"");m.style.color=j.ok?"#14794a":"#c01f2e";}
async function pingStatsbomb(){var m=document.getElementById("m-statsbomb");m.textContent="testando...";m.style.color="";var r=await fetch(BASE+"/admin/fontes/statsbomb",{headers:H()});var j=await r.json().catch(function(){return{};});m.textContent=(j.ok?"OK ":"Falhou ")+(j.detalhe||"");m.style.color=j.ok?"#14794a":"#c01f2e";}
async function salvarCorte(){
 var v=(val("corte_grade")||"").trim();var m=document.getElementById("m-corte");
 if(v){try{JSON.parse(v);}catch(e){m.textContent="JSON invalido";m.style.color="#e23744";return;}}
 m.style.color="";var r=await fetch(BASE+"/admin/config",{method:"POST",headers:H(),body:JSON.stringify({corte_grade:v})});
 m.textContent=r.ok?"salvo!":"erro";
}
function esc(v){return String(v==null?"":v).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];});}
async function loadPay(){
 var r=await fetch(BASE+"/admin/pagamento",{headers:H()});var d=await r.json().catch(function(){return{};});
 if(!d||!d.ok){document.getElementById("pay-conta").textContent="erro ao carregar.";return;}
 var pill=document.getElementById("pay-pill");
 if(d.configurado){pill.textContent=d.teste?"TESTE (sandbox)":"PRODU\u00c7\u00c3O";pill.className="pill "+(d.teste?"":"uso");}else{pill.textContent="n\u00e3o configurado";pill.className="pill";}
 document.getElementById("pay-preco").textContent=d.preco;document.getElementById("pay-precoin").value=d.preco;
 var ct=document.getElementById("pay-conta");
 if(d.conta){ct.innerHTML='&#9989; <b>Conta conectada:</b> '+esc(d.conta.nick||d.conta.email||d.conta.id)+(d.conta.email?(' &middot; '+esc(d.conta.email)):'')+' &middot; id '+esc(d.conta.id)+(d.tokenMasc?(' &middot; token <code>'+esc(d.tokenMasc)+'</code>'):'');}
 else if(d.configurado){ct.innerHTML='Token salvo (<code>'+esc(d.tokenMasc)+'</code>), mas n\u00e3o li a conta &mdash; clique em <b>Testar conex\u00e3o</b>.';}
 else{ct.textContent="Sem token. Cole o Access Token do Mercado Pago abaixo e salve.";}
 document.getElementById("pay-stats").innerHTML='Dep\u00f3sitos pagos: <b>'+d.depositosPagos+'</b> &middot; Arrecadado: <b>R$ '+Number(d.arrecadado||0).toFixed(2).replace(".",",")+'</b>';
}
async function savePay(){var t=document.getElementById("pay-token").value;var p=document.getElementById("pay-precoin").value;var r=await fetch(BASE+"/admin/pagamento",{method:"POST",headers:H(),body:JSON.stringify({token:t,preco:p})});var d=await r.json().catch(function(){return{};});toast(d.ok?"Salvo":"erro",d.ok?"ok":"err");document.getElementById("pay-token").value="";loadPay();}
async function testPay(){var m=document.getElementById("pay-msg");m.textContent="testando...";var r=await fetch(BASE+"/admin/pagamento/testar",{method:"POST",headers:H()});var d=await r.json().catch(function(){return{};});m.innerHTML=d.ok?('\u2705 '+esc(d.conta.nick||d.conta.email||d.conta.id)):('\u274c '+esc(d.erro||"falhou"));loadPay();}
var J365TIMER=null;
async function loadJ365(){
 var r=await fetch(BASE+"/admin/jogadores365/status",{headers:H()});var d=await r.json().catch(function(){return{};});
 if(!d||!d.ok)return;var st=d.status||{};var box=document.getElementById("j365-status");var btn=document.getElementById("j365-start");
 var rodando=!!st.rodando;
 if(btn){btn.disabled=rodando;btn.textContent=rodando?"\u23f3 Raspando\u2026":"\u25b6\ufe0f Iniciar raspagem";}
 var pct=st.total?Math.round((st.feitos||0)/st.total*100):0;
 var linha="";
 if(st.fase){linha='<b>'+esc(st.fase)+'</b> &middot; '+(st.feitos||0)+'/'+(st.total||0)+(st.total?(' ('+pct+'%)'):'')+(st.salvos!=null?(' &middot; '+st.salvos+' fichas salvas'):'')+(st.em?(' &middot; '+esc(String(st.em).slice(11,19))):'');}
 else{linha='Nunca rodou ainda.';}
 box.innerHTML=linha+'<br><span class="muted" style="font-size:12px">No banco: <b>'+d.totalBanco+'</b> jogadores &middot; com posi\u00e7\u00e3o detalhada: <b>'+d.comPosicaoDetalhada+'</b></span>';
 if(rodando){if(!J365TIMER)J365TIMER=setInterval(loadJ365,3000);}else{if(J365TIMER){clearInterval(J365TIMER);J365TIMER=null;}}
}
async function startJ365(){var m=document.getElementById("j365-msg");m.textContent="iniciando\u2026";var r=await fetch(BASE+"/admin/jogadores365/coletar",{method:"POST",headers:H()});var d=await r.json().catch(function(){return{};});m.textContent=d.ok?"rodando em segundo plano":"erro";toast(d.ok?"Raspagem iniciada":"erro",d.ok?"ok":"err");setTimeout(loadJ365,800);}
async function limparJ365(){var r=await fetch(BASE+"/admin/jogadores365/limpar",{method:"POST",headers:H()});var d=await r.json().catch(function(){return{};});toast(d.ok?"Status limpo":"erro",d.ok?"ok":"err");loadJ365();}
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
function svcName(base,prov){if(prov==="gemini"||prov==="google")return "Gemini";if(prov==="anthropic")return "Anthropic";var b=(base||"").toLowerCase();if(b.indexOf("groq")>=0)return "Groq";if(b.indexOf("nvidia")>=0)return "NVIDIA";if(b.indexOf("openrouter")>=0)return "OpenRouter";if(b.indexOf("cerebras")>=0)return "Cerebras";if(b.indexOf("mistral")>=0)return "Mistral";if(b.indexOf("googleapis")>=0)return "Gemini";if(b.indexOf("api.openai.com")>=0)return "OpenAI";if(b.indexOf("localhost")>=0||b.indexOf("127.0.0.1")>=0||b.indexOf("11434")>=0)return "Local (Ollama)";if(b.indexOf("duckdns")>=0||b.indexOf("/llm")>=0||b.indexOf("vllm")>=0||b.indexOf("lmstudio")>=0)return "Local";if(!b)return prov||"?";return b.split("://").pop().split("/")[0];}
var HORN=[];
async function loadHorNoticias(){var r=await fetch(BASE+"/admin/llm/noticias-horarios",{headers:H()});if(!r.ok)return;var d=await r.json();HORN=d.horarios||["04:00"];renderHorN();}
function renderHorN(){var box=document.getElementById("hor-noticias");if(!box)return;box.innerHTML=HORN.length?HORN.map(function(h){return '<span style="display:inline-flex;align-items:center;gap:5px;background:#eef1f6;border-radius:999px;padding:4px 5px 4px 11px;font-weight:700;font-size:12.5px">'+h+'<button onclick="delHorNoticias(&#39;'+h+'&#39;)" style="border:0;background:#dde2ec;width:18px;height:18px;border-radius:50%;cursor:pointer;line-height:1">&times;</button></span>';}).join(""):'<span class="muted">nenhum hor&aacute;rio</span>';}
function addHorNoticias(){var v=document.getElementById("hor-novo").value;if(v&&HORN.indexOf(v)<0){HORN.push(v);HORN.sort();saveHorNoticias();}}
function delHorNoticias(h){HORN=HORN.filter(function(x){return x!==h;});saveHorNoticias();}
async function saveHorNoticias(){renderHorN();var m=document.getElementById("msg-noticias");if(m)m.textContent="hor\u00e1rios salvos";await fetch(BASE+"/admin/llm/noticias-horarios",{method:"POST",headers:H(),body:JSON.stringify({horarios:HORN})});}
var _noticiasLista=[];
async function loadNoticiasLLM(){var r=await fetch(BASE+"/admin/llm/noticias",{headers:H()});if(!r.ok)return;var d=await r.json();_noticiasLista=d.lista||[];var ids=d.ids||[];renderNoticiasSelects([ids[0]?String(ids[0]):"",ids[1]?String(ids[1]):"",ids[2]?String(ids[2]):""]);}
function svcColor(nm){var m={"NVIDIA":"#76b900","Groq":"#f55036","OpenRouter":"#6566f1","Cerebras":"#f76b15","Gemini":"#1a73e8","OpenAI":"#10a37f","Mistral":"#fa5111","Anthropic":"#d97757"};return m[nm]||"#64748b";}
function svcBadge(p){var nm=svcName(p.base_url,p.provedor);return '<span style="display:inline-block;font-size:8.5px;font-weight:700;letter-spacing:.3px;color:#9094c0;background:rgba(99,102,241,.07);padding:2px 6px;border-radius:5px;white-space:nowrap;align-self:center;margin:0 8px 0 4px">'+esc(nm).toUpperCase()+'</span>';}
function renderNoticiasSelects(desired){var raw=desired||[1,2,3].map(function(n){var s=document.getElementById("sel-noticias-"+n);return s?s.value:"";});var seen={};var cur=raw.map(function(v){if(v&&seen[v])return "";if(v)seen[v]=1;return v;});[1,2,3].forEach(function(n){var s=document.getElementById("sel-noticias-"+n);if(!s)return;var mine=cur[n-1];var taken=cur.filter(function(v,i){return i!==(n-1)&&v;});var opts='<option value="">&mdash; nenhuma &mdash;</option>';_noticiasLista.forEach(function(p){var id=String(p.id);if(taken.indexOf(id)>=0)return;opts+='<option value="'+id+'"'+(id===mine?" selected":"")+'>'+svcName(p.base_url,p.provedor).toUpperCase()+'  \u2014  '+p.modelo+'</option>';});s.innerHTML=opts;s.value=mine;});}
async function salvarNoticiasLLM(){renderNoticiasSelects();var ids=[1,2,3].map(function(n){var s=document.getElementById("sel-noticias-"+n);return s?s.value:"";});var m=document.getElementById("msg-noticias");if(m)m.textContent="salvando...";var r=await fetch(BASE+"/admin/llm/noticias",{method:"POST",headers:H(),body:JSON.stringify({ids:ids})});if(m)m.textContent=r.ok?"salvo \u2713":"erro";}
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
  return '<div class="prov'+(p.em_uso?" uso":"")+'">'+tipo+svcBadge(p)+
   '<div class="pinfo"><b>'+esc(p.modelo)+'</b> '+uso+
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
  '<label style="margin-top:12px">4. Modelo <span id="'+papel+'_cnt" class="muted" style="font-weight:400;font-size:12px"></span></label><input id="'+papel+'_modelo" list="'+papel+'_dl" placeholder="busque (passo 3) e digite p/ filtrar..." autocomplete="off" value="'+(p.modelo?esc(p.modelo):'')+'" style="width:100%"><datalist id="'+papel+'_dl">'+(p.modelo?('<option value="'+esc(p.modelo)+'">'):'')+'</datalist>'+
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
 var dl=document.getElementById(papel+"_dl");if(dl)dl.innerHTML=j.modelos.map(function(m){return '<option value="'+esc(m)+'">';}).join("");
 var cnt=document.getElementById(papel+"_cnt");if(cnt)cnt.textContent='('+j.modelos.length+' carregados \u2014 digite p/ filtrar)';
 var inp=document.getElementById(papel+"_modelo");if(inp)inp.focus();
 toast(j.modelos.length+" modelos carregados","ok");
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
function imgTab(w){var llm=w==="llm";document.getElementById("img-llm").classList.toggle("hide",!llm);document.getElementById("img-nvidia").classList.toggle("hide",llm);document.getElementById("imgtab-llm").className=llm?"sm":"sm gh";document.getElementById("imgtab-nv").className=llm?"sm gh":"sm";if(!llm)loadNvidiaCfg();}
async function loadNvidiaCfg(){var r=await fetch(BASE+"/admin/llm?papel=imagem",{headers:H()});if(!r.ok)return;var lista=await r.json();var nv=null;for(var i=0;i<lista.length;i++){if(String(lista[i].base_url||"").toLowerCase().indexOf("nvidia")>=0){nv=lista[i];break;}}var mod=document.getElementById("nv-modelo");var ks=document.getElementById("nv-keyset");if(nv){if(mod&&!mod.value)mod.value=nv.modelo||"";if(ks)ks.textContent=nv.api_key_set?(nv.em_uso?"\u2014 chave salva \u2713, EM USO":"\u2014 chave salva \u2713"):"\u2014 sem chave";window._nvId=nv.id;}else{if(ks)ks.textContent="\u2014 novo";window._nvId=null;}}
async function salvarNvidia(){var modelo=val("nv-modelo").trim()||"black-forest-labs/flux.1-dev";var key=val("nv-key");var msg=document.getElementById("nv-msg");if(msg)msg.textContent="salvando...";var body={id:window._nvId||null,papel:"imagem",provedor:"openai",base_url:"https://ai.api.nvidia.com/v1/genai",modelo:modelo,api_key:key};var r=await fetch(BASE+"/admin/llm",{method:"POST",headers:H(),body:JSON.stringify(body)});var j=await r.json().catch(function(){return{};});if(!j.id){if(msg)msg.textContent="erro ao salvar";return null;}window._nvId=j.id;var k=document.getElementById("nv-key");if(k)k.value="";if(msg)msg.textContent="config salva \u2713";loadLLM("imagem");loadNvidiaCfg();return j.id;}
async function usarNvidia(){var id=await salvarNvidia();if(!id)return;await fetch(BASE+"/admin/llm/usar",{method:"POST",headers:H(),body:JSON.stringify({id:id})});var msg=document.getElementById("nv-msg");if(msg)msg.textContent="NVIDIA agora e o motor EM USO \u2713";loadLLM("imagem");loadNvidiaCfg();}
async function testarImgNvidia(){var id=await salvarNvidia();var res=document.getElementById("nv-result");var msg=document.getElementById("nv-msg");if(msg)msg.textContent="gerando imagem... (cold start pode levar ~1 min)";if(res)res.innerHTML="";var r=await fetch(BASE+"/admin/criador-fig/testar-imagem",{method:"POST",headers:H(),body:JSON.stringify({id:id,prompt:val("nv-prompt")})});var j=await r.json().catch(function(){return{};});if(!j.ok){if(msg)msg.textContent="";if(res)res.innerHTML='<div style="color:#e23744;font-weight:600">FALHOU: '+esc(j.erro||"erro")+'</div>';return;}if(msg)msg.textContent="ok \u2713";if(res)res.innerHTML='<img src="'+j.img+'" style="max-width:340px;border-radius:10px;border:1px solid var(--bd)"><div class="sub" style="margin-top:4px">motor: '+esc((j.motor&&j.motor.modelo)||"")+'</div>';}
init();
</script></body></html>`;
