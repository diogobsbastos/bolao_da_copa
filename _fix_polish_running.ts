// Polish running — acumulador unico daqui pra frente.
// Idempotencia via MARKER dentro do proprio CSS (nao precisa .done).
// Pra adicionar nova rodada de fixes: muda VERSION + edita CSS_BLOCK + restart 2x.
// Patches antigos (v1-v10) ja estao baked em jogar_style.ts/jogar_page.ts; nao mexer.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));

const VERSION = "2026-06-13-01";
const MARKER = `/* POLISH-RUNNING ${VERSION} */`;

// CSS_BLOCK acumula. Quando quiser adicionar, muda VERSION e adiciona regras aqui.
// Mobile only — tudo dentro de @media(max-width:600px).
const CSS_BLOCK = `
${MARKER}
@media(max-width:600px){
 /* (vazio por enquanto — pronto pra receber proximos ajustes) */
}
`;

try {
  const LP = join(__dir, "jogar_style.ts");
  const s = readFileSync(LP, "utf8");
  if (s.indexOf(MARKER) !== -1) {
    console.log("[polish_running]", VERSION, "ja aplicado, skip");
  } else {
    const anchor = ".ob-emoji{font-size:46px}}\n`;";
    if (s.split(anchor).length - 1 !== 1) {
      console.error("[polish_running] anchor invalido, abort");
    } else {
      const novo = s.replace(anchor, "\n" + CSS_BLOCK + anchor);
      writeFileSync(LP + ".prefix_polish_running", s, "utf8");
      writeFileSync(LP, novo, "utf8");
      console.log("[polish_running]", VERSION, "aplicado delta=" + (novo.length - s.length));
    }
  }
} catch (e) {
  console.error("[polish_running] ERRO", e);
}
