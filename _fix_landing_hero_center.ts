// UNDO de v1/v2/v3 hero-center + adiciona APENAS centralização do login card.
// Toca SO em .feats>.card. Nao mexe em .hero/.copy/.feats em si. Idempotente.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const MARKER = "/* HERO-CENTER-LANDING 2026-06-13-v4 */";

const CSS = `${MARKER}
@media(max-width:560px){
 .feats>.card,.feats .card{
  margin-left:auto!important;margin-right:auto!important;
  width:100%!important;max-width:380px!important;
 }
}
`;

try {
  const LDP = join(__dir, "landing.ts");
  let s = readFileSync(LDP, "utf8");

  // Idempotencia: se v4 ja existe E nenhum marker antigo (v1/v2/v3) ta presente, skip
  const temV4 = s.indexOf(MARKER) !== -1;
  const temOld = s.indexOf("/* HERO-CENTER-LANDING 2026-06-13 */") !== -1 ||
                 s.indexOf("/* HERO-CENTER-LANDING 2026-06-13-v2 */") !== -1 ||
                 s.indexOf("/* HERO-CENTER-LANDING 2026-06-13-v3 */") !== -1;
  if (temV4 && !temOld) {
    console.log("[hero_center_landing v4] ja aplicado limpo, skip");
  } else {
    // Remove TODOS os blocos HERO-CENTER-LANDING (v1, v2, v3, v4 — caso ja exista)
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
    const anchor = "@media(max-width:560px){.cdlab{display:none}.cdval{min-width:0}}";
    if (s.split(anchor).length - 1 === 1) {
      s = s.replace(anchor, anchor + "\n" + CSS);
    }
    writeFileSync(LDP, s, "utf8");
    console.log("[hero_center_landing v4] removidos", removed, "blocos, v4 minimo aplicado");
  }
} catch (e) {
  console.error("[hero_center_landing v4] ERRO", e);
}
