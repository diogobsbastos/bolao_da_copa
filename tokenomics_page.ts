import { NAV_CSS, sideHtml, NAV_JS } from "./ui.js";

export const PAGINA = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tokenomics - Bolao da Copa 26</title>
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
.pad{padding:16px 24px 60px}
.card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:18px;margin-bottom:14px}
.card h3{margin:0 0 4px;font-size:15px}
.sub{color:var(--mut);font-size:12px;margin-bottom:8px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
.kpi{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:14px}
.kpi .lab{font-size:12px;color:var(--mut);font-weight:700}
.kpi .val{font-size:22px;font-weight:800;margin-top:6px}
.kpi.real{border-color:#bfe3cb;background:#f4fbf6}.kpi.tok{border-color:#cdd6ff;background:#f3f6ff}.kpi.infra{border-color:#f1d6a6;background:#fdf8ef}
.muted{color:var(--mut);font-size:13px}
button{background:var(--pri);color:#fff;border:0;border-radius:9px;padding:9px 14px;font-weight:700;cursor:pointer;font-size:13px}
button.sm{padding:6px 11px;font-size:12px}button.dg{background:#fde8ea;color:var(--no)}button.gh{background:#eef1fb;color:var(--pri)}
table{width:100%;border-collapse:collapse;font-size:12.5px}
th,td{text-align:left;padding:8px 9px;border-bottom:1px solid var(--bd);white-space:nowrap}th{color:var(--mut);font-weight:700;position:sticky;top:0;background:var(--card)}
td.num,th.num{text-align:right}
.scroll{max-height:520px;overflow:auto;border:1px solid var(--bd);border-radius:12px}
.hide{display:none}
.cardhead{display:flex;align-items:center;justify-content:space-between;gap:10px}
#toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:60;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none}
.tmsg{background:#1f2430;color:#fff;padding:11px 18px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.28);opacity:0;transform:translateY(12px);transition:.25s}
.tmsg.show{opacity:1;transform:translateY(0)}.tmsg.ok{background:#14794a}.tmsg.err{background:#c01f2e}
${NAV_CSS}
</style></head><body>
<div class="app">
 ${sideHtml("tokenomics")}
 <main class="main">
  <div class="top"><h2>&#128176; Tokenomics &mdash; economia do jogo</h2><span id="conn" class="muted">conectando...</span></div>
  <div class="tabs">
   <div class="tab on" data-t="resumo" onclick="aba('resumo')">&#128202; Resumo</div>
   <div class="tab" data-t="usuarios" onclick="aba('usuarios')">&#128101; Usu&aacute;rios &times; Pagamentos</div>
   <div class="tab" data-t="logs" onclick="aba('logs')">&#128220; Logs de Gasto (IA)</div>
  </div>
  <div class="pad">

   <section id="pg-resumo">
    <div class="card"><h3>&#128181; Dinheiro real (R$)</h3><div class="sub">Entradas e saques via PIX. <b>Hub PIX ainda pendente</b> &mdash; preenche sozinho quando o pagamento entrar.</div>
     <div class="grid"><div class="kpi real"><div class="lab">Arrecadado</div><div class="val" id="r-arr">R$ 0,00</div></div>
      <div class="kpi real"><div class="lab">Sacado</div><div class="val" id="r-sac">R$ 0,00</div></div>
      <div class="kpi real"><div class="lab">Saldo em caixa</div><div class="val" id="r-sal">R$ 0,00</div></div></div></div>

    <div class="card"><h3>&#129689; Tokens do jogo (em circulacao)</h3><div class="sub">Soma do saldo unico de todos os jogadores (token unico - Beta 1.0).</div>
     <div class="grid"><div class="kpi tok"><div class="lab">Total em circulacao</div><div class="val" id="t-tot">0</div></div>
      <div class="kpi"><div class="lab">Jogadores</div><div class="val" id="t-usu">0</div></div></div></div>

    <div class="card"><h3>&#129518; Custo de infra (IA)</h3><div class="sub">Quanto a operacao de IA ja custou (detalhe na aba Logs). Dolar usado pra converter.</div>
     <div class="grid"><div class="kpi infra"><div class="lab">Gasto total IA</div><div class="val" id="i-gas">R$ 0,00</div></div>
      <div class="kpi infra"><div class="lab">Operacoes (chamadas)</div><div class="val" id="i-ops">0</div></div>
      <div class="kpi"><div class="lab">Dolar (R$/US$)</div><div class="val" id="i-dol">5,20</div></div></div>
     <div class="sub" style="margin-top:10px">Editar precos e dolar: <b>Configuracoes &rarr; Custos / LLM</b>.</div></div>
   </section>

   <section id="pg-usuarios" class="hide">
    <div class="card"><h3>&#128101; Engajamento dos jogadores</h3><div class="sub">Quem pagou, quem entrou de gra&ccedil;a, por qual convite, e quem convidou.</div>
     <div class="grid">
      <div class="kpi"><div class="lab">Jogadores</div><div class="val" id="u-tot">0</div></div>
      <div class="kpi real"><div class="lab">Pagantes</div><div class="val" id="u-pag">0</div></div>
      <div class="kpi tok"><div class="lab">Gr&aacute;tis (convite FULL)</div><div class="val" id="u-full">0</div></div>
      <div class="kpi"><div class="lab">Por indica&ccedil;&atilde;o</div><div class="val" id="u-ind">0</div></div>
      <div class="kpi"><div class="lab">Convidaram algu&eacute;m</div><div class="val" id="u-conv">0</div></div>
     </div>
     <div class="scroll"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Pagou?</th><th>Como entrou</th><th>Convidou (quem usou)</th><th class="num">Cartas</th><th style="font-size:11px">Entrou</th><th class="num">Saldo</th></tr></thead><tbody id="u-body"><tr><td colspan="6" class="muted">carregando...</td></tr></tbody></table></div>
    </div>
   </section>
   <section id="pg-logs" class="hide">
    <div class="card"><div class="cardhead"><div><h3>&#128202; Resumo de consumo de IA</h3><div class="sub">Cada chamada de LLM e registrada com tokens, custo e tempo.</div></div>
     <button class="sm dg" onclick="zerar()">&#128465;&#65039; Zerar historico</button></div>
     <div class="grid" id="kpis"></div></div>
    <div class="card"><h3>&#128220; Log detalhado por operacao</h3>
     <div class="scroll"><table><thead><tr><th>Quando</th><th>Origem</th><th>Modelo</th><th>Processo</th><th class="num">In</th><th class="num">Out</th><th class="num">Cache</th><th class="num">Img</th><th class="num">R$</th><th class="num">s</th></tr></thead><tbody id="logbody"><tr><td colspan="10" class="muted">carregando...</td></tr></tbody></table></div></div>
   </section>

  </div>
 </main>
</div>
<div id="toast"></div>
<script>
${NAV_JS}
function H(){var h={"content-type":"application/json"};var s=localStorage.getItem("sessao");if(s){h["authorization"]="Bearer "+s;}return h;}
function esc(v){return String(v==null?"":v).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];});}
function toast(m,t){var c=document.getElementById("toast");var d=document.createElement("div");d.className="tmsg"+(t?(" "+t):"");d.textContent=m;c.appendChild(d);requestAnimationFrame(function(){d.classList.add("show");});setTimeout(function(){d.classList.remove("show");setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},300);},3400);}
function nInt(v){return (Math.round(N(v))).toLocaleString("pt-BR");}
function N(v){return v==null||v===""?0:Number(v);}
function brl(v,c){c=c==null?2:c;return "R$ "+N(v).toLocaleString("pt-BR",{minimumFractionDigits:c,maximumFractionDigits:c});}
function aba(t){document.querySelectorAll("section").forEach(function(s){s.classList.add("hide");});document.getElementById("pg-"+t).classList.remove("hide");document.querySelectorAll(".tab").forEach(function(a){a.classList.toggle("on",a.getAttribute("data-t")===t);});if(t==="logs")loadLogs();if(t==="usuarios")loadUsuarios();}
async function loadUsuarios(){
 var tb=document.getElementById("u-body");
 var r=await fetch(_b()+"/admin/tokenomics/usuarios",{headers:H()});
 if(!r.ok){tb.innerHTML='<tr><td colspan="6" class="muted">conecte (token/login)</td></tr>';return;}
 var d=await r.json();var R=d.resumo||{};
 document.getElementById("u-tot").textContent=R.total||0;
 document.getElementById("u-pag").textContent=R.pagantes||0;
 document.getElementById("u-full").textContent=R.gratis_full||0;
 document.getElementById("u-ind").textContent=R.indicacao||0;
 document.getElementById("u-conv").textContent=R.convidaram||0;
 var L=d.lista||[];var h="";
 for(var i=0;i<L.length;i++){var u=L[i];if(u.papel==="admin")continue;
  var pagou=u.pagou?'<b style="color:#1faa59">SIM</b>':'<span style="color:#e23744">n&atilde;o</span>';
  var entrou;
  if(u.pagou){entrou='&#128179; Pagou (R$10)';}
  else if(u.tipo_entrada==="full_gift"){entrou=(u.conv_papel==="admin")?'&#127915; Gr&aacute;tis &mdash; link do ADMIN':('&#127873; Gr&aacute;tis &mdash; convite de <b>'+esc(u.conv_nome||u.conv_email||"?")+'</b>');}
  else if(u.tipo_entrada==="indicacao"){entrou='&#128279; Indica&ccedil;&atilde;o de <b>'+esc(u.conv_nome||u.conv_email||"?")+'</b> <span class="muted">(n&atilde;o pagou)</span>';}
  else{entrou='<span class="muted">direto</span>';}
  var convidou=(u.convidou_qtd>0)?('<b>'+u.convidou_qtd+'</b> &middot; '+esc(u.convidados||"")):'<span class="muted">&mdash;</span>';
  h+='<tr><td>'+esc(u.nome||"&mdash;")+'</td><td>'+esc(u.email)+'</td><td>'+pagou+'</td><td>'+entrou+'</td><td style="font-size:12px">'+convidou+'</td><td class="num"><b style="color:'+((u.cartas||0)>0?'#1faa59':'var(--mut)')+'">'+(u.cartas||0)+'</b></td><td style="font-size:11px;color:var(--mut);white-space:nowrap">'+esc(u.criado||"&mdash;")+'</td><td class="num">'+u.saldo+'</td></tr>';
 }
 tb.innerHTML=h||'<tr><td colspan="6" class="muted">nenhum jogador ainda</td></tr>';
}
async function start(){
 var c=document.getElementById("conn");
 var r=await fetch(_b()+"/admin/tokenomics/resumo",{headers:H()});
 if(!r.ok){c.textContent="faca login no /admin";c.style.color="#e23744";return;}
 c.textContent="conectado";c.style.color="#1faa59";
 var d=await r.json();
 document.getElementById("r-arr").textContent=brl(d.real.arrecadado);
 document.getElementById("r-sac").textContent=brl(d.real.sacado);
 document.getElementById("r-sal").textContent=brl(d.real.saldo);
 document.getElementById("t-tot").textContent=nInt(d.tokens.total);
 document.getElementById("t-usu").textContent=nInt(d.usuarios);
 document.getElementById("i-gas").textContent=brl(d.infra.gasto_brl,4);
 document.getElementById("i-ops").textContent=nInt(d.infra.ops);
 document.getElementById("i-dol").textContent=N(d.dolar).toLocaleString("pt-BR",{minimumFractionDigits:4,maximumFractionDigits:4});
}
async function loadLogs(){
 var r=await fetch(_b()+"/admin/custos/dados",{headers:H()});
 if(!r.ok){document.getElementById("logbody").innerHTML='<tr><td colspan="10" class="muted">conecte para ver.</td></tr>';return;}
 var d=await r.json();var s=d.resumo;
 document.getElementById("kpis").innerHTML=[
  ["In",nInt(s.tin)],["Out",nInt(s.tout)],["Cache",nInt(s.tcache)],["Imagens",nInt(s.imgs)],
  ["Gasto R$",brl(s.gasto,2)],["Medio R$",brl(s.medio,4)],["Tempo (s)",N(s.tempo).toLocaleString("pt-BR",{maximumFractionDigits:1})],["Operacoes",nInt(s.ops)]
 ].map(function(k){return '<div class="kpi"><div class="lab">'+k[0]+'</div><div class="val" style="font-size:18px">'+k[1]+'</div></div>';}).join("");
 var b=document.getElementById("logbody");
 if(!d.log.length){b.innerHTML='<tr><td colspan="10" class="muted">nenhuma operacao registrada ainda.</td></tr>';return;}
 b.innerHTML=d.log.map(function(o){return '<tr><td>'+esc(o.quando)+'</td><td>'+esc(o.origem)+'</td><td>'+esc(o.modelo)+'</td><td>'+esc(o.processo)+'</td><td class="num">'+nInt(o.tokens_in)+'</td><td class="num">'+nInt(o.tokens_out)+'</td><td class="num">'+nInt(o.tokens_cache)+'</td><td class="num">'+nInt(o.imagens)+'</td><td class="num">'+brl(o.custo_brl,4)+'</td><td class="num">'+N(o.tempo).toLocaleString("pt-BR",{maximumFractionDigits:1})+'</td></tr>';}).join("");
}
async function zerar(){if(!confirm("Apagar TODO o historico de gastos de IA? Nao da pra desfazer."))return;var r=await fetch(_b()+"/admin/custos/zerar",{method:"POST",headers:H()});toast(r.ok?"Historico zerado":"erro",r.ok?"ok":"err");loadLogs();start();}
start();
</script></body></html>`;
