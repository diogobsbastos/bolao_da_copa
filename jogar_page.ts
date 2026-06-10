export const PAGINA_JOGAR = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bolão da Copa 26</title>
<style>
:root{--pri:#14794a;--pri2:#1faa59;--bg:#0e1117;--card:#171c26;--card2:#1f2633;--tx:#eef1f6;--mut:#94a0b4;--bd:#283142;--gold:#f5c451;--no:#e23744;--bgrad:radial-gradient(120% 110% at 50% -10%,#0b3d2e 0%,#0a1228 48%,#080d18 100%);--panel:rgba(16,21,30,.80);--surface:rgba(23,28,38,.66);--surface2:rgba(255,255,255,.06);--flagbg:#2a3142;}
body.light{--card:#ffffff;--card2:#eef1f8;--tx:#1b2230;--mut:#5d6678;--bd:#e2e6f0;--bgrad:radial-gradient(120% 110% at 50% -10%,#e7f4ec 0%,#eef1f8 45%,#e6ebf3 100%);--panel:rgba(255,255,255,.90);--surface:#ffffff;--surface2:#eef1f8;--flagbg:#e6e8f0;}
.tgl{background:var(--surface2);border:1px solid var(--bd);color:var(--tx);width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:15px;flex:none;display:flex;align-items:center;justify-content:center}
*{box-sizing:border-box}html,body{margin:0}body{font-family:system-ui,Segoe UI,Roboto,sans-serif;background:var(--bgrad) fixed;color:var(--tx);min-height:100vh;-webkit-tap-highlight-color:transparent}
a{color:inherit;text-decoration:none}
.top{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:10px;padding:8px 14px;background:var(--panel);backdrop-filter:blur(8px);border-bottom:1px solid var(--bd)}
.burger{font-size:22px;background:none;border:0;color:var(--tx);cursor:pointer;display:none}
.brand{font-weight:800;font-size:15px;white-space:nowrap}
.brand b{color:var(--pri2)}
.wallets{display:flex;gap:6px;margin-left:auto;flex-wrap:wrap;justify-content:flex-end}
.w{display:flex;align-items:center;gap:5px;background:var(--card2);border:1px solid var(--bd);border-radius:999px;padding:5px 10px;font-size:12px;font-weight:700}
.w small{color:var(--mut);font-weight:600}
.av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--pri),var(--pri2));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;cursor:pointer;flex:none}
.layout{display:flex;min-height:calc(100vh - 55px)}
.side{width:186px;flex:none;background:var(--panel);backdrop-filter:blur(8px);border-right:1px solid var(--bd);padding:10px 7px;display:flex;flex-direction:column;gap:2px}
.side a{display:flex;align-items:center;gap:9px;padding:8px 11px;border-radius:9px;font-weight:600;font-size:13.5px;color:var(--mut);cursor:pointer}
.side a .ic{width:20px;text-align:center}
.side a:hover{background:var(--card)}
.side a.on{background:var(--pri);color:#fff}
.side a.soon{opacity:.5;cursor:not-allowed}
.side a .tag{margin-left:auto;font-size:9px;background:var(--bd);color:var(--mut);padding:2px 6px;border-radius:6px}
.main{flex:1;min-width:0;padding:16px;max-width:840px}
.sec{display:none}.sec.on{display:block;animation:fade .25s ease}
@keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
h1{font-size:18px;margin:0 0 12px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
.card{background:var(--surface);border:1px solid var(--bd);border-radius:12px;padding:13px}
.card h3{margin:0 0 3px;font-size:12px;color:var(--mut);font-weight:700}
.stat{font-size:22px;font-weight:800}
.btn{background:var(--pri);color:#fff;border:0;border-radius:10px;padding:11px 16px;font-weight:800;cursor:pointer;font-size:14px}
.btn.ghost{background:var(--card2);color:var(--tx);border:1px solid var(--bd)}
.btn:disabled{opacity:.5;cursor:not-allowed}
.muted{color:var(--mut);font-size:13px}
.flag{width:22px;height:16px;border-radius:3px;object-fit:cover;vertical-align:middle;background:var(--card2)}
.jrow{display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:10px;margin-bottom:8px}
.jteam{display:flex;align-items:center;gap:7px;flex:1;min-width:0;font-weight:600;font-size:14px}
.jteam.r{justify-content:flex-end;text-align:right}
.jteam span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pin{width:38px;text-align:center;background:var(--card2);border:1px solid var(--bd);color:var(--tx);border-radius:8px;padding:8px 0;font-size:16px;font-weight:800}
.pin:disabled{opacity:.6}
.tabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}
.tab{padding:8px 14px;border-radius:999px;background:var(--card2);border:1px solid var(--bd);color:var(--mut);font-weight:700;font-size:13px;cursor:pointer}
.tab.on{background:var(--pri);color:#fff;border-color:var(--pri)}
.lock{font-size:11px;color:var(--no);font-weight:700}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{padding:8px 8px;border-bottom:1px solid var(--bd);text-align:left}th{color:var(--mut);font-size:11px}
.rkme{background:rgba(31,170,89,.14)}
.pos{font-weight:800;width:30px}
.medal{font-size:15px}
.qr{width:190px;height:190px;border-radius:12px;background:
 repeating-linear-gradient(90deg,#fff 0 8px,#0e1117 8px 16px),
 repeating-linear-gradient(0deg,rgba(0,0,0,0) 0 8px,rgba(255,255,255,.0) 8px 16px);
 border:8px solid #fff;margin:10px auto;display:flex;align-items:center;justify-content:center}
.qr b{background:#fff;color:#000;padding:4px 8px;border-radius:6px;font-size:11px}
.pack{border:1px solid var(--bd);border-radius:14px;padding:16px;background:linear-gradient(160deg,var(--card2),var(--card))}
.pack.base{border-color:var(--gold)}
.toast{position:fixed;top:14px;right:14px;z-index:60;background:#10151e;border:1px solid var(--bd);border-left:4px solid var(--pri2);padding:11px 15px;border-radius:10px;font-size:13px;box-shadow:0 10px 30px rgba(0,0,0,.4);max-width:300px}
.toast.err{border-left-color:var(--no)}
.scrim{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:25}
@media(max-width:760px){
 .side{position:fixed;top:55px;bottom:0;left:0;z-index:40;transform:translateX(-100%);transition:.2s}
 .side.open{transform:none}.burger{display:block}.scrim.open{display:block}.main{padding:14px}
 .brand{font-size:13px}.w{padding:4px 8px}
}
.diah{font-size:11px;font-weight:800;letter-spacing:.4px;color:var(--mut);text-transform:uppercase;margin:16px 0 8px}
.jgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:10px}
.jogo{background:var(--surface);border:1px solid var(--bd);border-radius:12px;overflow:hidden;display:flex;align-items:stretch}
.gtab{writing-mode:vertical-rl;transform:rotate(180deg);background:var(--rc,var(--pri));color:#fff;font-weight:800;font-size:10px;letter-spacing:2px;padding:8px 6px;display:flex;align-items:center;justify-content:center;flex:none}
.jbody{flex:1;min-width:0;display:grid;grid-template-columns:1.4fr auto 0.9fr;align-items:center;column-gap:8px;row-gap:9px;padding:10px 12px}
.cn{display:flex;align-items:center;gap:8px;min-width:0;overflow:hidden}
.cs{display:flex;align-items:center;gap:6px;justify-self:center}
.cm{justify-self:end;display:flex;align-items:center}.cmtop{gap:10px}.cmbot{gap:5px}
.nm{flex:1;font-size:13.5px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.jflag{width:26px;height:19px;border-radius:3px;object-fit:cover;background:var(--flagbg);flex:none}
.pl{width:46px;text-align:center;font-size:16px;font-weight:800;padding:6px 5px;border:1px solid var(--bd);border-radius:8px;flex:none;background:var(--surface2);color:var(--tx);-moz-appearance:textfield}
.pl::-webkit-inner-spin-button,.pl::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.pl:disabled{opacity:.5}
.step{display:flex;flex-direction:column;gap:2px;flex:none}
.su{background:var(--surface2);color:var(--mut);border:0;border-radius:4px;width:16px;height:13px;font-size:7px;line-height:1;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center}.su:hover{background:var(--rc,var(--pri));color:#fff}
.fav{display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:13px;color:var(--tx);font-weight:700}.fav i{font-style:normal;font-size:9px;font-weight:800;color:var(--mut)}.fav .jflag{width:22px;height:16px}
.tag{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;background:var(--surface2);color:var(--pri2)}.tag.lk{color:var(--no)}
.o365sm{height:19px;width:auto;border-radius:3px;cursor:pointer;transition:.15s}.o365sm:hover{transform:scale(1.12)}
.mov{position:fixed;inset:0;background:rgba(8,12,24,.6);backdrop-filter:blur(3px);display:none;align-items:center;justify-content:center;z-index:100;padding:18px}
.mov.show{display:flex}
.modal{position:relative;background:var(--surface);border:1px solid var(--bd);border-radius:16px;padding:18px;max-width:480px;width:100%;box-shadow:0 24px 70px rgba(0,0,0,.45);max-height:86vh;overflow:auto;scrollbar-width:thin;scrollbar-color:var(--pri) transparent}
.modal::-webkit-scrollbar{width:8px}.modal::-webkit-scrollbar-thumb{background:var(--pri);border-radius:8px}
.modal h3{margin:0 0 6px;font-size:16px;display:flex;align-items:center;gap:9px}
.mx{position:absolute;top:9px;right:11px;background:transparent;color:var(--mut);border:0;font-size:24px;line-height:1;cursor:pointer;padding:0 6px;font-weight:700}.mx:hover{color:var(--tx)}
.cols{display:flex;gap:16px;align-items:flex-start}.col{flex:1;min-width:0}
@media(max-width:680px){.cols{flex-direction:column}}
.rk{display:inline-block;background:var(--pri);color:#fff;border-radius:8px;padding:2px 9px;font-weight:800;font-size:12px}
.mr{display:flex;align-items:center;gap:9px;padding:9px 4px;border-bottom:1px solid var(--bd);font-size:13px}
.mr .flag{width:22px;height:16px}
.od{margin-left:auto;font-size:11px;color:var(--mut);text-align:right;white-space:nowrap}
.bdg{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:#fff;flex:none}
.bV{background:#14794a}.bD{background:#c01f2e}.bE{background:#9a6b00}.b-{background:#9aa0ad}
.pf{width:26px;height:34px;object-fit:cover;border-radius:4px;background:var(--flagbg);flex:none}.pf.nopf{display:inline-flex;align-items:center;justify-content:center;font-size:15px;color:var(--mut)}
.lkbtn{display:inline-block;background:var(--surface2);color:var(--pri2);font-weight:700;font-size:11px;padding:4px 11px;border-radius:999px;text-decoration:none;white-space:nowrap;margin-left:8px}
.s365link{display:flex;align-items:center;justify-content:center;margin-top:14px;padding:9px 10px;background:var(--surface2);border-radius:10px;color:var(--pri2);font-weight:700;font-size:12px;text-decoration:none}.s365link:hover{background:var(--pri);color:#fff}
.o365sm{height:19px;width:auto;border-radius:3px;cursor:pointer;transition:.15s}.o365sm:hover{transform:scale(1.12)}
.sbtn{background:var(--surface2);color:var(--pri2);border:0;border-radius:6px;width:26px;height:26px;font-size:12px;cursor:pointer;flex:none}.sbtn:hover{background:var(--pri);color:#fff}
.jfav{cursor:pointer}
</style></head><body>
<div class="top">
 <button class="burger" onclick="drawer()">&#9776;</button>
 <div class="brand">&#9917; Bol&atilde;o <b>Copa 26</b></div>
 <div class="wallets">
  <span class="w" title="Colecionador">&#129689; <span id="w-col">0</span></span>
  <span class="w" title="Apostas">&#127919; <span id="w-apo">0</span></span>
  <span class="w" title="Arena">&#9876; <span id="w-are">0</span></span>
  <button class="tgl" id="tgl" onclick="tema()" title="Tema claro/escuro">&#127769;</button>
  <span class="av" id="av" onclick="nav('perfil')" title="Perfil">?</span>
 </div>
</div>
<div class="layout">
 <nav class="side" id="side">
  <a class="on" data-s="dash" onclick="nav('dash')"><span class="ic">&#127968;</span> In&iacute;cio</a>
  <a data-s="bolao" onclick="nav('bolao')"><span class="ic">&#9917;</span> Bol&atilde;o</a>
  <a data-s="time" onclick="nav('time')"><span class="ic">&#127183;</span> Meu Time</a>
  <a data-s="copa" onclick="nav('copa')"><span class="ic">&#127758;</span> Copa do Mundo</a>
  <a data-s="market" onclick="nav('market')"><span class="ic">&#128722;</span> Marketplace</a>
  <a data-s="arena" onclick="nav('arena')"><span class="ic">&#9876;</span> Arena</a>
  <a data-s="rank" onclick="nav('rank')"><span class="ic">&#127942;</span> Ranking</a>
  <a data-s="deposito" onclick="nav('deposito')"><span class="ic">&#128179;</span> Dep&oacute;sito</a>
  <a class="soon"><span class="ic">&#127920;</span> Bet <span class="tag">Em breve</span></a>
  <a onclick="sair()" style="margin-top:auto"><span class="ic">&#128682;</span> Sair</a>
 </nav>
 <div class="scrim" id="scrim" onclick="drawer()"></div>
 <main class="main">

  <section class="sec on" id="s-dash">
   <h1>Ol&aacute;, <span id="nome">jogador</span> &#128075;</h1>
   <div class="grid">
    <div class="card"><h3>Saldo total</h3><div class="stat" id="d-saldo">0</div><div class="muted">tokens nas 3 carteiras</div></div>
    <div class="card"><h3>Sua posi&ccedil;&atilde;o</h3><div class="stat" id="d-pos">-</div><div class="muted"><span id="d-pts">0</span> pts no bol&atilde;o</div></div>
    <div class="card"><h3>Palpites pendentes</h3><div class="stat" id="d-pend">0</div><div class="muted">jogos sem palpite</div></div>
   </div>
   <div class="card" style="margin-top:14px" id="d-prox"><h3>Pr&oacute;ximo jogo</h3><div class="muted">carregando...</div></div>
   <div style="margin-top:14px"><button class="btn" onclick="nav('bolao')">&#9917; Palpitar agora</button></div>
  </section>

  <section class="sec" id="s-bolao">
   <h1>Bol&atilde;o &mdash; palpite da rodada</h1>
   <div class="muted" style="margin-bottom:10px">Coloque o placar que voc&ecirc; acha. Risco zero: erro n&atilde;o tira token, acerto soma pontos no ranking. Trava no apito.</div>
   <div class="tabs" id="bolao-tabs"><span class="tab on" data-r="1" onclick="loadBolao(1)">Rodada 1</span><span class="tab" data-r="2" onclick="loadBolao(2)">Rodada 2</span><span class="tab" data-r="3" onclick="loadBolao(3)">Rodada 3</span></div>
   <div style="margin-bottom:10px"><button class="btn ghost" id="btn-auto" onclick="preencherAuto()">&#127919; Preencher pela l&oacute;gica das odds</button></div>
   <div id="bolao-box" class="muted">carregando...</div>
  </section>

  <section class="sec" id="s-time">
   <h1>Meu Time</h1>
   <div class="card"><div class="muted">Aqui ficar&atilde;o suas figurinhas e a escala&ccedil;&atilde;o dos 11 (1 GOL, 2 ZAG, 2 LAT, 4 MEI, 2 ATA). Voc&ecirc; monta seu time com as cartas e ele luta na Arena.</div>
    <div style="margin-top:12px"><button class="btn" onclick="nav('market')">Pegar meu Pacote Base</button></div></div>
  </section>

  <section class="sec" id="s-copa">
   <h1>Copa do Mundo 2026</h1>
   <div class="muted" style="margin-bottom:10px">EUA &middot; Canad&aacute; &middot; M&eacute;xico &mdash; 11/jun a 19/jul</div>
   <div id="copa-box" class="muted">carregando...</div>
  </section>

  <section class="sec" id="s-market">
   <h1>Marketplace</h1>
   <div class="grid">
    <div class="pack base"><h3 style="margin:0 0 6px;color:var(--gold)">&#11088; Pacote Base</h3><div class="muted">11 cartas garantidas (1 GOL, 2 ZAG, 2 LAT, 4 MEI, 2 ATA). Seu time inicial pra j&aacute; poder jogar.</div><div style="margin-top:12px"><button class="btn" onclick="toast('Pacote Base sai pelo Dep&oacute;sito (R$10) ou cortesia &mdash; em montagem.')">Abrir Base</button></div></div>
    <div class="pack"><h3 style="margin:0 0 6px">&#127183; Pacote Comum &mdash; 50</h3><div class="muted">5 cartas 100% aleat&oacute;rias.</div><div style="margin-top:12px"><button class="btn ghost" onclick="toast('Em montagem.')">Comprar</button></div></div>
    <div class="pack"><h3 style="margin:0 0 6px">&#127919; Pacote Posicional &mdash; 100</h3><div class="muted">3 cartas de um setor que voc&ecirc; escolhe.</div><div style="margin-top:12px"><button class="btn ghost" onclick="toast('Em montagem.')">Comprar</button></div></div>
   </div>
   <div class="muted" style="margin-top:12px">Unboxing animado e invent&aacute;rio entram na pr&oacute;xima rodada de desenvolvimento.</div>
  </section>

  <section class="sec" id="s-arena">
   <h1>Arena &mdash; Batalha de Times</h1>
   <div class="card"><div class="muted">Desafie outros jogadores por soma das notas do seu elenco. Se voc&ecirc; n&atilde;o desafiar ningu&eacute;m, o sistema marca um <b>jogo obrigat&oacute;rio</b> usando sua escala&ccedil;&atilde;o atual.</div>
    <div style="margin-top:12px"><button class="btn" onclick="toast('Arena em montagem.')">Procurar advers&aacute;rio</button></div></div>
  </section>

  <section class="sec" id="s-rank">
   <h1>Ranking do Bol&atilde;o</h1>
   <div id="rank-box" class="muted">carregando...</div>
  </section>

  <section class="sec" id="s-deposito">
   <h1>Dep&oacute;sito</h1>
   <div class="card" style="text-align:center">
    <div style="font-weight:800;font-size:16px">R$ 10,00 &rarr; Pacote Base</div>
    <div class="muted" style="margin-top:4px">Pague via PIX e receba seu time inicial de 11 cartas.</div>
    <div class="qr"><b>QR de teste</b></div>
    <div class="muted">PIX de teste &mdash; integra&ccedil;&atilde;o real ainda n&atilde;o ligada.</div>
    <div style="margin-top:12px"><button class="btn" onclick="toast('Simula&ccedil;&atilde;o: pagamento confirmado (teste).')">J&aacute; paguei (simular)</button></div>
   </div>
   <div class="card" style="margin-top:12px"><h3>Como funciona</h3><div class="muted">No cadastro voc&ecirc; j&aacute; recebe 500 tokens (200 Colecionador / 200 Apostas / 100 Arena) e a cada rodada +50. O dep&oacute;sito serve pra adquirir o Pacote Base e conte&uacute;do do &aacute;lbum.</div></div>
  </section>

  <section class="sec" id="s-perfil">
   <h1>Perfil</h1>
   <div class="card"><div><b id="p-nome"></b></div><div class="muted" id="p-email"></div>
    <div style="margin-top:12px;display:flex;gap:18px">
     <div><div class="muted">Colecionador</div><div class="stat" id="p-col" style="font-size:20px">0</div></div>
     <div><div class="muted">Apostas</div><div class="stat" id="p-apo" style="font-size:20px">0</div></div>
     <div><div class="muted">Arena</div><div class="stat" id="p-are" style="font-size:20px">0</div></div>
    </div>
    <div style="margin-top:14px"><button class="btn ghost" onclick="sair()">Sair da conta</button></div>
   </div>
  </section>

 </main>
</div>
<div class="mov" id="mov" onclick="if(event.target===this)fecha()"><div class="modal"><button class="mx" onclick="fecha()" title="Fechar">&times;</button><div id="mbody"></div><div id="mfoot" style="margin-top:12px;text-align:right"></div></div></div>
<script>
var BASE=location.pathname.replace(/\\/jogar.*$/,"");
var TOKEN=localStorage.getItem("sessao");
var CURROD=1;
function H(){return {"content-type":"application/json","authorization":"Bearer "+TOKEN};}
function esc(v){return String(v==null?"":v).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];});}
function fl(iso){return iso?('<img class="flag" src="https://flagcdn.com/32x24/'+iso+'.png" onerror="this.style.visibility=\\'hidden\\'">'):'<span class="flag"></span>';}
function toast(msg,err){var t=document.createElement("div");t.className="toast"+(err?" err":"");t.innerHTML=msg;document.body.appendChild(t);setTimeout(function(){t.remove();},3200);}
function drawer(){document.getElementById("side").classList.toggle("open");document.getElementById("scrim").classList.toggle("open");}
function sair(){localStorage.removeItem("sessao");localStorage.removeItem("papel");location.href=(BASE||"")+"/";}
function fmtData(s){if(!s)return"";var d=new Date(s);if(isNaN(d))return"";return d.toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});}
function nav(sec){
 document.querySelectorAll(".side a[data-s]").forEach(function(a){a.classList.toggle("on",a.getAttribute("data-s")===sec);});
 document.querySelectorAll(".sec").forEach(function(s){s.classList.remove("on");});
 var el=document.getElementById("s-"+sec);if(el)el.classList.add("on");
 if(window.innerWidth<=760){document.getElementById("side").classList.remove("open");document.getElementById("scrim").classList.remove("open");}
 if(sec==="bolao")loadBolao(CURROD);
 if(sec==="rank")loadRank();
 if(sec==="copa")loadCopa();
}
async function loadDados(){
 var r=await fetch(BASE+"/jogar/dados",{headers:H()});
 if(r.status===401){location.href=(BASE||"")+"/";return;}
 var d=await r.json();var c=d.carteiras||{};var me=d.me||{};
 document.getElementById("w-col").textContent=c.colecionador;
 document.getElementById("w-apo").textContent=c.apostas;
 document.getElementById("w-are").textContent=c.arena;
 var nome=me.nome||"jogador";
 document.getElementById("nome").textContent=nome.split(" ")[0];
 document.getElementById("av").textContent=(nome.trim()[0]||"?").toUpperCase();
 document.getElementById("d-saldo").textContent=(c.colecionador+c.apostas+c.arena);
 document.getElementById("d-pos").textContent=d.ranking&&d.ranking.pos?("#"+d.ranking.pos):"-";
 document.getElementById("d-pts").textContent=(d.ranking&&d.ranking.pontos)||0;
 document.getElementById("d-pend").textContent=d.palpitesPendentes||0;
 var pb=document.getElementById("d-prox");
 if(d.proximo){var p=d.proximo;pb.innerHTML='<h3>Pr&oacute;ximo jogo &middot; Rodada '+(p.rodada||"-")+'</h3><div style="display:flex;align-items:center;gap:8px;font-weight:700;margin-top:6px">'+fl(p.casa.iso)+' '+esc(p.casa.pt)+' <span class="muted">x</span> '+esc(p.visitante.pt)+' '+fl(p.visitante.iso)+'</div><div class="muted" style="margin-top:4px">'+fmtData(p.inicio)+'</div>';}
 else{pb.innerHTML='<h3>Pr&oacute;ximo jogo</h3><div class="muted">sem jogos futuros agora.</div>';}
 document.getElementById("p-nome").textContent=nome;
 document.getElementById("p-email").textContent=me.email||"";
 document.getElementById("p-col").textContent=c.colecionador;
 document.getElementById("p-apo").textContent=c.apostas;
 document.getElementById("p-are").textContent=c.arena;
}
var COR_ROD={1:"#14a06a",2:"#e0a008",3:"#e23744"};
function fl2(iso){return iso?('<img class="jflag" src="https://flagcdn.com/40x30/'+iso+'.png" onerror="this.style.visibility=\\'hidden\\'">'):'<span class="jflag"></span>';}
function fmtDia(s){if(!s)return"";var d=new Date(s);if(isNaN(d))return"";var w=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];return w[d.getDay()]+", "+("0"+d.getDate()).slice(-2)+"/"+("0"+(d.getMonth()+1)).slice(-2);}
function fmtHora(s){if(!s)return"";var d=new Date(s);if(isNaN(d))return"";return ("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2);}
function favOdds(j){if(!j.odds)return"";var c=parseFloat(j.odds.casa),x=parseFloat(j.odds.empate),f=parseFloat(j.odds.fora);var ar=[["c",c],["e",x],["f",f]].filter(function(a){return !isNaN(a[1]);});if(!ar.length)return"";ar.sort(function(a,b){return a[1]-b[1];});var b=ar[0][0];var inner;if(b==="c")inner='<i>FAV</i>'+fl2(j.casa.iso)+'<b>'+esc(j.odds.casa)+'</b>';else if(b==="f")inner='<i>FAV</i>'+fl2(j.visitante.iso)+'<b>'+esc(j.odds.fora)+'</b>';else inner='<i>EMP</i><b>'+esc(j.odds.empate)+'</b>';return '<span class="fav" onclick="odds('+j.id+')" title="ver odds">'+inner+'</span>';}
function cardBolao(j,cor){
 var dis=j.travado?"disabled":"";
 var pc=(j.meu&&j.meu.pc!=null)?j.meu.pc:"";var pv=(j.meu&&j.meu.pv!=null)?j.meu.pv:"";
 function cn(tm){return '<div class="cn">'+fl2(tm.iso)+'<span class="nm">'+esc(tm.pt)+'</span></div>';}
 function cs(casa,val){var fld=casa?"pc":"pv";var en=casa?j.casa.en:j.visitante.en;var step=j.travado?"":'<span class="step"><button class="su" onclick="stp('+j.id+','+(casa?1:0)+',1)">&#9650;</button><button class="su" onclick="stp('+j.id+','+(casa?1:0)+',-1)">&#9660;</button></span>';return '<div class="cs"><button class="sbtn" title="Stats e notícias" onclick="info(&#39;'+esc(en)+'&#39;)">&#128202;</button><input class="pl" id="'+fld+'-'+j.id+'" type="number" min="0" max="99" value="'+val+'" '+dis+' onchange="salvar('+j.id+')">'+step+'</div>';}
 var ball=(j.odds&&/365/.test(j.odds.fonte||""))?('<img class="o365sm" src="'+S365LOGO+'" title="ver odds (365scores)" onclick="odds('+j.id+')">'):"";
 var tag=j.travado?'<span class="tag lk">&#128274; fechado</span>':'<span class="tag">&#128336; '+esc(fmtHora(j.inicio))+'</span>';
 var gt='<div class="gtab">GRUPO '+esc(j.grupo||"")+'</div>';
 var jb='<div class="jbody">'+cn(j.casa)+cs(1,pc)+'<div class="cm cmtop">'+tag+ball+'</div>'+cn(j.visitante)+cs(0,pv)+'<div class="cm cmbot">'+favOdds(j)+'</div></div>';
 return '<div class="jogo" style="--rc:'+cor+'">'+gt+jb+'</div>';
}
async function loadBolao(rod){
 CURROD=rod;
 document.querySelectorAll("#bolao-tabs .tab").forEach(function(t){var rr=+t.getAttribute("data-r");var cc=COR_ROD[rr]||"#14794a";var on=rr===rod;t.classList.toggle("on",on);t.style.background=on?cc:"transparent";t.style.borderColor=on?cc:"var(--bd)";t.style.color=on?"#fff":cc;});var _ba=document.getElementById("btn-auto");if(_ba){var _c=COR_ROD[rod]||"#14794a";_ba.style.background=_c;_ba.style.borderColor=_c;_ba.style.color="#fff";}
 var box=document.getElementById("bolao-box");box.textContent="carregando...";
 var r=await fetch(BASE+"/jogar/bolao?rodada="+rod,{headers:H()});
 var d=await r.json();if(!d||!d.ok){box.textContent="erro ao carregar.";return;}
 JOGOS_BOLAO=d.jogos||[];
 if(!d.jogos.length){box.innerHTML='<div class="muted">sem jogos nesta rodada.</div>';return;}
 var cor=COR_ROD[rod]||"#14794a";var html="",dia="";
 d.jogos.forEach(function(j){var dd=fmtDia(j.inicio);if(dd!==dia){if(dia)html+="</div>";dia=dd;html+='<div class="diah">Fase de grupos &middot; '+esc(dd)+'</div><div class="jgrid">';}html+=cardBolao(j,cor);});
 if(dia)html+="</div>";
 box.innerHTML=html;
}
function stp(id,casa,dd){var e=document.getElementById((casa?"pc-":"pv-")+id);if(!e||e.disabled)return;var v=(parseInt(e.value)||0)+dd;if(v<0)v=0;if(v>99)v=99;e.value=v;salvar(id);}
async function salvar(id){
 var a=document.getElementById("pc-"+id),b=document.getElementById("pv-"+id);if(!a||!b)return;
 var pc=a.value,pv=b.value;if(pc===""||pv==="")return;
 var r=await fetch(BASE+"/jogar/palpite",{method:"POST",headers:H(),body:JSON.stringify({jogo_id:id,pc:+pc,pv:+pv})});
 var d=await r.json();
 if(d&&d.ok){toast("Palpite salvo");loadDados();}else{toast((d&&d.erro)||"erro",1);}
}
async function preencherAuto(){
 var r=await fetch(BASE+"/jogar/palpite-auto",{method:"POST",headers:H(),body:JSON.stringify({rodada:CURROD})});
 var d=await r.json();
 if(d&&d.ok){toast("Preenchido pela l&oacute;gica: "+d.preenchidos+" jogos");loadBolao(CURROD);loadDados();}else{toast("erro",1);}
}
async function loadRank(){
 var box=document.getElementById("rank-box");box.textContent="carregando...";
 var r=await fetch(BASE+"/jogar/ranking",{headers:H()});var d=await r.json();
 if(!d||!d.ok||!d.ranking.length){box.innerHTML='<div class="muted">ranking ainda vazio. Palpite na Rodada 1!</div>';return;}
 var med=["&#129351;","&#129352;","&#129353;"];
 box.innerHTML='<table><thead><tr><th>#</th><th>Jogador</th><th style="text-align:right">Pts</th></tr></thead><tbody>'
  +d.ranking.map(function(x){return '<tr class="'+(x.eu?"rkme":"")+'"><td class="pos">'+(x.pos<=3?('<span class="medal">'+med[x.pos-1]+'</span>'):x.pos)+'</td><td>'+esc(x.nome)+(x.eu?' <span class="muted">(voc&ecirc;)</span>':'')+'</td><td style="text-align:right;font-weight:800">'+x.pts+'</td></tr>';}).join("")
  +'</tbody></table>';
}
async function loadCopa(){
 var box=document.getElementById("copa-box");box.textContent="carregando...";
 var r=await fetch(BASE+"/jogar/copa",{headers:H()});var d=await r.json();
 if(!d||!d.ok){box.textContent="erro.";return;}
 var h="";
 if(d.proximos&&d.proximos.length){h+='<div class="card" style="margin-bottom:14px"><h3>Pr&oacute;ximos jogos</h3>'+d.proximos.map(function(p){return '<div style="display:flex;align-items:center;gap:7px;padding:5px 0;font-size:13px">'+fl(p.casa.iso)+' '+esc(p.casa.pt)+' <span class="muted">x</span> '+esc(p.visitante.pt)+' '+fl(p.visitante.iso)+' <span class="muted" style="margin-left:auto">'+fmtData(p.inicio)+'</span></div>';}).join("")+'</div>';}
 if(d.grupos&&d.grupos.length){h+=d.grupos.map(function(g){return '<div class="card" style="margin-bottom:10px"><h3>'+esc(g.grupo)+'</h3><table><thead><tr><th>#</th><th>Sele&ccedil;&atilde;o</th><th>P</th><th>J</th><th>SG</th></tr></thead><tbody>'+g.times.map(function(t,i){return '<tr><td class="pos">'+(i+1)+'</td><td>'+fl(t.iso)+' '+esc(t.pt)+'</td><td style="font-weight:800">'+t.p+'</td><td>'+t.j+'</td><td>'+(t.sg>0?"+":"")+t.sg+'</td></tr>';}).join("")+'</tbody></table></div>';}).join("");}
 else{h+='<div class="muted">classifica&ccedil;&atilde;o aparece quando os jogos come&ccedil;arem.</div>';}
 box.innerHTML=h;
}
var S365LOGO="data:image/png;base64,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";
var CUR_EN="";var CUR_ELENCO=[];var JOGOS_BOLAO=[];
function modal(html,foot){document.getElementById("mbody").innerHTML=html;document.getElementById("mfoot").innerHTML=foot||"";document.getElementById("mov").classList.add("show");}
function fecha(){document.getElementById("mov").classList.remove("show");}
function faseCurta(s){var m={"Group Stage":"Grupos","Round of 16":"Oitavas","Quarter-finals":"Quartas","Semi-finals":"Semi","Final":"Final","3rd Place Final":"3o lugar"};return m[s]||s||"";}
function imgFail(el){el.outerHTML='<span class="pf nopf">&#128100;</span>';}
function linhaJog(p){var av=p.figurinha?('<img class="pf" src="'+BASE+"/fig/"+p.figurinha+'" onerror="imgFail(this)">'):'<span class="pf nopf">&#128100;</span>';return '<div class="mr" style="padding:4px">'+av+'<span style="flex:1;min-width:0">'+esc(p.nome)+'</span><span class="od">'+esc(p.posicao||"")+(p.clube?(' &middot; '+esc(p.clube)):'')+'</span></div>';}
async function escalacao(){
 var box=document.getElementById("esc-box"); if(!box)return;
 box.innerHTML='<div class="muted" style="font-size:12px;padding:6px 0">buscando escalação no 365scores...</div>';
 var r=await fetch(BASE+"/admin/jogos-placar/escalacao?en="+encodeURIComponent(CUR_EN),{headers:H()});
 var d=await r.json().catch(function(){return{};});
 if(!d||!d.ok){box.innerHTML='<div class="muted">'+esc((d&&d.erro)||"erro")+'</div>';return;}
 if(d.semLineup||!d.titulares||!d.titulares.length){var fb=(CUR_ELENCO&&CUR_ELENCO.length)?('<div class="muted" style="font-size:12px;margin:8px 0 4px">Elenco ('+CUR_ELENCO.length+')</div>'+CUR_ELENCO.map(linhaJog).join("")):"";box.innerHTML='<div class="mr" style="border-radius:8px;margin-top:4px"><b>Escalação provável ainda não divulgada</b><span class="od">365scores</span></div>'+fb;return;}
 var conf=d.status==="confirmada";
 var h='<div class="mr" style="border-radius:8px;margin-top:4px"><b>Escalação '+(conf?"confirmada":"provável")+'</b><span class="od">'+esc(d.formacao||"")+' · '+(conf?"confirmada":"provável")+' · 365scores</span></div>';
 h+=d.titulares.map(linhaJog).join("");
 box.innerHTML=h;
}
function noticiasBody(d){
 var html='<div style="font-size:12px;font-weight:800;color:var(--mut);margin-bottom:6px">&#128240; NOTÍCIAS</div>';
 if(!d||!d.ok){return html+'<div class="muted">noticias indisponivel</div>';}
 if(!d.noticias||!d.noticias.length){return html+'<div class="muted">sem noticias recentes para este time.</div>';}
 return html+d.noticias.map(function(n){var lk=n.link?('<a class="lkbtn" href="'+esc(n.link)+'" target="_blank">abrir &#8599;</a>'):'';var meta=[];if(n.data)meta.push(fmtData(n.data));if(n.fonte)meta.push('fonte: '+esc(n.fonte));var src=meta.length?('<div class="muted" style="font-size:11px;margin-top:2px">'+meta.join(' &middot; ')+'</div>'):'';return '<div class="mr" style="align-items:flex-start"><span>&#128240;</span><div style="flex:1;min-width:0"><div>'+esc(n.title)+'</div>'+src+'</div>'+lk+'</div>';}).join("");
}
function statsBody(d){
 if(!d||!d.ok){return '<div class="muted">dados indisponivel</div>';}
 var rk=d.ranking?('<span class="rk">Ranking FIFA #'+d.ranking+'</span>'):'';
 var html='<div style="font-size:12px;font-weight:800;color:var(--mut);margin-bottom:6px">&#128202; DADOS</div><div style="margin-bottom:8px">'+rk+'</div>';
 if(d.grupo){html+='<div class="mr"><b>Grupo '+esc(String(d.grupo.nome).replace("Grupo ",""))+'</b><span class="od">'+d.grupo.pos+'º &middot; '+d.grupo.pts+'pts ('+d.grupo.v+'V '+d.grupo.e+'E '+d.grupo.d+'D)</span></div>';}
 function jline(lbl,j){if(!j)return '';var pl=j.placar?(' <b>'+esc(j.placar)+'</b>'):'';return '<div class="mr"><span class="muted" style="width:52px;flex:none">'+lbl+'</span>'+fl(j.adversario.iso)+'<span style="flex:1;min-width:0">'+(j.casa?'vs ':'@ ')+esc(j.adversario.pt)+'</span>'+pl+'</div>';}
 html+=jline('Próximo',d.proximo)+jline('Último',d.ultimo);
 var u=d.ultimaCopa||[];
 if(u.length){html+='<div class="muted" style="font-size:12px;margin:10px 0 4px">Copa 2022:</div>'+u.map(function(g){return '<div class="mr"><span class="bdg b'+g.res+'">'+g.res+'</span><b>'+esc(g.placar)+'</b>'+fl(g.adversario.iso)+'<span>'+esc(g.adversario.pt)+'</span><span class="od">'+esc(faseCurta(g.fase))+'</span></div>';}).join("");}
 else{html+='<div class="muted" style="font-size:12px;margin:10px 0 4px">Copa 2022:</div><div class="mr"><span class="muted" style="line-height:1.4">Não disputou a Copa de 2022.'+(d.regiao?(' Chega via <b>'+esc(d.regiao)+'</b>.'):'')+'</span></div>';}
 var el=d.elenco||[];CUR_ELENCO=el;
 if(el.length){html+='<div id="esc-box"><div class="muted" style="font-size:12px;padding:6px 0">buscando escalação no 365scores...</div></div>';}
 return html;
}
async function info(en){
 CUR_EN=en;
 modal('<div class="muted">carregando '+esc(en)+'...</div>');
 var sd=null,nd=null;
 try{var sr=await fetch(BASE+"/admin/jogos-placar/stats?en="+encodeURIComponent(en),{headers:H()});sd=await sr.json();}catch(e){}
 try{var nr=await fetch(BASE+"/admin/jogos-placar/noticias?en="+encodeURIComponent(en),{headers:H()});nd=await nr.json();}catch(e){}
 var t=(sd&&sd.time)||(nd&&nd.time)||{pt:en,iso:""};
 modal('<h3>'+fl(t.iso)+' '+esc(t.pt)+'</h3><div class="cols"><div class="col">'+statsBody(sd)+'</div><div class="col">'+noticiasBody(nd)+'</div></div>');
 var m=document.querySelector(".modal");if(m)m.style.maxWidth="780px";
 escalacao();
}
function odds(id){
 var j=JOGOS_BOLAO.find(function(x){return String(x.id)===String(id);}); if(!j||!j.odds){toast("sem odds para este jogo",1);return;}
 var o=j.odds;
 function ro(lbl,v){return '<div class="mr"><span style="flex:1">'+lbl+'</span><b style="font-size:16px">'+esc(v||"-")+'</b></div>';}
 modal('<h3>'+fl(j.casa.iso)+' '+esc(j.casa.pt)+' &times; '+esc(j.visitante.pt)+' '+fl(j.visitante.iso)+'</h3><div class="muted" style="font-size:12px;margin-bottom:8px">Odds 1X2 &middot; '+esc(o.fonte||"")+'</div>'+ro(fl(j.casa.iso)+' '+esc(j.casa.pt)+' (vitória)',o.casa)+ro('Empate',o.empate)+ro(fl(j.visitante.iso)+' '+esc(j.visitante.pt)+' (vitória)',o.fora)+(o.gid?('<a class="s365link" href="https://www.365scores.com/pt-br/football/match/g-'+esc(o.gid)+'#id='+esc(o.gid)+'" target="_blank"><img src="'+S365LOGO+'" style="height:18px;margin-right:7px;vertical-align:middle">Ver tudo no 365scores &#8599;</a>'):''));
}

function tema(){var l=document.body.classList.toggle("light");localStorage.setItem("tema",l?"light":"dark");var t=document.getElementById("tgl");if(t)t.textContent=l?"\u2600\uFE0F":"\uD83C\uDF19";}
if(localStorage.getItem("tema")==="light"){document.body.classList.add("light");var _t=document.getElementById("tgl");if(_t)_t.textContent="\u2600\uFE0F";}
if(!TOKEN){location.href=(BASE||"")+"/";}else{loadDados();}
</script></body></html>`;
