// REVERT (2026-06-13) — removedor puro. Restaura landing.ts ao CSS ORIGINAL (baseline d22c84f).
// Tira QUALQUER bloco HERO-CENTER-LANDING (v1..v5) e NAO adiciona nada.
// Junto com _fix_landing_undo.ts (que remove POLISH-LANDING-CSS), a landing volta ao original:
// header intacto, login empilhado embaixo do hero. (Centralizacao do login fica pra depois, com calma.)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));

try {
  const LDP = join(__dir, "landing.ts");
  let s = readFileSync(LDP, "utf8");
  const before = s.length;

  let removed = 0;
  while (true) {
    const startIdx = s.indexOf("/* HERO-CENTER-LANDING");
    if (startIdx < 0) break;
    const endComment = s.indexOf("*/", startIdx);
    if (endComment < 0) break;
    let pos = endComment + 2;
    while (pos < s.length && /\s/.test(s[pos])) pos++;
    if (!s.substring(pos).startsWith("@media")) {
      s = s.substring(0, startIdx) + s.substring(endComment + 2);
      removed++;
      continue;
    }
    const openIdx = s.indexOf("{", pos);
    let depth = 1, endIdx = -1;
    for (let i = openIdx + 1; i < s.length; i++) {
      if (s[i] === "{") depth++;
      else if (s[i] === "}") { depth--; if (depth === 0) { endIdx = i + 1; break; } }
    }
    if (endIdx < 0) break;
    let trim = endIdx;
    while (trim < s.length && /[\s\n]/.test(s[trim])) trim++;
    s = s.substring(0, startIdx) + s.substring(trim);
    removed++;
  }

  if (s.length !== before) {
    writeFileSync(LDP, s, "utf8");
    console.log("[landing revert] removidos", removed, "blocos HERO-CENTER; landing volta ao original");
  } else {
    console.log("[landing revert] nada para remover (ja no original)");
  }
} catch (e) {
  console.error("[landing revert] ERRO", e);
}
