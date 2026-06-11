import { NAV_CSS, sideHtml, NAV_JS } from "./ui.js";

export const PAGINA = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bolao da Copa 26 - Admin</title>
<link rel="icon" type="image/png" href="data:image/png;base64,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">
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
.advwrap{position:relative;display:inline-flex;margin-left:8px}.adav{position:relative;width:32px;height:32px;border-radius:50%;background:#1faa59;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;cursor:pointer}.adchev{position:absolute;bottom:-1px;right:-1px;width:14px;height:14px;border-radius:50%;background:#fff;border:1px solid #d9dee8;color:#444;display:flex;align-items:center;justify-content:center;z-index:3}.adchev svg{width:9px;height:9px}.advdrop{position:absolute;top:42px;right:0;width:240px;background:#fff;border:1px solid #e2e6f0;border-radius:14px;box-shadow:0 18px 44px rgba(20,30,60,.18);padding:8px;display:none;z-index:100}.advdrop.open{display:block}.advhd{font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;padding:6px 8px}.advp{display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:9px;cursor:pointer}.advp:hover{background:#f4f6f9}.advp.ativo{background:#eef1f8}.advpav{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#14794a,#1faa59);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex:none}.advpav.adm{background:linear-gradient(135deg,#e0a008,#f6c83a);color:#3a2a00}.advpi{flex:1}.advpi b{font-size:13px;display:block;color:#1a2233}.advpi small{font-size:11px;color:#6b7280}.advchk{color:#1faa59;font-weight:800}${NAV_CSS}
</style></head><body>
<div class="app">
 ${sideHtml("dash")}
 <main class="main">
  <div class="top">
   <h2 id="ttl">Dashboard</h2>
   <div class="tokrow">
    <input id="tok" type="password" placeholder="token de admin (ou faca login)" style="width:200px">
    <button class="sm" onclick="conectar()">Conectar</button>
    <span id="conn" class="pill no">offline</span><div class="advwrap"><span class="adav" onclick="var d=document.getElementById(&#39;advdrop&#39;);d.classList.toggle(&#39;open&#39;);event.stopPropagation()" title="Perfil">A<i class="adchev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></i></span><div class="advdrop" id="advdrop"><div class="advhd">Trocar de perfil</div><div class="advp ativo"><span class="advpav adm">A</span><div class="advpi"><b>Painel Admin</b><small>Voc&ecirc; est&aacute; aqui</small></div><span class="advchk">&#10003;</span></div><div class="advp" onclick="location.href=location.pathname.replace(&#39;/admin&#39;,&#39;/jogar&#39;)"><span class="advpav">J</span><div class="advpi"><b>App do Jogador</b><small>Voltar pro jogo</small></div></div></div></div>
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


   <section id="pg-regras" class="sec hide">
    <h2>Regras &amp; Pontua&ccedil;&atilde;o</h2>
    <div class="muted" style="margin-bottom:6px">Tudo aqui grava direto no <code>config</code> e vale na hora (sem deploy). Conecte (token/login) para carregar e salvar. <span id="regras-conn" class="muted"></span></div>

    <div class="card" style="margin-top:14px">
     <h3>&#127919; Bol&atilde;o &mdash; fase de grupos <code>pontos_regra</code></h3>
     <div style="margin-top:8px"><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Placar exato <input type="number" id="r-exato" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Vencedor + saldo <input type="number" id="r-vsaldo" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">S&oacute; vencedor/empate <input type="number" id="r-venc" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Gols de um time <input type="number" id="r-gol" style="width:62px"></label></div>
     <div class="save"><button class="sm" onclick="salvarRegra(&#39;pontos_regra&#39;)">Salvar</button><span id="s-pontos_regra" class="muted"></span></div>
    </div>

    <div class="card" style="margin-top:14px">
     <h3>&#127942; Eliminat&oacute;rias &mdash; multiplicador por fase <code>mata_mult</code></h3>
     <div style="margin-top:8px"><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Rodada de 32 &times; <input type="number" id="m-r32" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Oitavas &times; <input type="number" id="m-oitavas" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Quartas &times; <input type="number" id="m-quartas" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Semi &times; <input type="number" id="m-semi" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">3&ordm; lugar &times; <input type="number" id="m-terceiro" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Final &times; <input type="number" id="m-final" style="width:62px"></label></div>
     <div class="save"><button class="sm" onclick="salvarRegra(&#39;mata_mult&#39;)">Salvar</button><span id="s-mata_mult" class="muted"></span></div>
    </div>

    <div class="card" style="margin-top:14px">
     <h3>&#127881; Palpites de longo prazo <code>longo_prazo</code></h3>
     <div style="margin-top:8px"><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Campe&atilde;o <input type="number" id="lp-campeao" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Vice <input type="number" id="lp-vice" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">3&ordm; <input type="number" id="lp-terceiro" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">4&ordm; <input type="number" id="lp-quarto" style="width:62px"></label></div>
     <div style="margin-top:4px"><span class="muted" style="font-size:12px">Artilheiro (campe&atilde;o de gols): </span><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0"><input type="number" id="lp-art0" style="width:62px"></label></div>
     <div class="save"><button class="sm" onclick="salvarRegra(&#39;longo_prazo&#39;)">Salvar pontos</button><span id="s-longo_prazo" class="muted"></span></div>
     <div style="margin-top:10px;border-top:1px solid var(--bd);padding-top:10px"><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Trava do palpite (ISO) <input type="text" id="lp-trava" style="width:230px"></label>
     <button class="sm ghost" onclick="salvarRegra(&#39;longo_trava&#39;)">Salvar trava</button><span id="s-longo_trava" class="muted"></span></div>
    </div>

    <div class="card" style="margin-top:14px">
     <h3>&#9876;&#65039; Arena (PvP) <code>arena</code></h3>
     <div style="margin-top:8px"><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Stake <input type="number" id="ar-stake" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Rake <input type="number" id="ar-rake" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Vit. 1&ordf; <input type="number" id="ar-pts1" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Vit. 2&ordf; <input type="number" id="ar-pts2" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Vit. 3&ordf; <input type="number" id="ar-pts3" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Derrota <input type="number" id="ar-derrota" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">M&aacute;x/rodada <input type="number" id="ar-max" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Teto XI (vazio=sem) <input type="number" id="ar-teto" style="width:92px"></label></div>
     <div class="save"><button class="sm" onclick="salvarRegra(&#39;arena&#39;)">Salvar</button><span id="s-arena" class="muted"></span></div>
    </div>

    <div class="card" style="margin-top:14px">
     <h3>&#128722; Marketplace &mdash; saquinhos <code>pacotes</code></h3>
     <div style="margin-top:8px"><b style="font-size:13px">Normal</b> <label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">pre&ccedil;o <input type="number" id="pk-n-preco" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">cartas <input type="number" id="pk-n-cartas" style="width:62px"></label></div>
     <div style="margin-top:4px"><b style="font-size:13px">Especial</b> <label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">pre&ccedil;o <input type="number" id="pk-e-preco" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">cartas <input type="number" id="pk-e-cartas" style="width:62px"></label></div>
     <div style="margin-top:4px"><b style="font-size:13px">Lend&aacute;rio</b> <label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">pre&ccedil;o <input type="number" id="pk-l-preco" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">cartas <input type="number" id="pk-l-cartas" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">Garante top <input type="checkbox" id="pk-l-top"></label></div>
     <div class="save"><button class="sm" onclick="salvarRegra(&#39;pacotes&#39;)">Salvar</button><span id="s-pacotes" class="muted"></span></div>
    </div>

    <div class="card" style="margin-top:14px">
     <h3>&#128176; Pote de Ouro &mdash; split do top 3 <code>pote_split</code></h3>
     <div style="margin-top:8px"><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">1&ordm; (%) <input type="number" id="ps-1" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">2&ordm; (%) <input type="number" id="ps-2" style="width:62px"></label><label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin:0 14px 8px 0">3&ordm; (%) <input type="number" id="ps-3" style="width:62px"></label></div>
     <div class="save"><button class="sm" onclick="salvarRegra(&#39;pote_split&#39;)">Salvar</button><span id="s-pote_split" class="muted"></span></div>
    </div>
   </section>
  </div>
 </main>
</div>
<script>
${NAV_JS}
var BASE=_b();
var TITLES={dash:"Dashboard",jogos:"Jogos / Rodadas",users:"Usuarios & Carteiras",rank:"Ranking",integ:"Integracoes / Crons",regras:"Regras & Pontuacao"};
function nav(pg){
 document.querySelectorAll(".sec").forEach(function(s){s.classList.add("hide")});
 var el=document.getElementById("pg-"+pg);if(el)el.classList.remove("hide");
 document.getElementById("ttl").textContent=TITLES[pg]||"Admin";
 if(pg==="users")loadUsers();
 if(pg==="rank")loadRank();
 if(pg==="jogos")loadJogos();
 if(pg==="integ")loadInteg();
 if(pg==="regras")loadRegras();
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
function rNumv(id){var e=document.getElementById(id);var n=parseInt(e&&e.value,10);return isNaN(n)?0:n;}
async function loadRegras(){
 var st=document.getElementById("regras-conn");
 var r=await fetch(BASE+"/admin/regras",{headers:H()});
 if(!r.ok){if(st)st.textContent="conecte (token/login) para carregar.";return;}
 var d=(await r.json()).regras||{};
 function S(id,v){var e=document.getElementById(id);if(e!=null&&v!=null)e.value=v;}
 var p=d.pontos_regra||{};S("r-exato",p.exato);S("r-vsaldo",p.vencedor_saldo);S("r-venc",p.vencedor);S("r-gol",p.gol_time);
 var m=d.mata_mult||{};S("m-r32",m.r32);S("m-oitavas",m.oitavas);S("m-quartas",m.quartas);S("m-semi",m.semi);S("m-terceiro",m.terceiro);S("m-final",m.final);
 var l=d.longo_prazo||{};S("lp-campeao",l.campeao);S("lp-vice",l.vice);S("lp-terceiro",l.terceiro);S("lp-quarto",l.quarto);var a=l.artilheiro;S("lp-art0",Array.isArray(a)?a[0]:a);
 S("lp-trava",d.longo_trava);
 var ar=d.arena||{};S("ar-stake",ar.stake);S("ar-rake",ar.rake);var ap=ar.pts||[];S("ar-pts1",ap[0]);S("ar-pts2",ap[1]);S("ar-pts3",ap[2]);S("ar-derrota",ar.pts_derrota);S("ar-max",ar.max_rodada);S("ar-teto",ar.teto_xi);
 var pk=d.pacotes||{};var pn=pk.normal||{},pe=pk.especial||{},pl=pk.lendario||{};S("pk-n-preco",pn.preco);S("pk-n-cartas",pn.cartas);S("pk-e-preco",pe.preco);S("pk-e-cartas",pe.cartas);S("pk-l-preco",pl.preco);S("pk-l-cartas",pl.cartas);var lt=document.getElementById("pk-l-top");if(lt)lt.checked=!!pl.garante_top;
 var ps=d.pote_split||[];S("ps-1",ps[0]);S("ps-2",ps[1]);S("ps-3",ps[2]);
 if(st)st.textContent="carregado.";
}
async function salvarRegra(chave){
 var valor;
 if(chave==="pontos_regra")valor={exato:rNumv("r-exato"),vencedor_saldo:rNumv("r-vsaldo"),vencedor:rNumv("r-venc"),gol_time:rNumv("r-gol")};
 else if(chave==="mata_mult")valor={r32:rNumv("m-r32"),oitavas:rNumv("m-oitavas"),quartas:rNumv("m-quartas"),semi:rNumv("m-semi"),terceiro:rNumv("m-terceiro"),final:rNumv("m-final")};
 else if(chave==="longo_prazo")valor={campeao:rNumv("lp-campeao"),vice:rNumv("lp-vice"),terceiro:rNumv("lp-terceiro"),quarto:rNumv("lp-quarto"),artilheiro:rNumv("lp-art0")};
 else if(chave==="longo_trava")valor=(document.getElementById("lp-trava").value||"").trim();
 else if(chave==="arena"){var t=document.getElementById("ar-teto").value;valor={stake:rNumv("ar-stake"),rake:rNumv("ar-rake"),pts:[rNumv("ar-pts1"),rNumv("ar-pts2"),rNumv("ar-pts3")],pts_derrota:rNumv("ar-derrota"),max_rodada:rNumv("ar-max"),teto_xi:(t===""||t==null?null:parseInt(t,10))};}
 else if(chave==="pacotes")valor={normal:{preco:rNumv("pk-n-preco"),cartas:rNumv("pk-n-cartas")},especial:{preco:rNumv("pk-e-preco"),cartas:rNumv("pk-e-cartas")},lendario:{preco:rNumv("pk-l-preco"),cartas:rNumv("pk-l-cartas"),garante_top:!!document.getElementById("pk-l-top").checked}};
 else if(chave==="pote_split")valor=[rNumv("ps-1"),rNumv("ps-2"),rNumv("ps-3")];
 var st=document.getElementById("s-"+chave);if(st)st.textContent="salvando...";
 var r=await fetch(BASE+"/admin/regras",{method:"POST",headers:H(),body:JSON.stringify({chave:chave,valor:valor})});
 var j=await r.json().catch(function(){return{};});
 if(st)st.textContent=(r.ok&&j.ok)?"salvo \u2713":("erro: "+(j.erro||r.status));
}
if(localStorage.getItem("sessao")){conectar();}
(function(){var q=new URLSearchParams(location.search).get("pg");if(q&&document.getElementById("pg-"+q))nav(q);})();
</script></body></html>`;
