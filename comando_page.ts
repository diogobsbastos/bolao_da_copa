import { NAV_CSS, sideHtml, NAV_JS } from "./ui.js";

export const PAGINA_COMANDO = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Centro de Comando - Bolao da Copa 26</title>
<style>
:root{--pri:#4361ee;--bg:#f3f4f8;--card:#fff;--tx:#1f2430;--mut:#7a8194;--bd:#e6e8f0;--ok:#1faa59;--no:#e23744;--am:#e0a008;}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx)}
.app{display:flex;min-height:100vh}.main{flex:1;min-width:0}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 24px;background:var(--card);border-bottom:1px solid var(--bd)}
.top h2{margin:0;font-size:18px}
.pad{padding:18px 24px 60px;max-width:1040px}
.muted{color:var(--mut);font-size:13px}
.health{display:flex;align-items:center;gap:14px;background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:14px 16px;margin-bottom:14px}
.dot{width:12px;height:12px;border-radius:50%;flex:none}
.dot.on{background:var(--ok);box-shadow:0 0 0 4px rgba(31,170,89,.18)}
.dot.off{background:var(--no);box-shadow:0 0 0 4px rgba(226,55,68,.18)}
.health b{font-weight:800}
.btn{border:0;border-radius:9px;padding:9px 14px;font-weight:700;font-size:13px;cursor:pointer;color:#fff;background:var(--pri)}
.btn.ghost{background:#eef1f6;color:var(--tx)}
.filtros{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px}
.fb{border:1px solid var(--bd);background:#fff;color:var(--mut);border-radius:999px;padding:7px 14px;font-size:12.5px;font-weight:700;cursor:pointer}
.fb.on{background:var(--pri);color:#fff;border-color:var(--pri)}
.tl{display:flex;flex-direction:column;gap:7px}
.tk{display:flex;align-items:center;gap:12px;background:var(--card);border:1px solid var(--bd);border-radius:10px;padding:10px 12px;border-left:4px solid var(--bd)}
.tk.pendente{border-left-color:#b6bdca}.tk.rodando{border-left-color:var(--pri)}.tk.concluido{border-left-color:var(--ok)}.tk.erro{border-left-color:var(--no)}.tk.ignorado{border-left-color:var(--am)}
.tk .hr{font-weight:800;font-size:14px;min-width:54px}
.tk .ico{font-size:18px;width:24px;text-align:center}
.tk .body{flex:1;min-width:0}
.tk .ac{font-weight:700;font-size:13.5px}
.tk .meta{font-size:11.5px;color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.jgline{font-size:13px;color:var(--tx);margin:2px 0 3px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}.jgline b{color:var(--mut);font-weight:700}.ko{font-size:11px;font-weight:700;color:#2a44b8;background:#eef6ff;padding:2px 8px;border-radius:6px;margin-left:4px}.fl{width:20px;height:14px;object-fit:cover;border-radius:2px;background:#e6e8f0}
.cat{display:inline-block;font-size:10px;font-weight:800;padding:2px 7px;border-radius:6px;background:#eef1f6;color:#5a6275;margin-right:6px}
.st{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:800;padding:3px 9px;border-radius:999px;white-space:nowrap}
.st.pendente{background:#eef1f6;color:#5a6275}.st.rodando{background:#e6ecff;color:#2a44b8}.st.concluido{background:#e6f7ee;color:#0f7a45}.st.erro{background:#fdeaec;color:#b4232f}.st.ignorado{background:#fdf3e0;color:#9a6a00}
.fonte{display:inline-block;font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;background:#eef6ff;color:#2a44b8;margin-right:6px}
.act{border:1px solid var(--bd);background:#fff;border-radius:7px;padding:5px 9px;font-size:11px;font-weight:700;cursor:pointer;color:var(--pri)}
.spin{display:inline-block;width:9px;height:9px;border:2px solid #2a44b8;border-top-color:transparent;border-radius:50%;animation:sp 1s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
${NAV_CSS}
</style></head><body>
<div class="app">
 ${sideHtml("comando")}
 <main class="main">
  <div class="top"><h2>&#129302; Centro de Comando</h2><span id="conn" class="muted">conectando...</span></div>
  <div class="pad">
   <div class="health">
    <span class="dot off" id="rdot"></span>
    <div><b id="rstat">Robo: verificando...</b><div class="muted" id="rsub">&mdash;</div></div>
    <span style="flex:1"></span>
    <button class="btn ghost" onclick="gerar()">Gerar tarefas dos jogos</button>
    <button class="btn" onclick="load()">Atualizar</button>
   </div>
   <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
    <button class="btn ghost" onclick="shiftDia(-1)">&#9664;</button>
    <b id="diaLabel" style="font-size:15px;min-width:150px;text-align:center;text-transform:capitalize">hoje</b>
    <button class="btn ghost" onclick="shiftDia(1)">&#9654;</button>
    <button class="btn ghost" onclick="hojeDia()">Hoje</button>
   </div>
   <div class="filtros" id="filtros">
    <button class="fb on" data-c="Todos" onclick="setCat('Todos')">Todos</button>
    <button class="fb" data-c="Jogos" onclick="setCat('Jogos')">Jogos</button>
    <button class="fb" data-c="Pontuacao" onclick="setCat('Pontuacao')">Pontuacao</button>
    <button class="fb" data-c="Diario" onclick="setCat('Diario')">Diarios</button>
    <button class="fb" data-c="Arena" onclick="setCat('Arena')">Arenas</button>
   </div>
   <div id="tl" class="tl"><div class="muted">carregando...</div></div>
  </div>
 </main>
</div>
<script>
${NAV_JS}
var CAT="Todos";
var STLAB={pendente:"pendente",rodando:"rodando",concluido:"concluido",erro:"erro",ignorado:"a construir"};
var diaDate=new Date();
function ymdBRT(d){return d.toLocaleDateString("sv-SE",{timeZone:"America/Sao_Paulo"});}
function labelBRT(d){return d.toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"2-digit",timeZone:"America/Sao_Paulo"});}
function shiftDia(n){diaDate.setDate(diaDate.getDate()+n);load();}
function hojeDia(){diaDate=new Date();load();}
function H(){var h={"content-type":"application/json"};var s=localStorage.getItem("sessao");if(s){h["authorization"]="Bearer "+s;}return h;}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function fl(iso){return iso?('<img class="fl" src="https://flagcdn.com/w40/'+iso+'.png" onerror="this.style.opacity=.2">'):"";}
function hhmm(s){var d=new Date(s);if(isNaN(d))return "--:--";return d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});}
var ICO={atualizar_dados_jogo:"\u{1F504}",auto_preencher:"\u{1F916}",coletar_resultado:"\u{1F3C1}",atualizar_odds:"\u{1F4B9}",gerar_noticias:"\u{1F4F0}",injetar_tokens:"\u{1FA99}",liquidar_bets:"\u{1F3B0}",arena_resolver:"\u{2694}",regua_figurinhas:"\u{1F0CF}",confirmar_agenda:"\u{1F4C5}"};
var ROT={atualizar_dados_jogo:"Atualizar dados do jogo",auto_preencher:"Auto-preencher palpites",coletar_resultado:"Coletar resultado + apurar",atualizar_odds:"Atualizar odds",gerar_noticias:"Gerar noticias (IA)",injetar_tokens:"Injetar tokens diarios",liquidar_bets:"Liquidar Bets",arena_resolver:"Resolver Arenas",regua_figurinhas:"Regua de notas",confirmar_agenda:"Confirmar agenda (horarios reais)"};
function setCat(c){CAT=c;[].forEach.call(document.querySelectorAll(".fb"),function(b){b.classList.toggle("on",b.getAttribute("data-c")===c);});load();}
function saude(lastTick,agora){
 var d=document.getElementById("rdot"),s=document.getElementById("rstat"),sub=document.getElementById("rsub");
 if(!lastTick){d.className="dot off";s.textContent="Robo: sem verificacao ainda";sub.textContent="aguardando o primeiro tick (ate 1 min)";return;}
 var difS=Math.round((new Date(agora)-new Date(lastTick))/1000);
 var on=difS<120;d.className="dot "+(on?"on":"off");
 s.textContent=on?"Robo ATIVO":"Robo parado?";
 sub.textContent="ultima verificacao ha "+(difS<0?0:difS)+" seg";
}
async function load(){
 var c=document.getElementById("conn");
 var dia=ymdBRT(diaDate);var dl=document.getElementById("diaLabel");if(dl)dl.textContent=labelBRT(diaDate);
 var r=await fetch(_b()+"/admin/comando/tarefas?dia="+dia+"&cat="+encodeURIComponent(CAT),{headers:H()});
 if(!r.ok){c.textContent="faca login no /admin";c.style.color="#e23744";return;}
 c.textContent="conectado";c.style.color="#1faa59";
 var d=await r.json();saude(d.lastTick,d.agora);
 var ts=d.tarefas||[];var T=document.getElementById("tl");
 if(!ts.length){T.innerHTML='<div class="muted" style="padding:8px 2px">nenhuma tarefa nesse dia.</div>';return;}
 T.innerHTML=ts.map(function(t){
  var st=t.status;
  var stHtml=(st==="rodando")?'<span class="st rodando"><span class="spin"></span>rodando</span>':'<span class="st '+st+'">'+(STLAB[st]||st)+'</span>';
  var acts="";
  if(st==="erro")acts='<button class="act" onclick="retry('+t.id+')">tentar de novo</button>';
  else if(st==="pendente")acts='<button class="act" onclick="rodar('+t.id+')">rodar agora</button>';
  var meta='<span class="cat">'+esc(t.categoria)+'</span><span class="fonte">'+esc(t.fonte||"\u2014")+'</span>'+(t.tentativas?("tent. "+t.tentativas+" · "):"")+(t.log?esc(String(t.log).slice(0,80)):"agendada");
  var jogoHtml=t.jogo?('<div class="jgline">'+fl(t.jogo.casa_iso)+esc(t.jogo.casa_pt)+' <b>x</b> '+esc(t.jogo.visit_pt)+fl(t.jogo.visit_iso)+'<span class="ko">apito '+hhmm(t.jogo.inicio)+'</span></div>'):'';
  return '<div class="tk '+st+'"><span class="hr">'+hhmm(t.horario_gatilho)+'</span>'
   +'<span class="ico">'+(ICO[t.acao]||"⚙")+'</span>'
   +'<div class="body"><div class="ac">'+esc(ROT[t.acao]||t.acao)+'</div>'+jogoHtml+'<div class="meta">'+meta+'</div></div>'
   +stHtml+acts+'</div>';
 }).join("");
}
async function retry(id){await fetch(_b()+"/admin/comando/retry",{method:"POST",headers:H(),body:JSON.stringify({id:id})});load();}
async function rodar(id){await fetch(_b()+"/admin/comando/rodar-agora",{method:"POST",headers:H(),body:JSON.stringify({id:id})});setTimeout(load,800);}
async function gerar(){var b=event.target;b.textContent="gerando...";await fetch(_b()+"/admin/comando/gerar",{method:"POST",headers:H()});b.textContent="Gerar tarefas dos jogos";load();}
load();setInterval(load,20000);
</script></body></html>`;
