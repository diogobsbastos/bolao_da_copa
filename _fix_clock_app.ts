// Round 5: app logado - move cdmini pra fora do .brand (centralizado entre burger e wallets) + injeta JS loadCd
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const JP = join(__dir, "jogar_page.ts");
const FLAG = join(__dir, "_fix_clock_app.r1.done");

try {
  if (existsSync(FLAG)) { console.log("[fix_clock_app] skip"); }
  else {
    let s = readFileSync(JP, "utf8");
    const before = s;
    const log: any = {};

    // 1) Move o <span class="cdmini">...</span> de dentro do .brand pra entre .brand e .wallets, centralizado
    const oldHtml = `<small class="bmgr">Manager</small><span class="cdmini" id="cdmini" title="Bol&atilde;o come&ccedil;a no jogo do Brasil"><span class="cdlbl">in&iacute;cio em</span> <b id="cdminival">--</b></span></div>\n <div class="wallets">`;
    const newHtml = `<small class="bmgr">Manager</small></div>\n <span class="cdmini" id="cdmini" title="Bol&atilde;o come&ccedil;a no jogo do Brasil"><span class="cdlbl">come&ccedil;a em</span> <b id="cdminival">--</b></span>\n <div class="wallets">`;
    const occ = s.split(oldHtml).length - 1;
    log.html_occ = occ;
    if (occ === 1) {
      s = s.replace(oldHtml, newHtml);
      log.html_fix = "ok";
    } else {
      log.html_fix = "NAO_TROCOU";
    }

    // 2) Atualiza CSS do .cdmini pro app logado - centralizado entre brand e wallets, adapta tema claro/escuro
    const oldCss = `.cdmini{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:rgba(255,255,255,.85);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:3px 9px;white-space:nowrap;margin-left:6px}.cdmini b{color:#f5c451;font-weight:800;font-size:11px}.cdmini .cdlbl{font-size:9px;font-weight:700;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.3px}`;
    const newCss = `.cdmini{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:800;color:var(--tx);background:linear-gradient(135deg,rgba(31,170,89,.18),rgba(20,121,74,.28));border:1px solid rgba(31,170,89,.5);border-radius:999px;padding:6px 14px;white-space:nowrap;margin:0 auto;box-shadow:0 4px 14px rgba(31,170,89,.18)}.cdmini b{color:#e0a008;font-weight:900;font-size:14px;letter-spacing:.3px}.cdmini .cdlbl{font-size:10px;font-weight:800;color:var(--mut);text-transform:uppercase;letter-spacing:.5px}@media(max-width:760px){.cdmini{font-size:11px;padding:4px 10px}.cdmini b{font-size:12px}.cdmini .cdlbl{font-size:9px}}`;
    const occ2 = s.split(oldCss).length - 1;
    log.css_occ = occ2;
    if (occ2 === 1) {
      s = s.replace(oldCss, newCss);
      log.css_fix = "ok";
    } else {
      log.css_fix = "NAO_TROCOU";
    }

    // 3) Injeta loadCd() depois da definicao do BASE
    if (!s.includes("function loadCd()")) {
      const anchor = `var BASE=location.pathname.replace(/\\/jogar.*$/,"");`;
      const inject = anchor + `
async function loadCd(){try{var r=await fetch(BASE+"/inicio");var d=await r.json();if(!d||!d.iso)return;var alvo=new Date(d.iso).getTime();function z(n){return("0"+n).slice(-2);}function tickCd(){var el=document.getElementById("cdminival");if(!el)return;var di=alvo-Date.now();if(di<=0){el.textContent="\\u26bd AGORA";return;}var D=Math.floor(di/86400000),H=Math.floor(di/3600000)%24,M=Math.floor(di/60000)%60,S=Math.floor(di/1000)%60;el.textContent=(D>0?(D+"d "):"")+z(H)+":"+z(M)+":"+z(S);}tickCd();setInterval(tickCd,1000);}catch(e){}}
setTimeout(loadCd,500);`;
      const occ3 = s.split(anchor).length - 1;
      log.js_occ = occ3;
      if (occ3 === 1) {
        s = s.replace(anchor, inject);
        log.js_fix = "ok";
      } else {
        log.js_fix = "NAO_TROCOU";
      }
    } else {
      log.js_fix = "ja_existe";
    }

    log.changed = s !== before;
    log.ts = new Date().toISOString();
    if (s !== before) {
      writeFileSync(JP + ".prefix_fix_clock_app", before, "utf8");
      writeFileSync(JP, s, "utf8");
    }
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_clock_app]", log);
  }
} catch (e: any) {
  console.error("[fix_clock_app] ERRO", e?.message || e);
}
