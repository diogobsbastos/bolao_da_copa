// Centraliza .hero/.copy/.feats + login card (.feats .card) na landing mobile.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const MARKER = "/* HERO-CENTER-LANDING 2026-06-13-v3 */";

const CSS = `${MARKER}
@media(max-width:560px){
 .hero{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;text-align:center!important;width:100%!important;max-width:100%!important;margin-left:auto!important;margin-right:auto!important}
 .hero>*{margin-left:auto!important;margin-right:auto!important;align-self:center!important}
 .hero .copy{text-align:center!important;margin:0 auto!important;width:100%!important;max-width:380px!important}
 .hero .feats{display:flex!important;flex-direction:column!important;flex-wrap:wrap!important;justify-content:center!important;align-items:center!important;gap:8px!important;margin:14px auto 0!important;width:100%!important;max-width:380px!important}
 .hero .feats>*{flex:0 1 auto!important;margin:0 auto!important;width:100%!important;max-width:380px!important}
 /* Login card */
 .feats .card,.feats>.card,.card.tabs,
 [class*=login],[class*=auth]{
  margin-left:auto!important;margin-right:auto!important;
  width:100%!important;max-width:380px!important;
  display:block!important;
 }
 /* Tabs Entrar/Cadastrar centradas */
 .card .tabs,.card>.tabs{justify-content:center!important;text-align:center!important}
}
`;

try {
  const LDP = join(__dir, "landing.ts");
  const s = readFileSync(LDP, "utf8");
  if (s.indexOf(MARKER) !== -1) {
    console.log("[hero_center_landing v3] ja aplicado, skip");
  } else {
    // Anchor: ultimo marker HERO-CENTER ou v1, ou fallback cdlab
    const markers = ["/* HERO-CENTER-LANDING 2026-06-13-v2 */", "/* HERO-CENTER-LANDING 2026-06-13 */"];
    let inserted = false;
    for (const mk of markers) {
      const idx = s.indexOf(mk);
      if (idx < 0) continue;
      let pos = s.indexOf("*/", idx) + 2;
      while (pos < s.length && /\s/.test(s[pos])) pos++;
      if (s.substring(pos).startsWith("@media")) {
        const openIdx = s.indexOf("{", pos);
        let depth = 1, endIdx = -1;
        for (let i = openIdx + 1; i < s.length; i++) {
          if (s[i] === "{") depth++;
          else if (s[i] === "}") { depth--; if (depth === 0) { endIdx = i + 1; break; } }
        }
        if (endIdx > 0) {
          const novo = s.substring(0, endIdx) + "\n" + CSS + s.substring(endIdx);
          writeFileSync(LDP, novo, "utf8");
          console.log("[hero_center_landing v3] aplicado apos " + mk + ", delta=" + (novo.length - s.length));
          inserted = true;
          break;
        }
      }
    }
    if (!inserted) {
      const fallback = "@media(max-width:560px){.cdlab{display:none}.cdval{min-width:0}}";
      if (s.split(fallback).length - 1 === 1) {
        const novo = s.replace(fallback, fallback + "\n" + CSS);
        writeFileSync(LDP, novo, "utf8");
        console.log("[hero_center_landing v3] fallback aplicado");
      }
    }
  }
} catch (e) {
  console.error("[hero_center_landing v3] ERRO", e);
}
