// Centraliza APENAS .hero/.copy/.feats na landing mobile (sem tocar no header).
// Insere apos o anchor existente do cdlab/cdval. Idempotente via marker.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const MARKER = "/* HERO-CENTER-LANDING 2026-06-13 */";

const CSS = `${MARKER}
@media(max-width:560px){
 .hero{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;text-align:center!important;width:100%!important;max-width:100%!important;margin-left:auto!important;margin-right:auto!important}
 .hero>*{margin-left:auto!important;margin-right:auto!important;align-self:center!important}
 .hero .copy{text-align:center!important;margin:0 auto!important;width:100%!important;max-width:380px!important}
 .hero .feats{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;align-items:center!important;gap:8px!important;margin:14px auto 0!important;width:100%!important;max-width:380px!important}
 .hero .feats>*{flex:0 1 auto!important;margin:0!important}
}
`;

try {
  const LDP = join(__dir, "landing.ts");
  const s = readFileSync(LDP, "utf8");
  if (s.indexOf(MARKER) !== -1) {
    console.log("[hero_center_landing] ja aplicado, skip");
  } else {
    const anchor = "@media(max-width:560px){.cdlab{display:none}.cdval{min-width:0}}";
    if (s.split(anchor).length - 1 === 1) {
      const novo = s.replace(anchor, anchor + "\n" + CSS);
      writeFileSync(LDP, novo, "utf8");
      console.log("[hero_center_landing] aplicado, delta=" + (novo.length - s.length));
    } else {
      console.error("[hero_center_landing] anchor invalido");
    }
  }
} catch (e) {
  console.error("[hero_center_landing] ERRO", e);
}
