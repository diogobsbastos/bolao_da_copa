// Round 4: move .cdmini pra fora do .brand na landing, centralizado acima do login
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const LP = join(__dir, "landing.ts");
const FLAG = join(__dir, "_fix_clock_pos.done");

try {
  if (existsSync(FLAG)) {
    console.log("[fix_clock_pos] skip");
  } else {
    let s = readFileSync(LP, "utf8");
    const before = s;
    const log: any = {};

    // 1) Tira o <span class="cdmini">...</span> de dentro do .brand
    const oldBrand = `<small class="bmgr">Manager</small><span class="cdmini" id="cdmini" title="Bolao comeca no jogo do Brasil x Marrocos"><span class="cdlbl">comeca em</span> <b id="cdminival">--</b></span></div>`;
    const newBrand = `<small class="bmgr">Manager</small></div>
  <span class="cdmini" id="cdmini" title="Bolao comeca no jogo do Brasil x Marrocos"><span class="cdlbl">comeca em</span> <b id="cdminival">--</b></span>`;
    const occ = s.split(oldBrand).length - 1;
    log.brand_occ = occ;
    if (occ === 1) {
      s = s.replace(oldBrand, newBrand);
      log.brand_fix = "ok";
    } else {
      log.brand_fix = "NAO_TROCOU";
    }

    // 2) Atualiza CSS do .cdmini pra posicao centralizada (margin-left:auto + visual maior)
    const oldCss = `.cdmini{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:rgba(255,255,255,.85);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:3px 9px;white-space:nowrap;margin-left:6px}.cdmini b{color:#f5c451;font-weight:800;font-size:11px}.cdmini .cdlbl{font-size:9px;font-weight:700;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.3px}`;
    const newCss = `.cdmini{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:800;color:#fff;background:linear-gradient(135deg,rgba(31,170,89,.25),rgba(20,121,74,.35));border:1px solid rgba(31,170,89,.55);border-radius:999px;padding:6px 14px;white-space:nowrap;margin-left:auto;box-shadow:0 4px 14px rgba(31,170,89,.25)}.cdmini b{color:#f5c451;font-weight:900;font-size:14px;letter-spacing:.3px}.cdmini .cdlbl{font-size:10px;font-weight:800;color:rgba(255,255,255,.85);text-transform:uppercase;letter-spacing:.5px}@media(max-width:760px){.cdmini{font-size:11px;padding:4px 10px}.cdmini b{font-size:12px}.cdmini .cdlbl{font-size:9px}}`;
    const occ2 = s.split(oldCss).length - 1;
    log.css_occ = occ2;
    if (occ2 === 1) {
      s = s.replace(oldCss, newCss);
      log.css_fix = "ok";
    } else {
      log.css_fix = "NAO_TROCOU";
    }

    log.changed = s !== before;
    log.ts = new Date().toISOString();
    if (s !== before) {
      writeFileSync(LP + ".prefix_fix_clock_pos", before, "utf8");
      writeFileSync(LP, s, "utf8");
    }
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_clock_pos]", log);
  }
} catch (e: any) {
  console.error("[fix_clock_pos] ERRO", e?.message || e);
}
