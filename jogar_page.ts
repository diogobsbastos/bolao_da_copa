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
.live365{position:relative;display:inline-flex;border-radius:50%}
.live365::after{content:"";position:absolute;inset:0;border-radius:50%;pointer-events:none;animation:radar365 1.9s ease-out infinite}
@keyframes radar365{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--rc,#0e9488) 50%,transparent)}70%{box-shadow:0 0 0 7px transparent}100%{box-shadow:0 0 0 0 transparent}}
.brand{display:flex;align-items:center;gap:9px}
.blogo{height:30px;width:auto;display:block;flex:none;filter:drop-shadow(0 3px 8px rgba(0,0,0,.4))}
.burger{display:flex!important;align-items:center;justify-content:center;font-size:20px}
.side{transition:width .2s ease}
body.mcol .side{width:58px;padding:10px 6px}
body.mcol .side a{justify-content:center;font-size:0;gap:0;padding:10px 0}
body.mcol .side a .ic{font-size:18px}
body.mcol .side a .tag{display:none}
</style></head><body>
<div class="top">
 <button class="burger" onclick="menuBtn()" title="Menu">&#9776;</button>
 <div class="brand"><img class="blogo" src="data:image/png;base64,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" alt=""><span>Bol&atilde;o <b>Copa 26</b></span></div>
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
function menuBtn(){if(window.innerWidth<=760){drawer();}else{var c=document.body.classList.toggle("mcol");localStorage.setItem("mcol",c?"1":"0");}}
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
 var ball=(j.odds&&/365/.test(j.odds.fonte||""))?('<span class="live365"><img class="o365sm" src="'+S365LOGO+'" title="ver odds (365scores)" onclick="odds('+j.id+')"></span>'):"";
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
if(localStorage.getItem("mcol")==="1"&&window.innerWidth>760){document.body.classList.add("mcol");}
if(!TOKEN){location.href=(BASE||"")+"/";}else{loadDados();}
</script></body></html>`;
