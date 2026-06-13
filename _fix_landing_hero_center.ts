// LANDING v25 + CENTER-FIX (2026-06-13)
// 1) Garante os 3 blocos POLISH-LANDING-CSS (v23/24/25) — estado v25 que o dono pediu.
// 2) CENTER-FIX: limita a largura de .copy/.card/.feats no mobile pra eles NAO transbordarem
//    pra direita (causa real do "empurrao": filho mais largo que o .hero flex-column encosta
//    na esquerda e vaza pra direita). Com max-width + margin auto, ficam centralizados.
// Tudo idempotente (marca por comentario). NAO mexe no header nem no JS recenter.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const ANCHOR = "@media(max-width:560px){.cdlab{display:none}.cdval{min-width:0}}";
const MARK25 = "/* POLISH-LANDING-CSS 2026-06-13-25 */";
const MARKFIX = "/* CENTER-FIX 2026-06-13 */";

const BLOCKS25 = `

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

const CENTERFIX = `
/* CENTER-FIX 2026-06-13 */
@media(max-width:560px){
 .hero{align-items:center!important;padding-left:12px!important;padding-right:12px!important}
 .hero>.copy,.hero>.card{width:100%!important;max-width:360px!important;margin-left:auto!important;margin-right:auto!important;align-self:center!important}
 .copy,.feats{text-align:center!important}
 .feats{justify-content:center!important}
}
`;

try {
  const LDP = join(__dir, "landing.ts");
  let s = readFileSync(LDP, "utf8");
  let changed = false;

  // 1) blocos v25 (se faltarem)
  if (s.indexOf(MARK25) === -1 && s.indexOf(ANCHOR) !== -1 && (s.split(ANCHOR).length - 1) === 1) {
    s = s.replace(ANCHOR, ANCHOR + BLOCKS25);
    changed = true;
    console.log("[landing] blocos v25 reinseridos");
  }

  // 2) CENTER-FIX (se faltar) — antes do ultimo </style> pra vencer o cascade
  if (s.indexOf(MARKFIX) === -1) {
    const last = s.lastIndexOf("</style>");
    if (last >= 0) {
      s = s.substring(0, last) + "\n" + CENTERFIX + "\n" + s.substring(last);
      changed = true;
      console.log("[landing] CENTER-FIX inserido");
    } else {
      console.error("[landing] </style> nao encontrado p/ CENTER-FIX");
    }
  }

  if (changed) writeFileSync(LDP, s, "utf8");
  else console.log("[landing] nada a fazer (v25 + center-fix ja presentes)");
} catch (e) {
  console.error("[landing] ERRO", e);
}
