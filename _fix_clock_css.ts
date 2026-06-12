// Injeta CSS do .cdmini na landing antes do </style>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const LP = join(__dir, "landing.ts");
const FLAG = join(__dir, "_fix_clock_css.done");

const CSS = `.cdmini{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:rgba(255,255,255,.85);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:3px 9px;white-space:nowrap;margin-left:6px}.cdmini b{color:#f5c451;font-weight:800;font-size:11px}.cdmini .cdlbl{font-size:9px;font-weight:700;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.3px}`;

try {
  if (existsSync(FLAG)) {
    console.log("[fix_clock_css] ja aplicado, skip");
  } else {
    let s = readFileSync(LP, "utf8");
    const before = s;
    const log: any = {};

    if (s.includes(".cdmini{")) {
      log.status = "ja_existe";
    } else {
      // injeta antes do primeiro </style>
      const idx = s.indexOf("</style>");
      log.idx = idx;
      if (idx > 0) {
        s = s.slice(0, idx) + CSS + s.slice(idx);
        log.injected = true;
      } else {
        log.injected = false;
      }
    }

    if (s !== before) {
      writeFileSync(LP + ".prefix_fix_clock_css", before, "utf8");
      writeFileSync(LP, s, "utf8");
    }
    log.changed = s !== before;
    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_clock_css]", log);
  }
} catch (e: any) {
  console.error("[fix_clock_css] ERRO", e?.message || e);
}
