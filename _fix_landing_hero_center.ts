// Centraliza .hero/.copy/.feats + form de login na landing mobile (sem tocar no header).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const MARKER = "/* HERO-CENTER-LANDING 2026-06-13-v2 */";

const CSS = `${MARKER}
@media(max-width:560px){
 .hero{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;text-align:center!important;width:100%!important;max-width:100%!important;margin-left:auto!important;margin-right:auto!important}
 .hero>*{margin-left:auto!important;margin-right:auto!important;align-self:center!important}
 .hero .copy{text-align:center!important;margin:0 auto!important;width:100%!important;max-width:380px!important}
 .hero .feats{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;align-items:center!important;gap:8px!important;margin:14px auto 0!important;width:100%!important;max-width:380px!important}
 .hero .feats>*{flex:0 1 auto!important;margin:0!important}
 /* Login card / form / continuar com Google — centralizado */
 .lform,.login-card,.auth-card,.lcard,form.auth,form.login,
 [class*=lform],[class*=auth-card],[class*=login-card],[class*=login-form]{
  margin-left:auto!important;margin-right:auto!important;
  width:100%!important;max-width:380px!important;
  text-align:center!important;
 }
 .gsi-material-button,[class*=continuar],[class*=gsi-material]{
  margin-left:auto!important;margin-right:auto!important;display:block!important;
 }
}
`;

try {
  const LDP = join(__dir, "landing.ts");
  const s = readFileSync(LDP, "utf8");
  if (s.indexOf(MARKER) !== -1) {
    console.log("[hero_center_landing v2] ja aplicado, skip");
  } else {
    // Tenta anchor mais recente (v1 marker) ou fallback cdlab
    const v1 = "/* HERO-CENTER-LANDING 2026-06-13 */";
    let lAnchor: string;
    if (s.indexOf(v1) !== -1) {
      // Acha o fim do bloco @media do v1
      const idx = s.indexOf(v1);
      // Pula apos o comentario
      let pos = s.indexOf("*/", idx) + 2;
      while (pos < s.length && /\s/.test(s[pos])) pos++;
      // @media{ ... } — conta braces
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
          console.log("[hero_center_landing v2] aplicado apos v1, delta=" + (novo.length - s.length));
        }
      }
    } else {
      const fallback = "@media(max-width:560px){.cdlab{display:none}.cdval{min-width:0}}";
      if (s.split(fallback).length - 1 === 1) {
        const novo = s.replace(fallback, fallback + "\n" + CSS);
        writeFileSync(LDP, novo, "utf8");
        console.log("[hero_center_landing v2] aplicado no fallback, delta=" + (novo.length - s.length));
      }
    }
  }
} catch (e) {
  console.error("[hero_center_landing v2] ERRO", e);
}
