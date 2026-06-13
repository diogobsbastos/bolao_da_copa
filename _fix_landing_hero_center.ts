// HERO-CENTER v5 (2026-06-13) — CORRIGE o bug do v4.
// O card de login e .hero > .card (NAO esta dentro de .feats). v4 mirava .feats .card
// e por isso nunca centralizava. Aqui centralizamos no mobile:
//   - .hero > .card (login): max-width 380px, centralizado
//   - .copy .hlogo (imagem hero): centralizada
//   - .copy / .feats: conteudo centralizado (reforco; ja eram, mas garante)
// NAO toca no header (.nav/.brand/.cdmini). Idempotente: remove blocos HERO-CENTER
// antigos (v1..v5) e reinsere antes do ultimo </style> (vence o cascade).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const MARKER = "/* HERO-CENTER-LANDING v5 2026-06-13 */";

const CSS = `${MARKER}
@media(max-width:820px){
 .hero{justify-items:center!important;}
 .hero>.card{justify-self:center!important;align-self:start!important;width:100%!important;max-width:380px!important;margin-left:auto!important;margin-right:auto!important;}
 .hero>.copy{text-align:center!important;width:100%!important;max-width:420px!important;margin-left:auto!important;margin-right:auto!important;}
 .copy .hlogo{display:block!important;margin-left:auto!important;margin-right:auto!important;}
 .feats{justify-content:center!important;}
}
`;

try {
  const LDP = join(__dir, "landing.ts");
  let s = readFileSync(LDP, "utf8");

  // 1) Remove TODOS os blocos HERO-CENTER-LANDING (qualquer versao), via brace-matching p/ @media.
  let removed = 0;
  while (true) {
    const startIdx = s.indexOf("/* HERO-CENTER-LANDING");
    if (startIdx < 0) break;
    const endComment = s.indexOf("*/", startIdx);
    if (endComment < 0) break;
    let pos = endComment + 2;
    while (pos < s.length && /\s/.test(s[pos])) pos++;
    if (!s.substring(pos).startsWith("@media")) {
      // marker sem bloco @media logo apos: remove so o comentario
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

  // 2) Insere o CSS novo antes do ULTIMO </style> (assim fica por ultimo na folha e vence).
  const lastStyle = s.lastIndexOf("</style>");
  if (lastStyle >= 0) {
    s = s.substring(0, lastStyle) + "\n" + CSS + "\n" + s.substring(lastStyle);
    writeFileSync(LDP, s, "utf8");
    console.log("[hero_center v5] removidos", removed, "blocos antigos; CSS v5 inserido antes de </style>");
  } else {
    console.error("[hero_center v5] </style> NAO encontrado em landing.ts — nada inserido");
  }
} catch (e) {
  console.error("[hero_center v5] ERRO", e);
}
