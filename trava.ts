import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";
import { NAV_CSS, NAV_JS, sideHtml } from "./ui.js";

async function admOk(req: FastifyRequest): Promise<boolean> {
  const t = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (expected && t === expected) return true;
  const u = await usuarioDaReq(req);
  return u?.papel === "admin";
}

async function getCfg(k: string): Promise<string> {
  try { const { rows } = await pool.query("SELECT valor FROM config WHERE chave=$1", [k]); return (rows as any[])[0]?.valor ?? ""; } catch { return ""; }
}
async function setCfg(k: string, v: string): Promise<void> {
  await pool.query("INSERT INTO config (chave,valor) VALUES ($1,$2) ON CONFLICT (chave) DO UPDATE SET valor=$2, atualizado_em=now()", [k, v]);
}

export async function rotasTrava(app: FastifyInstance) {
  app.get("/admin/trava/status", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "nao autorizado" });
    const trava = await getCfg("bolao_trava_pontuacao");
    const inicio = await getCfg("bolao_inicio_oficial");
    const aviso = await getCfg("bolao_aviso_inicio");
    return { ok: true, ativa: String(trava || "on").toLowerCase() === "on", inicio_oficial: inicio, aviso };
  });

  app.post("/admin/trava/toggle", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "nao autorizado" });
    const b = (req.body || {}) as any;
    const ativa = !!b.ativa;
    await setCfg("bolao_trava_pontuacao", ativa ? "on" : "off");
    return { ok: true, ativa };
  });

  app.post("/admin/trava/inicio", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "nao autorizado" });
    const b = (req.body || {}) as any;
    const iso = String(b.iso || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(iso)) return reply.code(400).send({ erro: "iso invalido (ex: 2026-06-13T22:00:00.000Z)" });
    await setCfg("bolao_inicio_oficial", iso);
    return { ok: true, inicio_oficial: iso };
  });

  app.get("/admin/trava", async (_req, reply) => reply.header("cache-control", "no-store").type("text/html").send(PAGE));
}

const PAGE = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Trava de Pontuacao - Bolao Copa 26</title>
<style>
:root{--pri:#4361ee;--bg:#f3f4f8;--card:#fff;--tx:#1f2430;--mut:#7a8194;--bd:#e6e8f0;--gr:#1faa59;--rd:#e23744;--gd:#e0a008}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx)}
.app{display:flex;min-height:100vh}.main{flex:1;min-width:0}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 24px;background:var(--card);border-bottom:1px solid var(--bd)}
.top h2{margin:0;font-size:18px;display:flex;align-items:center;gap:10px}
.pad{padding:18px 24px 60px;max-width:780px}
.muted{color:var(--mut);font-size:13px}
.card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:18px;margin-bottom:14px}
h3{margin:0 0 6px;font-size:17px;display:flex;align-items:center;gap:8px}
.status{display:flex;align-items:center;gap:14px;padding:16px;background:#f7f8fc;border-radius:10px;margin:12px 0}
.dot{width:18px;height:18px;border-radius:50%;background:var(--gr);box-shadow:0 0 0 4px rgba(31,170,89,.18);flex:none}
.dot.off{background:var(--rd);box-shadow:0 0 0 4px rgba(226,55,68,.18)}
.lbl{font-weight:800;font-size:15px}
.lbl small{display:block;font-size:12px;font-weight:600;color:var(--mut);margin-top:2px}
button{background:var(--gr);color:#fff;border:0;border-radius:10px;padding:11px 20px;font-weight:800;cursor:pointer;font-size:13px;margin-top:6px;transition:transform .1s}
button.off{background:var(--rd)}button.sec{background:#283142}button:hover{transform:translateY(-1px)}
.kv{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px dashed var(--bd);font-size:13px}
.kv:last-child{border:0}.kv b{color:var(--gd);font-weight:800}
.info{font-size:13px;color:var(--mut);line-height:1.7;margin-top:10px}
.info b{color:var(--tx)}
.dpchip{display:inline-flex;align-items:center;gap:10px;background:#f7f8fc;border:1px solid var(--bd);border-radius:10px;padding:11px 14px;cursor:pointer;font-weight:700;font-size:13px;color:var(--tx);transition:.15s;margin:6px 0}
.dpchip:hover{background:#eef1fb;border-color:var(--pri)}
.dpchip .ico{font-size:18px}
.dpchip b{color:var(--pri);font-weight:800}
.toast{position:fixed;top:18px;right:18px;background:var(--gr);color:#fff;padding:11px 18px;border-radius:10px;font-weight:800;box-shadow:0 8px 24px rgba(0,0,0,.18);opacity:0;transform:translateY(-10px);transition:.25s;z-index:1100}
.toast.show{opacity:1;transform:translateY(0)}.toast.rd{background:var(--rd)}
code{background:#eef1fb;padding:2px 6px;border-radius:4px;font-size:12px}

/* ================ Calendario popup ================ */
.dpov{position:fixed;inset:0;background:rgba(15,19,32,.55);backdrop-filter:blur(4px);z-index:1000;display:none;align-items:center;justify-content:center;padding:18px;opacity:0;transition:opacity .2s}
.dpov.show{display:flex;opacity:1}
.dpwin{background:#fff;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.35);width:100%;max-width:380px;overflow:hidden;transform:scale(.92) translateY(10px);transition:transform .25s cubic-bezier(.34,1.56,.64,1)}
.dpov.show .dpwin{transform:scale(1) translateY(0)}
.dphd{background:linear-gradient(135deg,var(--pri),#6d83ff);color:#fff;padding:18px 22px}
.dphd .sm{font-size:11px;font-weight:700;letter-spacing:.5px;opacity:.85;text-transform:uppercase}
.dphd .big{font-size:24px;font-weight:800;line-height:1.1;margin-top:4px}
.dpbd{padding:14px 16px 18px}
.dpmh{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.dpmh button{background:#eef1fb;color:var(--tx);border:0;width:34px;height:34px;border-radius:10px;font-size:18px;font-weight:800;cursor:pointer;padding:0;margin:0}
.dpmh button:hover{background:var(--pri);color:#fff}
.dpmh .mtitle{font-weight:800;font-size:15px;text-transform:capitalize}
.dpgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:12px}
.dpwk{font-size:10px;font-weight:800;color:var(--mut);text-align:center;padding:6px 0;text-transform:uppercase}
.dpd{height:36px;display:flex;align-items:center;justify-content:center;border-radius:9px;cursor:pointer;font-size:13px;font-weight:600;color:var(--tx);transition:.12s}
.dpd:hover{background:#eef1fb;color:var(--pri)}
.dpd.out{color:#c4cad8;font-weight:500}
.dpd.sel{background:var(--pri);color:#fff;font-weight:800;box-shadow:0 4px 12px rgba(67,97,238,.4)}
.dpd.today{outline:2px solid var(--gd)}
.dptime{display:flex;align-items:center;gap:10px;padding:14px;background:#f7f8fc;border-radius:12px;margin-top:6px}
.dptime .tlb{font-size:11px;font-weight:700;color:var(--mut);text-transform:uppercase;flex:none}
.dpt{display:flex;align-items:center;gap:4px;margin-left:auto}
.dpt input{width:54px;text-align:center;font-size:18px;font-weight:800;border:1px solid var(--bd);border-radius:8px;padding:6px 4px;font-family:monospace;color:var(--tx);background:#fff}
.dpt input:focus{border-color:var(--pri);outline:none}
.dpt .sep{font-size:18px;font-weight:800;color:var(--mut)}
.dpft{display:flex;gap:8px;margin-top:14px}
.dpft button{flex:1;border-radius:10px;padding:11px 0;font-weight:800;cursor:pointer;border:0;font-size:13px;margin:0}
.dpft .cnc{background:#eef1fb;color:var(--tx)}
.dpft .cnc:hover{background:#dbe1f5}
.dpft .ok{background:var(--gr);color:#fff}
.dpft .ok:hover{background:#159048}
${NAV_CSS}
</style></head><body>
<div class="app">${sideHtml("trava")}
 <main class="main">
  <div class="top"><h2>&#128274; Trava de Pontuacao</h2><span id="conn" class="muted">conectando...</span></div>
  <div class="pad">

   <div class="card">
    <h3>Estado da trava</h3>
    <div class="muted">Quando ligada, o motor de pontuacao <b>nao apura</b> jogos com inicio antes da data oficial. Pode ligar/desligar a qualquer momento — <b>nao corrompe dados</b>.</div>
    <div class="status">
     <span class="dot" id="dot"></span>
     <span class="lbl" id="lbl">--<small id="sub">--</small></span>
    </div>
    <button id="btn" onclick="toggle()">--</button>
   </div>

   <div class="card">
    <h3>&#9201; Data de inicio oficial do Bolao</h3>
    <div class="muted">A partir desta data/hora o motor passa a pontuar. Mesmo valor que alimenta o relogio regressivo do header.</div>
    <div class="kv"><span>Atual</span><b id="iso">--</b></div>
    <div class="dpchip" onclick="abrirCal()">
     <span class="ico">&#128197;</span>
     <span>Clique pra escolher <b id="dpsumm">--</b></span>
    </div>
   </div>

   <div class="card">
    <div class="info">
     <b>Como funciona:</b><br>
     &bull; Quando <b>TRAVADO</b>: <code>apurarJogo()</code> sai cedo retornando <code>motivo: "trava_pre_inicio_oficial"</code>, sem mutar o banco.<br>
     &bull; Jogos anteriores ao inicio oficial ficam com <code>apurado=false</code> — desligando a trava depois, o coletor processa naturalmente.<br>
     &bull; Jogos <b>apos</b> o inicio oficial sao apurados normalmente, mesmo com a trava ligada.<br>
     &bull; Configs gravadas: <code>bolao_trava_pontuacao</code> (on/off), <code>bolao_inicio_oficial</code> (ISO).
    </div>
   </div>

  </div>
 </main>
</div>

<!-- Popup do calendario -->
<div class="dpov" id="dpov" onclick="if(event.target===this)fecharCal()">
 <div class="dpwin">
  <div class="dphd">
   <div class="sm" id="dphdSm">Inicio oficial do Bolao</div>
   <div class="big" id="dphdBig">--</div>
  </div>
  <div class="dpbd">
   <div class="dpmh">
    <button onclick="navMes(-1)">&lsaquo;</button>
    <div class="mtitle" id="dpmt">--</div>
    <button onclick="navMes(1)">&rsaquo;</button>
   </div>
   <div class="dpgrid" id="dpwks"></div>
   <div class="dpgrid" id="dpdays"></div>
   <div class="dptime">
    <span class="tlb">Horario</span>
    <div class="dpt">
     <input type="text" id="dpHH" maxlength="2" oninput="atualizaHdr()">
     <span class="sep">:</span>
     <input type="text" id="dpMM" maxlength="2" oninput="atualizaHdr()">
    </div>
   </div>
   <div class="dpft">
    <button class="cnc" onclick="fecharCal()">Cancelar</button>
    <button class="ok" onclick="salvarCal()">Salvar</button>
   </div>
  </div>
 </div>
</div>

<div class="toast" id="toast"></div>
<script>
${NAV_JS}
var ATIVA=null;
var DPSEL=null; // Date selecionada
var DPCUR=null; // mes/ano visivel
var ISO_ATUAL="";
var MESES=["Janeiro","Fevereiro","Marco","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
var WKS=["Dom","Seg","Ter","Qua","Qui","Sex","Sab"];

function H(){var h={"content-type":"application/json"};var s=localStorage.getItem("sessao");if(s)h["authorization"]="Bearer "+s;return h;}
function toast(m,ok){var t=document.getElementById("toast");t.textContent=m;t.className="toast show"+(ok?"":" rd");setTimeout(function(){t.className="toast";},2200);}
function z(n){return ("0"+n).slice(-2);}

async function load(){
 var c=document.getElementById("conn");
 var r=await fetch(_b()+"/admin/trava/status",{headers:H()});
 if(!r.ok){c.textContent="faca login no /admin";c.style.color="#e23744";document.getElementById("btn").style.display="none";return;}
 c.textContent="conectado";c.style.color="#1faa59";
 var d=await r.json();
 ATIVA=d.ativa;
 document.getElementById("dot").className="dot"+(d.ativa?"":" off");
 document.getElementById("lbl").innerHTML=(d.ativa?"TRAVADO":"DESTRAVADO")+"<small>"+(d.ativa?"Jogos antes do inicio NAO pontuam":"Apuracao normal pra todos os jogos")+"</small>";
 var btn=document.getElementById("btn");btn.className=d.ativa?"off":"";btn.innerHTML=d.ativa?"&#128683; Desligar a trava":"&#128274; Ligar a trava";
 ISO_ATUAL=d.inicio_oficial||"2026-06-13T22:00:00.000Z";
 document.getElementById("iso").textContent=ISO_ATUAL;
 // Soma resumida amigavel (BRT)
 try{
  var dt=new Date(ISO_ATUAL);
  var fmt=dt.toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"America/Sao_Paulo"});
  document.getElementById("dpsumm").textContent=fmt+" (BRT)";
 }catch(e){document.getElementById("dpsumm").textContent="--";}
}

async function toggle(){
 var r=await fetch(_b()+"/admin/trava/toggle",{method:"POST",headers:H(),body:JSON.stringify({ativa:!ATIVA})});
 if(!r.ok){toast("erro",0);return;}
 var d=await r.json();
 toast(d.ativa?"Trava LIGADA":"Trava DESLIGADA",1);
 await load();
}

/* ============ Calendario ============ */
function abrirCal(){
 var dt=new Date(ISO_ATUAL);
 if(isNaN(dt.getTime()))dt=new Date();
 DPSEL=new Date(dt.getFullYear(),dt.getMonth(),dt.getDate(),dt.getHours(),dt.getMinutes());
 DPCUR=new Date(DPSEL.getFullYear(),DPSEL.getMonth(),1);
 document.getElementById("dpHH").value=z(DPSEL.getHours());
 document.getElementById("dpMM").value=z(DPSEL.getMinutes());
 renderCal();
 atualizaHdr();
 document.getElementById("dpov").classList.add("show");
}
function fecharCal(){document.getElementById("dpov").classList.remove("show");}
function navMes(d){DPCUR=new Date(DPCUR.getFullYear(),DPCUR.getMonth()+d,1);renderCal();}

function renderCal(){
 // Header com mes/ano
 document.getElementById("dpmt").textContent=MESES[DPCUR.getMonth()]+" "+DPCUR.getFullYear();
 // Cabecalho semanas
 var wk=document.getElementById("dpwks");
 wk.innerHTML=WKS.map(function(w){return '<div class="dpwk">'+w+'</div>';}).join("");
 // Dias
 var grid=document.getElementById("dpdays");
 var primeiro=new Date(DPCUR.getFullYear(),DPCUR.getMonth(),1);
 var diaSem=primeiro.getDay();
 var ultDia=new Date(DPCUR.getFullYear(),DPCUR.getMonth()+1,0).getDate();
 var hoje=new Date();
 var html="";
 // Dias do mes anterior pra preencher inicio
 var prevUlt=new Date(DPCUR.getFullYear(),DPCUR.getMonth(),0).getDate();
 for(var i=diaSem-1;i>=0;i--){
  html+='<div class="dpd out">'+(prevUlt-i)+'</div>';
 }
 for(var d=1;d<=ultDia;d++){
  var cls="dpd";
  if(DPSEL && DPCUR.getFullYear()===DPSEL.getFullYear() && DPCUR.getMonth()===DPSEL.getMonth() && d===DPSEL.getDate())cls+=" sel";
  if(hoje.getFullYear()===DPCUR.getFullYear() && hoje.getMonth()===DPCUR.getMonth() && d===hoje.getDate())cls+=" today";
  html+='<div class="'+cls+'" onclick="selDia('+d+')">'+d+'</div>';
 }
 // Dias do proximo mes pra fechar grid
 var total=diaSem+ultDia;
 var faltam=(7-(total%7))%7;
 for(var n=1;n<=faltam;n++){
  html+='<div class="dpd out">'+n+'</div>';
 }
 grid.innerHTML=html;
}
function selDia(d){
 var hh=Number(document.getElementById("dpHH").value)||0;
 var mm=Number(document.getElementById("dpMM").value)||0;
 DPSEL=new Date(DPCUR.getFullYear(),DPCUR.getMonth(),d,hh,mm);
 renderCal();
 atualizaHdr();
}
function atualizaHdr(){
 if(!DPSEL)return;
 var hh=Number(document.getElementById("dpHH").value);
 var mm=Number(document.getElementById("dpMM").value);
 if(!isNaN(hh)&&hh>=0&&hh<24)DPSEL.setHours(hh);
 if(!isNaN(mm)&&mm>=0&&mm<60)DPSEL.setMinutes(mm);
 var fmt=DPSEL.toLocaleString("pt-BR",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
 document.getElementById("dphdBig").textContent=fmt+" "+z(DPSEL.getHours())+":"+z(DPSEL.getMinutes());
}
async function salvarCal(){
 if(!DPSEL){toast("escolha uma data",0);return;}
 var iso=DPSEL.toISOString();
 var r=await fetch(_b()+"/admin/trava/inicio",{method:"POST",headers:H(),body:JSON.stringify({iso:iso})});
 var d=await r.json().catch(function(){return{};});
 if(!r.ok){toast(d.erro||"erro",0);return;}
 toast("Data atualizada",1);
 fecharCal();
 await load();
}
load();
</script></body></html>`;
