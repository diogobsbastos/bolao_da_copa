// LANDING v25 + CENTER-FIX + HEADER-FIX + GOOGLE-FIT (2026-06-13)
// 1) Garante os 3 blocos POLISH-LANDING-CSS (v23/24/25) — estado v25 que o dono pediu.
// 2) CENTER-FIX: limita largura de .copy/.card/.feats (nao transbordar pra direita) +
//    aperta o header (row-gap:0 e R$ margin-top:-10) pra tirar a linha em branco entre
//    o brand e a regiao amarela do R$.
// 3) GOOGLE-FIT: troca o width:330 fixo do botao Google por largura dinamica que cabe
//    dentro do card (#entrar) em qualquer tela — antes vazava pra fora.
// Tudo idempotente. NAO mexe no header HTML nem no resto do JS.
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
 .nav{row-gap:0px!important}
 .w.hmpote,.hmpote{margin-top:-10px!important}
}
`;

// remove um bloco "marker + @media{...}" via brace-matching; devolve a string sem ele
function removeBloco(s: string, marker: string): string {
  const start = s.indexOf(marker);
  if (start < 0) return s;
  const at = s.indexOf("@media", start);
  if (at < 0) return s.substring(0, start) + s.substring(start + marker.length);
  const open = s.indexOf("{", at);
  let depth = 1, end = -1;
  for (let i = open + 1; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end < 0) return s;
  let trim = end; while (trim < s.length && /\s/.test(s[trim])) trim++;
  return s.substring(0, start) + s.substring(trim);
}

try {
  const LDP = join(__dir, "landing.ts");
  let s = readFileSync(LDP, "utf8");
  let changed = false;

  // 1) blocos v25 (se faltarem)
  if (s.indexOf(MARK25) === -1 && s.indexOf(ANCHOR) !== -1 && (s.split(ANCHOR).length - 1) === 1) {
    s = s.replace(ANCHOR, ANCHOR + BLOCKS25);
    changed = true;
  }

  // 2) CENTER-FIX: remove versao antiga e reinsere a atual (antes do ultimo </style>)
  const semFix = removeBloco(s, MARKFIX);
  if (semFix !== s) { s = semFix; changed = true; } // tinha versao antiga -> removida
  const last = s.lastIndexOf("</style>");
  if (last >= 0) { s = s.substring(0, last) + "\n" + CENTERFIX + "\n" + s.substring(last); changed = true; }

  // 3) GOOGLE-FIT: width:330 fixo -> dinamico que cabe no card (#entrar)
  const ALVO = 'width:330,logo_alignment';
  const NOVO = 'width:Math.max(200,Math.min(400,((document.getElementById("entrar")||{}).clientWidth||349)-60)),logo_alignment';
  if (s.indexOf(ALVO) !== -1) {
    s = s.replace(ALVO, NOVO);
    changed = true;
    console.log("[google-fit] width dinamico aplicado");
  }

  if (changed) { writeFileSync(LDP, s, "utf8"); console.log("[landing] patches aplicados"); }
  else console.log("[landing] nada a fazer");
} catch (e) {
  console.error("[landing] ERRO", e);
}
