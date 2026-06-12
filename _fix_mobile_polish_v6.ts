// Polish v6 — override v5: .actcol vira pequeno × no canto top-right; .act-logic
// volta a ser row (Preencher pela logica + Auto toggle + ? na MESMA linha).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FLAG = join(__dir, "_fix_mobile_polish_v6.done");

const CSS_INSERT =
  "\n/* --- MOBILE POLISH v6 (12/jun): .actcol pequeno top-right + .act-logic row --- */\n" +
  "@media(max-width:600px){\n" +
  " /* Container relativo pra ancorar o X absoluto */\n" +
  " div#autobar.actpanel{position:relative!important;padding:32px 10px 10px 10px!important}\n" +
  " /* X = botaozinho compacto no canto superior direito */\n" +
  " div#autobar.actpanel>.actcol{position:absolute!important;top:6px!important;right:8px!important;width:26px!important;height:26px!important;min-width:0!important;max-width:26px!important;padding:0!important;font-size:14px!important;line-height:1!important;border-radius:50%!important;align-self:auto!important;z-index:3}\n" +
  " /* act-logic: ROW — Preencher (flex grande) + Auto (compacto) + ? (compacto), na mesma linha */\n" +
  " div#autobar.actpanel>.act-logic{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;align-items:center!important;gap:6px!important;width:100%!important}\n" +
  " /* Primeiro filho (Preencher pela logica): toma o espaco principal */\n" +
  " div#autobar.actpanel>.act-logic>*:first-child{flex:1 1 60%!important;width:auto!important;min-width:0!important;max-width:100%!important}\n" +
  " /* Demais filhos (Auto toggle, ?, etc): compactos a direita */\n" +
  " div#autobar.actpanel>.act-logic>*:not(:first-child){flex:0 0 auto!important;width:auto!important;max-width:none!important}\n" +
  " /* Botoes do act-logic com height/padding uniformes */\n" +
  " div#autobar.actpanel>.act-logic button{height:36px!important;padding:6px 12px!important;font-size:13px!important;white-space:nowrap!important}\n" +
  " /* Auto toggle precisa caber */\n" +
  " div#autobar.actpanel>.act-logic .toggle,div#autobar.actpanel>.act-logic [class*=toggle],div#autobar.actpanel>.act-logic [class*=switch]{flex:0 0 auto!important;width:auto!important}\n" +
  "}\n";

try {
  if (existsSync(FLAG)) {
    console.log("[fix_mobile_polish_v6] ja aplicado, skip");
  } else {
    const log: any = {};
    const LP = join(__dir, "jogar_style.ts");
    const s = readFileSync(LP, "utf8");
    const anchor = ".ob-emoji{font-size:46px}}\n`;";
    const occ = s.split(anchor).length - 1;
    log.anchor_occ = occ;
    if (occ === 1) {
      const novo = s.replace(anchor, CSS_INSERT + anchor);
      writeFileSync(LP + ".prefix_fix_polish_v6", s, "utf8");
      writeFileSync(LP, novo, "utf8");
      log.aplicado = true;
      log.delta = novo.length - s.length;
    } else { log.aplicado = false; log.motivo = "anchor !== 1"; }
    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_mobile_polish_v6]", log);
  }
} catch (e) {
  console.error("[fix_mobile_polish_v6] ERRO", e);
}
