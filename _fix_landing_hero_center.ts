// RESTORE v25 (2026-06-13) — recoloca os 3 blocos POLISH-LANDING-CSS (v23/v24/v25)
// que existiam no commit 6cb07c8 (polish v25) e foram removidos pelo _fix_landing_undo.
// Insere via ancora, idempotente (marca pelo comentario v25). NAO mexe em mais nada.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));

const ANCHOR = "@media(max-width:560px){.cdlab{display:none}.cdval{min-width:0}}";
const MARK = "/* POLISH-LANDING-CSS 2026-06-13-25 */";

const BLOCKS = `

/* POLISH-LANDING-CSS 2026-06-13-25 */
@media(max-width:560px){
 /* CENTRALIZA brand + tarja Beta inline */
 .brand{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;gap:8px!important;flex-wrap:wrap!important;width:100%!important;margin-left:auto!important;margin-right:auto!important;text-align:center!important}
 .brand .blogo{max-height:64px!important;width:auto!important;height:auto!important}
 .brand .bbeta{display:inline-flex!important;font-size:10px!important;padding:2px 7px!important;border-radius:4px!important;align-self:center!important;margin:0!important}
 .hlogo,.hero,[class*=hero],[class*=login],[class*=form]{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:8px!important;flex-wrap:wrap!important;text-align:center!important;margin-left:auto!important;margin-right:auto!important}
 .nav{flex-wrap:wrap!important;justify-content:center!important}
 .cdmini{position:static!important;transform:none!important;order:99!important;flex:1 1 100%!important;justify-content:center!important;left:auto!important;top:auto!important;margin:6px auto 0!important}
}


/* POLISH-LANDING-CSS 2026-06-13-24 */
@media(max-width:560px){
 .brand{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;gap:8px!important;flex-wrap:wrap!important;width:100%!important}
 .brand .blogo{max-height:54px!important;width:auto!important;height:auto!important}
 .brand .bbeta{display:inline-flex!important;font-size:10px!important;padding:2px 7px!important;border-radius:4px!important;align-self:center!important;margin:0!important}
 .hlogo{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;gap:8px!important;flex-wrap:wrap!important}
}


/* POLISH-LANDING-CSS 2026-06-13-23 */
@media(max-width:560px){
 .brand{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;gap:8px!important;flex-wrap:wrap!important;width:100%!important}
 .brand .blogo{max-height:54px!important;width:auto!important;height:auto!important}
 .brand .bbeta{display:inline-flex!important;font-size:10px!important;padding:2px 7px!important;border-radius:4px!important;align-self:center!important;margin:0!important}
 .hlogo{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;gap:8px!important;flex-wrap:wrap!important}
}`;

try {
  const LDP = join(__dir, "landing.ts");
  let s = readFileSync(LDP, "utf8");

  if (s.indexOf(MARK) !== -1) {
    console.log("[restore v25] blocos POLISH-LANDING-CSS ja presentes, skip");
  } else if (s.indexOf(ANCHOR) === -1) {
    console.error("[restore v25] ancora .cdlab NAO encontrada — nada inserido");
  } else if (s.split(ANCHOR).length - 1 !== 1) {
    console.error("[restore v25] ancora aparece mais de 1x — abortado por seguranca");
  } else {
    s = s.replace(ANCHOR, ANCHOR + BLOCKS);
    writeFileSync(LDP, s, "utf8");
    console.log("[restore v25] 3 blocos POLISH-LANDING-CSS (v23/24/25) reinseridos");
  }
} catch (e) {
  console.error("[restore v25] ERRO", e);
}
