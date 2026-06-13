// PATCHES DE BOOT (2026-06-13) — roda no boot, idempotente.
// A) LANDING: v25 + CENTER-FIX + GOOGLE-FIT.
// B) JOGAR autocomplete Artilheiro: jogadores.id e BIGINT (string no JSON); compara como string.
// C) JOGAR actpanel ("Conecte sua IA") SO no tema claro (body.light): toggle Auto (ON) e X de
//    fechar ficam no VERDE PADRAO (--pri). Tema escuro intocado.
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

// ---- A) LANDING ----
try {
  const LDP = join(__dir, "landing.ts");
  let s = readFileSync(LDP, "utf8");
  let changed = false;
  if (s.indexOf(MARK25) === -1 && s.indexOf(ANCHOR) !== -1 && (s.split(ANCHOR).length - 1) === 1) {
    s = s.replace(ANCHOR, ANCHOR + BLOCKS25); changed = true;
  }
  const semFix = removeBloco(s, MARKFIX);
  if (semFix !== s) { s = semFix; changed = true; }
  const last = s.lastIndexOf("</style>");
  if (last >= 0) { s = s.substring(0, last) + "\n" + CENTERFIX + "\n" + s.substring(last); changed = true; }
  const ALVO = 'width:330,logo_alignment';
  const NOVO = 'width:Math.max(200,Math.min(400,((document.getElementById("entrar")||{}).clientWidth||349)-60)),logo_alignment';
  if (s.indexOf(ALVO) !== -1) { s = s.replace(ALVO, NOVO); changed = true; }
  if (changed) { writeFileSync(LDP, s, "utf8"); console.log("[landing] patches aplicados"); }
  else console.log("[landing] nada a fazer");
} catch (e) { console.error("[landing] ERRO", e); }

// ---- B) JOGAR: Artilheiro clicavel (fix de tipo bigint/string) ----
try {
  const JP = join(__dir, "jogar_page.ts");
  let j = readFileSync(JP, "utf8");
  let ch = 0;
  const OLDpd = '.addEventListener("mousedown",function(e){var o=e.target.closest(".acopt");';
  const NEWpd = '.addEventListener("mousedown",function(e){e.preventDefault();var o=e.target.closest(".acopt");';
  if (j.indexOf(NEWpd) === -1 && j.indexOf(OLDpd) !== -1) { j = j.split(OLDpd).join(NEWpd); ch++; }
  const OLDh = 'var k=+o.getAttribute("data-k");var j=null;for(var i=0;i<LP_JOG.length;i++){if(LP_JOG[i].id===k){';
  const NEWh = 'var k=o.getAttribute("data-k");var j=null;for(var i=0;i<LP_JOG.length;i++){if(String(LP_JOG[i].id)===k){';
  if (j.indexOf(NEWh) === -1 && j.indexOf(OLDh) !== -1) { j = j.replace(OLDh, NEWh); ch++; }
  const OLDp = 'for(var i=0;i<LP_JOG.length;i++){if(LP_JOG[i].id===LP_PICK.art){jx=LP_JOG[i];break;}}';
  const NEWp = 'for(var i=0;i<LP_JOG.length;i++){if(String(LP_JOG[i].id)===String(LP_PICK.art)){jx=LP_JOG[i];break;}}';
  if (j.indexOf(NEWp) === -1 && j.indexOf(OLDp) !== -1) { j = j.replace(OLDp, NEWp); ch++; }
  if (ch) { writeFileSync(JP, j, "utf8"); console.log("[ac-art-fix] aplicado", ch, "patch(es)"); }
  else console.log("[ac-art-fix] ja aplicado");
} catch (e) { console.error("[ac-art-fix] ERRO", e); }

// ---- C) JOGAR: actpanel — verde padrao SO no tema claro (body.light) ----
try {
  const JS = join(__dir, "jogar_style.ts");
  let z = readFileSync(JS, "utf8");
  let ch = 0;
  // reverte mudancas incondicionais antigas (se ainda presentes)
  const reverts: [string, string][] = [
    ['.sl{position:absolute;inset:0;background:#9aa3b5;border:1px solid #9aa3b5;', '.sl{position:absolute;inset:0;background:var(--surface2);border:1px solid var(--bd);'],
    ['.sw input:checked+.sl{background:#14a06a;border-color:#14a06a}', '.sw input:checked+.sl{background:var(--rc,var(--pri));border-color:var(--rc,var(--pri))}'],
    ['background:#2b3340;border:1.5px solid #fff;color:#fff;font-size:10px;font-weight:800;line-height:1;display:inline-flex', 'background:var(--rc,#14a06a);border:1.5px solid var(--surface);color:#fff;font-size:10px;font-weight:800;line-height:1;display:inline-flex'],
  ];
  for (const [a, b] of reverts) { if (z.indexOf(a) !== -1) { z = z.replace(a, b); ch++; } }

  const anchor = '.actcol:hover{transform:scale(1.1)}';
  const OLD_OV = 'body.light .sl{background:#9aa3b5;border-color:#9aa3b5}body.light .sw input:checked+.sl{background:#14a06a;border-color:#14a06a}body.light .actcol{background:#2b3340;border-color:#fff;color:#fff}';
  const NEW_OV = 'body.light .sl{background:#9aa3b5!important;border-color:#9aa3b5!important}body.light .sw input:checked+.sl{background:var(--pri)!important;border-color:var(--pri)!important}body.light .actcol{background:var(--pri)!important;border-color:#fff!important;color:#fff!important}';
  if (z.indexOf(OLD_OV) !== -1) { z = z.replace(OLD_OV, NEW_OV); ch++; }
  else if (z.indexOf(NEW_OV) === -1 && z.indexOf(anchor) !== -1) { z = z.replace(anchor, anchor + NEW_OV); ch++; }

  if (ch) { writeFileSync(JS, z, "utf8"); console.log("[actpanel-light] aplicado", ch, "(verde padrao --pri no tema claro)"); }
  else console.log("[actpanel-light] ja ok");
} catch (e) { console.error("[actpanel-light] ERRO", e); }
