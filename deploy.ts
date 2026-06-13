import type { FastifyInstance, FastifyRequest } from "fastify";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";
import { NAV_CSS, sideHtml, NAV_JS } from "./ui.js";

const DIR = "/home/ubuntu/bolao-copa26";
const pexec = promisify(execFile);

// remove credenciais (PAT) de qualquer saida antes de exibir/gravar
function scrub(s: string): string {
  return String(s || "").replace(/https:\/\/[^@\s\/]*@github/g, "https://github").replace(/github_pat_[A-Za-z0-9_]+/g, "github_pat_***");
}

async function admOk(req: FastifyRequest): Promise<boolean> {
  const t = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (expected && t === expected) return true;
  const u = await usuarioDaReq(req);
  return u?.papel === "admin";
}
async function git(args: string[]): Promise<string> {
  try {
    const { stdout, stderr } = await pexec("git", ["-C", DIR, ...args], { maxBuffer: 8 * 1024 * 1024 });
    return scrub((stdout || "") + (stderr ? ("\n" + stderr) : ""));
  } catch (e: any) {
    return "ERRO: " + scrub(String(e?.stderr || e?.message || e));
  }
}
async function commitPush(msg: string): Promise<string> {
  const out: string[] = [];
  out.push("$ git add -A\n" + await git(["add", "-A"]));
  out.push("$ git commit\n" + await git(["commit", "-m", msg || ("deploy " + new Date().toISOString())]));
  out.push("$ git push\n" + await git(["push"]));
  return out.join("\n\n");
}
// DEPLOY BLINDADO: VPS = espelho exato do GitHub. fetch + reset --hard.
// Nunca da conflito porque descarta qualquer alteracao local da VPS (que deve ser read-only).
async function deployHard(): Promise<string> {
  const out: string[] = [];
  out.push("$ git fetch origin main\n" + await git(["fetch", "origin", "main"]));
  out.push("$ git reset --hard origin/main\n" + await git(["reset", "--hard", "origin/main"]));
  return out.join("\n\n");
}
// remove arquivos do diretorio (nomes simples, sem path traversal) e commita
async function limpar(arquivos: string[], msg: string): Promise<string> {
  const nomes = (Array.isArray(arquivos) ? arquivos : []).map((f) => String(f).replace(/[^A-Za-z0-9_.\-]/g, "")).filter(Boolean);
  if (!nomes.length) return "nada para remover";
  try { await pexec("rm", ["-f", ...nomes.map((f) => DIR + "/" + f)], { maxBuffer: 1024 * 1024 }); } catch (e: any) { return "ERRO rm: " + String(e?.message ?? e); }
  return "removidos: " + nomes.join(", ") + "\n\n" + await commitPush(msg || "limpeza de temporarios");
}
async function getCfg(k: string): Promise<string> {
  try { const { rows } = await pool.query("SELECT valor FROM config WHERE chave=$1", [k]); return (rows as any[])[0]?.valor ?? ""; } catch { return ""; }
}
async function setCfg(k: string, v: string): Promise<void> {
  try { await pool.query("INSERT INTO config (chave,valor) VALUES ($1,$2) ON CONFLICT (chave) DO UPDATE SET valor=$2, atualizado_em=now()", [k, v]); } catch {}
}

// Disparado no boot: se config.deploy_cmd existir, executa e grava em config.deploy_out. (driven via sql_local + restart)
export async function runDeployCmd(): Promise<void> {
  let cmd = ""; try { cmd = await getCfg("deploy_cmd"); } catch { return; }
  if (!cmd) return;
  let res = "";
  try {
    const o = JSON.parse(cmd);
    if (o.acao === "push") res = await commitPush(String(o.msg || ""));
    else if (o.acao === "pull" || o.acao === "deploy") res = await deployHard();
    else if (o.acao === "rm") res = await limpar(o.arquivos, String(o.msg || ""));
    else if (o.acao === "status") res = await git(["status"]) + "\n---\n" + await git(["log", "--oneline", "-8"]);
    else res = "acao desconhecida: " + o.acao;
  } catch (e: any) { res = "ERRO deploy_cmd: " + String(e?.message ?? e); }
  await setCfg("deploy_out", new Date().toISOString() + "\n" + res);
  await setCfg("deploy_cmd", "");
}

export async function rotasDeploy(app: FastifyInstance) {
  app.post("/admin/deploy/run", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    const acao = String(b.acao || "status");
    let saida = "";
    if (acao === "push") saida = await commitPush(String(b.msg || ""));
    else if (acao === "pull" || acao === "deploy") saida = await deployHard();
    else saida = await git(["status"]) + "\n--- ultimos commits ---\n" + await git(["log", "--oneline", "-8"]);
    return { ok: true, acao, saida };
  });

  app.get("/admin/deploy/out", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    return { out: await getCfg("deploy_out") };
  });

  app.get("/admin/deploy", async (_req, reply) => reply.header("cache-control", "no-store").type("text/html").send(PAGINA_DEPLOY));
}

const PAGINA_DEPLOY = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Git & Deploy - Bolao da Copa 26</title>
<style>
:root{--pri:#4361ee;--bg:#f3f4f8;--card:#fff;--tx:#1f2430;--mut:#7a8194;--bd:#e6e8f0;}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx)}
.app{display:flex;min-height:100vh}.main{flex:1;min-width:0}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 24px;background:var(--card);border-bottom:1px solid var(--bd)}
.top h2{margin:0;font-size:18px}.pad{padding:18px 24px 60px;max-width:900px}
.muted{color:var(--mut);font-size:13px}
.card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:16px;margin-bottom:14px}
button{background:var(--pri);color:#fff;border:0;border-radius:9px;padding:9px 14px;font-weight:700;cursor:pointer;font-size:13px}
button.gr{background:#14794a}button.am{background:#b45309}button:disabled{opacity:.5}
input{width:100%;border:1px solid var(--bd);border-radius:9px;padding:9px 10px;font-size:14px;margin:8px 0}
pre{background:#0f1320;color:#cfe3ff;padding:12px;border-radius:10px;overflow:auto;font-size:12px;max-height:60vh;white-space:pre-wrap}
.row{display:flex;gap:8px;flex-wrap:wrap}
${NAV_CSS}
</style></head><body>
<div class="app">${sideHtml("deploy")}
 <main class="main">
  <div class="top"><h2>&#128190; Git &amp; Deploy</h2><span id="conn" class="muted">conectando...</span></div>
  <div class="pad">
   <div class="card">
    <div class="muted">Faz backup do servidor no GitHub (commit + push) e tras atualizacoes (pull). Use o <b>Push</b> antes de mexidas grandes pra ter rollback.</div>
    <input id="msg" placeholder="mensagem do commit (ex.: palpites + noticias)">
    <div class="row">
     <button class="gr" onclick="run('push')">&#11014;&#65039; Commit &amp; Push</button>
     <button class="am" onclick="run('pull')">&#11015;&#65039; Pull</button>
     <button onclick="run('status')">&#128269; Status</button>
    </div>
   </div>
   <div class="card"><b>Saida</b><pre id="out" class="muted">—</pre></div>
  </div>
 </main>
</div>
<script>
${NAV_JS}
function H(){var h={"content-type":"application/json"};var s=localStorage.getItem("sessao");if(s){h["authorization"]="Bearer "+s;}return h;}
async function run(acao){
 var out=document.getElementById("out");out.textContent="rodando "+acao+"...";
 var msg=document.getElementById("msg").value||"";
 var r=await fetch(_b()+"/admin/deploy/run",{method:"POST",headers:H(),body:JSON.stringify({acao:acao,msg:msg})});
 var d=await r.json().catch(function(){return{};});
 out.textContent=(d&&d.saida)?d.saida:("erro: "+JSON.stringify(d));
}
(async function(){var c=document.getElementById("conn");var r=await fetch(_b()+"/admin/deploy/run",{method:"POST",headers:H(),body:JSON.stringify({acao:"status"})});if(!r.ok){c.textContent="faca login no /admin";c.style.color="#e23744";return;}c.textContent="conectado";c.style.color="#1faa59";var d=await r.json();document.getElementById("out").textContent=d.saida||"—";})();
</script></body></html>`;
