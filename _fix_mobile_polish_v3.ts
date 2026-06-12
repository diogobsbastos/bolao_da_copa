// Polish v3 — corrige bug do v2 que inflou o boneco do IA.
// v2 tinha .act-ia em flex-direction:column align:stretch → masc cresceu pra largura cheia
// e a bubble vazou pro lado.
// v3: mantem .act-ia em ROW (masc 50px esquerda + bubble flexivel direita),
// e mantem .act-logic em COLUMN (que estava OK).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FLAG = join(__dir, "_fix_mobile_polish_v3.done");

const CSS_INSERT =
  "\n/* --- MOBILE POLISH v3 (12/jun): OVERRIDE v2 — masc do IA volta a ser pequeno --- */\n" +
  "@media(max-width:600px){\n" +
  " /* .act-ia: volta pra linha, mascote pequeno a esquerda */\n" +
  " #autobar.actpanel .act-ia{flex-direction:row!important;align-items:center!important;flex-wrap:nowrap!important;gap:10px!important;width:100%}\n" +
  " #autobar.actpanel .act-ia .masc{flex:0 0 auto!important;width:48px!important;height:48px!important;max-width:48px!important;min-width:48px!important;align-self:center;margin:0!important}\n" +
  " #autobar.actpanel .act-ia .masc svg{width:48px!important;height:48px!important;max-width:48px!important}\n" +
  " #autobar.actpanel .act-ia .bubble{flex:1 1 auto!important;width:auto!important;min-width:0!important;max-width:none!important}\n" +
  " /* .act-logic: mantem column (botoes empilhados) */\n" +
  " #autobar.actpanel .act-logic{flex-direction:column!important;gap:6px;width:100%}\n" +
  " #autobar.actpanel .act-logic > *{width:100%;max-width:100%}\n" +
  "}\n";

try {
  if (existsSync(FLAG)) {
    console.log("[fix_mobile_polish_v3] ja aplicado, skip");
  } else {
    const log: any = {};
    const LP = join(__dir, "jogar_style.ts");
    const s = readFileSync(LP, "utf8");
    const anchor = ".ob-emoji{font-size:46px}}\n`;";
    const occ = s.split(anchor).length - 1;
    log.anchor_occ = occ;
    if (occ === 1) {
      const novo = s.replace(anchor, CSS_INSERT + anchor);
      writeFileSync(LP + ".prefix_fix_polish_v3", s, "utf8");
      writeFileSync(LP, novo, "utf8");
      log.aplicado = true;
      log.delta = novo.length - s.length;
    } else { log.aplicado = false; log.motivo = "anchor !== 1, skip"; }
    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_mobile_polish_v3]", log);
  }
} catch (e) {
  console.error("[fix_mobile_polish_v3] ERRO", e);
}
