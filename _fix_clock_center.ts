// Centraliza o .cdmini na landing - position absolute, page-center top
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const LP = join(__dir, "landing.ts");
const FLAG = join(__dir, "_fix_clock_center.done");

try {
  if (existsSync(FLAG)) { console.log("[fix_clock_center] skip"); }
  else {
    let s = readFileSync(LP, "utf8");
    const before = s;
    const log: any = {};

    // Pega a versao atual com margin-left:auto e troca por position absolute centralizado
    const oldCss = `.cdmini{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:800;color:#fff;background:linear-gradient(135deg,rgba(31,170,89,.25),rgba(20,121,74,.35));border:1px solid rgba(31,170,89,.55);border-radius:999px;padding:6px 14px;white-space:nowrap;margin-left:auto;box-shadow:0 4px 14px rgba(31,170,89,.25)}.cdmini b{color:#f5c451;font-weight:900;font-size:14px;letter-spacing:.3px}.cdmini .cdlbl{font-size:10px;font-weight:800;color:rgba(255,255,255,.85);text-transform:uppercase;letter-spacing:.5px}@media(max-width:760px){.cdmini{font-size:11px;padding:4px 10px}.cdmini b{font-size:12px}.cdmini .cdlbl{font-size:9px}}`;
    const newCss = `.cdmini{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:800;color:#fff;background:linear-gradient(135deg,rgba(31,170,89,.25),rgba(20,121,74,.35));border:1px solid rgba(31,170,89,.55);border-radius:999px;padding:6px 14px;white-space:nowrap;box-shadow:0 4px 14px rgba(31,170,89,.25);position:absolute;left:50%;top:14px;transform:translateX(-50%);z-index:5}.cdmini b{color:#f5c451;font-weight:900;font-size:14px;letter-spacing:.3px}.cdmini .cdlbl{font-size:10px;font-weight:800;color:rgba(255,255,255,.85);text-transform:uppercase;letter-spacing:.5px}@media(max-width:760px){.cdmini{font-size:10px;padding:4px 9px;top:10px}.cdmini b{font-size:11px}.cdmini .cdlbl{font-size:8px}}.nav{position:relative}`;
    const occ = s.split(oldCss).length - 1;
    log.occ = occ;
    if (occ === 1) {
      s = s.replace(oldCss, newCss);
      log.fix = "ok";
      writeFileSync(LP + ".prefix_fix_clock_center", before, "utf8");
      writeFileSync(LP, s, "utf8");
    } else {
      log.fix = "NAO_TROCOU";
    }
    log.changed = s !== before;
    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_clock_center]", log);
  }
} catch (e: any) {
  console.error("[fix_clock_center] ERRO", e?.message || e);
}
