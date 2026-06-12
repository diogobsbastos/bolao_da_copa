// Adiciona relogio "Bolao comeca em: ..." ao lado do chip Manager (landing + app logado)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pool } from "./db.js";

const __dir = dirname(fileURLToPath(import.meta.url));
const FLAG = join(__dir, "_fix_clock.r1.done");
const LP = join(__dir, "landing.ts");
const JP = join(__dir, "jogar_page.ts");
const JT = join(__dir, "jogar.ts");

const CDMINI_CSS = `.cdmini{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:rgba(255,255,255,.85);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:3px 9px;white-space:nowrap;margin-left:6px}.cdmini b{color:#f5c451;font-weight:800;font-size:11px}.cdmini .cdlbl{font-size:9px;font-weight:700;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.3px}`;

function patch(file: string, ops: Array<{old: string; neu: string; key: string}>, log: any) {
  let s = readFileSync(file, "utf8");
  const before = s;
  log[file] = {};
  for (const op of ops) {
    const occ = s.split(op.old).length - 1;
    log[file][op.key] = { occ };
    if (occ === 1) {
      s = s.replace(op.old, op.neu);
      log[file][op.key].fix = "ok";
    } else {
      log[file][op.key].fix = "NAO_TROCOU";
    }
  }
  log[file].changed = s !== before;
  if (s !== before) {
    writeFileSync(file + ".prefix_fix_clock", before, "utf8");
    writeFileSync(file, s, "utf8");
  }
}

try {
  if (existsSync(FLAG)) {
    console.log("[fix_clock] ja aplicado, skip");
  } else {
    const log: any = { ts: new Date().toISOString() };

    // ===== LANDING =====
    // CSS - add .cdmini junto com as .brand
    const landOldCss = `.brand .blogo{height:30px;width:auto;display:block;flex:none;filter:drop-shadow(0 3px 8px rgba(0,0,0,.4))}\n.w.hmpote,.hmpote{border-radius:999px !important;padding:6px 14px !important}`;
    const landNewCss = `.brand .blogo{height:30px;width:auto;display:block;flex:none;filter:drop-shadow(0 3px 8px rgba(0,0,0,.4))}\n.w.hmpote,.hmpote{border-radius:999px !important;padding:6px 14px !important}\n${CDMINI_CSS}`;

    // HTML - add cdmini depois do Manager
    const landOldHtml = `<small class="bmgr">Manager</small></div>`;
    const landNewHtml = `<small class="bmgr">Manager</small><span class="cdmini" id="cdmini" title="Bolao comeca no jogo do Brasil x Marrocos"><span class="cdlbl">comeca em</span> <b id="cdminival">--</b></span></div>`;

    // JS - injetar loader
    const landOldJs = `async function loadPote(){`;
    const landNewJs = `async function loadCd(){try{var r=await fetch(BASE+"/inicio");var d=await r.json();if(!d||!d.iso)return;var alvo=new Date(d.iso).getTime();function z(n){return("0"+n).slice(-2);}function t(){var el=document.getElementById("cdminival");if(!el)return;var di=alvo-Date.now();if(di<=0){el.textContent="\\u26bd AGORA";return;}var D=Math.floor(di/86400000),H=Math.floor(di/3600000)%24,M=Math.floor(di/60000)%60,S=Math.floor(di/1000)%60;el.textContent=(D>0?(D+"d "):"")+z(H)+":"+z(M)+":"+z(S);}t();setInterval(t,1000);}catch(e){}}\nloadCd();\nasync function loadPote(){`;

    patch(LP, [
      { old: landOldCss, neu: landNewCss, key: "css" },
      { old: landOldHtml, neu: landNewHtml, key: "html" },
      { old: landOldJs, neu: landNewJs, key: "js" },
    ], log);

    // ===== APP LOGADO (jogar_page.ts) =====
    const appOldHtml = `<small class="bmgr">Manager</small></div>\n <div class="wallets">`;
    const appNewHtml = `<small class="bmgr">Manager</small><span class="cdmini" id="cdmini" title="Bol&atilde;o come&ccedil;a no jogo do Brasil"><span class="cdlbl">in&iacute;cio em</span> <b id="cdminival">--</b></span></div>\n <div class="wallets">`;

    // injetar CSS no <style>
    const appOldCss = `</style>`;
    const appNewCss = CDMINI_CSS + `</style>`;

    patch(JP, [
      { old: appOldHtml, neu: appNewHtml, key: "html" },
      { old: appOldCss, neu: appNewCss, key: "css" },
    ], log);

    // ===== Endpoint /inicio (landing publica) =====
    // Adiciona no jogar.ts (so esse esta facil de editar - rotas universais)
    // Na verdade, ja temos /pote em landing.ts - vou adicionar /inicio no mesmo padrao
    let sLand = readFileSync(LP, "utf8");
    if (!sLand.includes('"/inicio"')) {
      const oldRoute = `  app.get("/pote", async (_req, reply) => {`;
      const newRoute = `  app.get("/inicio", async (_req, reply) => {
    try {
      const r = await pool.query("SELECT valor FROM config WHERE chave='bolao_inicio_oficial'");
      const iso = String((r.rows[0] as any)?.valor || "2026-06-13T22:00:00.000Z");
      return reply.header("cache-control","public, max-age=60").send({ ok: true, iso });
    } catch { return { ok: false, iso: "2026-06-13T22:00:00.000Z" }; }
  });
  app.get("/pote", async (_req, reply) => {`;
      if (sLand.split(oldRoute).length - 1 === 1) {
        sLand = sLand.replace(oldRoute, newRoute);
        writeFileSync(LP, sLand, "utf8");
        log.endpoint_inicio = "ok";
      } else {
        log.endpoint_inicio = "NAO_TROCOU";
      }
    } else {
      log.endpoint_inicio = "ja_existe";
    }

    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_clock]", JSON.stringify(log));
  }
} catch (e: any) {
  console.error("[fix_clock] ERRO", e?.message || e);
}
