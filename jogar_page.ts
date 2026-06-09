export const PAGINA_JOGAR = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bolão da Copa 26</title>
<style>
:root{--pri:#14794a;--pri2:#1faa59;--bg:#0e1117;--card:#171c26;--card2:#1f2633;--tx:#eef1f6;--mut:#94a0b4;--bd:#283142;--gold:#f5c451;--no:#e23744;}
*{box-sizing:border-box}html,body{margin:0}body{font-family:system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx);-webkit-tap-highlight-color:transparent}
a{color:inherit;text-decoration:none}
.top{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:10px;padding:10px 14px;background:#10151e;border-bottom:1px solid var(--bd)}
.burger{font-size:22px;background:none;border:0;color:var(--tx);cursor:pointer;display:none}
.brand{font-weight:800;font-size:15px;white-space:nowrap}
.brand b{color:var(--pri2)}
.wallets{display:flex;gap:6px;margin-left:auto;flex-wrap:wrap;justify-content:flex-end}
.w{display:flex;align-items:center;gap:5px;background:var(--card2);border:1px solid var(--bd);border-radius:999px;padding:5px 10px;font-size:12px;font-weight:700}
.w small{color:var(--mut);font-weight:600}
.av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--pri),var(--pri2));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;cursor:pointer;flex:none}
.layout{display:flex;min-height:calc(100vh - 55px)}
.side{width:210px;flex:none;background:#10151e;border-right:1px solid var(--bd);padding:12px 8px;display:flex;flex-direction:column;gap:3px}
.side a{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;font-weight:600;font-size:14px;color:var(--mut);cursor:pointer}
.side a .ic{width:20px;text-align:center}
.side a:hover{background:var(--card)}
.side a.on{background:var(--pri);color:#fff}
.side a.soon{opacity:.5;cursor:not-allowed}
.side a .tag{margin-left:auto;font-size:9px;background:var(--bd);color:var(--mut);padding:2px 6px;border-radius:6px}
.main{flex:1;min-width:0;padding:18px;max-width:900px}
.sec{display:none}.sec.on{display:block;animation:fade .25s ease}
@keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
h1{font-size:20px;margin:0 0 14px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:16px}
.card h3{margin:0 0 4px;font-size:13px;color:var(--mut);font-weight:700}
.stat{font-size:26px;font-weight:800}
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
</style></head><body>
<div class="top">
 <button class="burger" onclick="drawer()">&#9776;</button>
 <div class="brand">&#9917; Bol&atilde;o <b>Copa 26</b></div>
 <div class="wallets">
  <span class="w" title="Colecionador">&#129689; <span id="w-col">0</span></span>
  <span class="w" title="Apostas">&#127919; <span id="w-apo">0</span></span>
  <span class="w" title="Arena">&#9876; <span id="w-are">0</span></span>
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
   <div style="margin-bottom:10px"><button class="btn ghost" onclick="preencherAuto()">&#127919; Preencher pela l&oacute;gica das odds</button></div>
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
async function loadBolao(rod){
 CURROD=rod;
 document.querySelectorAll("#bolao-tabs .tab").forEach(function(t){t.classList.toggle("on",+t.getAttribute("data-r")===rod);});
 var box=document.getElementById("bolao-box");box.textContent="carregando...";
 var r=await fetch(BASE+"/jogar/bolao?rodada="+rod,{headers:H()});
 var d=await r.json();if(!d||!d.ok){box.textContent="erro ao carregar.";return;}
 if(!d.jogos.length){box.innerHTML='<div class="muted">sem jogos nesta rodada.</div>';return;}
 box.innerHTML=d.jogos.map(function(j){
  var lock=j.travado?'<span class="lock">travado</span>':'';
  var pc=j.meu?j.meu.pc:'';var pv=j.meu?j.meu.pv:'';
  var dis=j.travado?'disabled':'';
  var od=j.odds?('<div class="muted" style="font-size:11px;text-align:center;flex:none;width:100%;margin-top:4px">odds '+j.odds.casa+' / '+j.odds.empate+' / '+j.odds.fora+'</div>'):'';
  return '<div class="jrow" style="flex-wrap:wrap">'
   +'<div class="jteam r">'+esc(j.casa.pt)+' '+fl(j.casa.iso)+'</div>'
   +'<input class="pin" id="pc-'+j.id+'" value="'+pc+'" '+dis+' inputmode="numeric" maxlength="2">'
   +'<span class="muted">x</span>'
   +'<input class="pin" id="pv-'+j.id+'" value="'+pv+'" '+dis+' inputmode="numeric" maxlength="2">'
   +'<div class="jteam">'+fl(j.visitante.iso)+' '+esc(j.visitante.pt)+'</div>'
   +(j.travado?('<div style="flex:none;width:100%;text-align:center;margin-top:4px">'+lock+'</div>'):('<button class="btn" style="padding:7px 12px;flex:none" onclick="salvar('+j.id+')">salvar</button>'))
   +od+'</div>';
 }).join("");
}
async function salvar(id){
 var pc=document.getElementById("pc-"+id).value,pv=document.getElementById("pv-"+id).value;
 if(pc===""||pv===""){toast("Coloque os dois placares.",1);return;}
 var r=await fetch(BASE+"/jogar/palpite",{method:"POST",headers:H(),body:JSON.stringify({jogo_id:id,pc:+pc,pv:+pv})});
 var d=await r.json();
 if(d&&d.ok){toast("Palpite salvo!");loadDados();}else{toast((d&&d.erro)||"erro",1);}
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
if(!TOKEN){location.href=(BASE||"")+"/";}else{loadDados();}
</script></body></html>`;
