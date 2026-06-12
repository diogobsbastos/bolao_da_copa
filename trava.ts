import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";

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
:root{--bg:#0e1320;--card:#171c26;--bd:#283142;--tx:#fff;--mut:#a0a8b8;--gr:#1faa59;--rd:#e23744;--gd:#f5c451}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx);min-height:100vh;padding:24px}
.wrap{max-width:620px;margin:30px auto}
.card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:22px;margin-bottom:16px}
h1{margin:0 0 6px;font-size:22px;display:flex;align-items:center;gap:10px}
.muted{color:var(--mut);font-size:14px;margin-bottom:14px;line-height:1.5}
.status{display:flex;align-items:center;gap:14px;padding:18px;background:rgba(255,255,255,.04);border-radius:10px;margin:14px 0}
.dot{width:18px;height:18px;border-radius:50%;background:var(--gr);box-shadow:0 0 0 4px rgba(31,170,89,.18);flex:none}
.dot.off{background:var(--rd);box-shadow:0 0 0 4px rgba(226,55,68,.18)}
.lbl{font-weight:800;font-size:16px}
.lbl small{display:block;font-size:12px;font-weight:600;color:var(--mut);margin-top:2px}
button{background:var(--gr);color:#fff;border:0;border-radius:10px;padding:12px 22px;font-weight:800;cursor:pointer;font-size:14px;margin-top:8px;transition:transform .1s}
button.off{background:var(--rd)}button:hover{transform:translateY(-1px)}
.kv{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px dashed var(--bd);font-size:13px}
.kv:last-child{border:0}.kv b{color:var(--gd);font-weight:800}
.info{font-size:13px;color:var(--mut);line-height:1.7;margin-top:12px}
.info b{color:var(--tx)}
input[type=text]{width:100%;background:#0e1320;color:#fff;border:1px solid var(--bd);border-radius:8px;padding:10px 12px;font-size:13px;margin:6px 0}
.btn-sec{background:#283142;color:#fff;margin-left:8px}
.toast{position:fixed;top:18px;right:18px;background:var(--gr);color:#fff;padding:11px 18px;border-radius:10px;font-weight:800;box-shadow:0 8px 24px rgba(0,0,0,.4);opacity:0;transform:translateY(-10px);transition:.25s}
.toast.show{opacity:1;transform:translateY(0)}.toast.rd{background:var(--rd)}
</style></head><body>
<div class="wrap">
 <div class="card">
  <h1>&#128274; Trava de Pontuacao</h1>
  <div class="muted">Controla se o motor de pontuacao apura jogos <b>antes</b> do inicio oficial do Bolao. Pode ligar/desligar a qualquer momento — <b>nao corrompe dados</b>.</div>
  <div class="status">
   <span class="dot" id="dot"></span>
   <span class="lbl" id="lbl">--<small id="sub">--</small></span>
  </div>
  <button id="btn" onclick="toggle()">--</button>
  <div class="info" id="info"></div>
 </div>

 <div class="card">
  <h1 style="font-size:17px">&#9201; Inicio oficial do Bolao</h1>
  <div class="muted">Data/hora a partir da qual o motor passa a pontuar (em ISO 8601 UTC).</div>
  <div class="kv"><span>Atual</span><b id="iso">--</b></div>
  <input type="text" id="isoNew" placeholder="2026-06-13T22:00:00.000Z">
  <button class="btn-sec" onclick="salvarIso()">Salvar nova data</button>
 </div>

 <div class="card">
  <div class="info"><b>Como funciona:</b><br>
   &bull; Quando <b>TRAVADO</b>: <code>apurarJogo()</code> sai cedo, retornando <code>motivo: "trava_pre_inicio_oficial"</code>, sem mutar o banco.<br>
   &bull; Os jogos anteriores ao inicio oficial ficam com <code>apurado=false</code> — quando voce desligar a trava, o coletor processa naturalmente.<br>
   &bull; Jogos <b>apos</b> o inicio oficial sao apurados normalmente, mesmo com a trava ligada.<br>
   &bull; Config gravadas: <code>bolao_trava_pontuacao</code> (on/off), <code>bolao_inicio_oficial</code> (ISO).
  </div>
 </div>
</div>
<div class="toast" id="toast"></div>
<script>
var ATIVA=null;
function BASE(){return location.pathname.replace(/\\/admin.*$/,"");}
function H(){var h={"content-type":"application/json"};var s=localStorage.getItem("sessao");if(s)h["authorization"]="Bearer "+s;return h;}
function toast(m,ok){var t=document.getElementById("toast");t.textContent=m;t.className="toast show"+(ok?"":" rd");setTimeout(function(){t.className="toast";},2200);}
async function load(){
 var r=await fetch(BASE()+"/admin/trava/status",{headers:H()});
 if(r.status===401){document.getElementById("lbl").innerHTML="Faca login em <a href='"+BASE()+"/admin' style='color:#f5c451'>/admin</a>";document.getElementById("btn").style.display="none";return;}
 var d=await r.json();
 ATIVA=d.ativa;
 document.getElementById("dot").className="dot"+(d.ativa?"":" off");
 document.getElementById("lbl").innerHTML=(d.ativa?"TRAVADO":"DESTRAVADO")+"<small>"+(d.ativa?"Jogos antes do inicio NAO pontuam":"Apuracao normal pra todos os jogos")+"</small>";
 var btn=document.getElementById("btn");btn.className=d.ativa?"off":"";btn.textContent=d.ativa?"Desligar a trava":"Ligar a trava";
 document.getElementById("iso").textContent=d.inicio_oficial||"--";
 document.getElementById("isoNew").placeholder=d.inicio_oficial||"2026-06-13T22:00:00.000Z";
 document.getElementById("info").innerHTML="<b>Aviso configurado:</b><br>"+(d.aviso||"--");
}
async function toggle(){
 var r=await fetch(BASE()+"/admin/trava/toggle",{method:"POST",headers:H(),body:JSON.stringify({ativa:!ATIVA})});
 if(!r.ok){toast("erro",0);return;}
 var d=await r.json();
 toast(d.ativa?"Trava LIGADA":"Trava DESLIGADA",1);
 await load();
}
async function salvarIso(){
 var iso=document.getElementById("isoNew").value.trim();
 if(!iso){toast("informe ISO",0);return;}
 var r=await fetch(BASE()+"/admin/trava/inicio",{method:"POST",headers:H(),body:JSON.stringify({iso:iso})});
 var d=await r.json().catch(function(){return{};});
 if(!r.ok){toast(d.erro||"erro",0);return;}
 toast("Data atualizada",1);
 await load();
}
load();
</script></body></html>`;
