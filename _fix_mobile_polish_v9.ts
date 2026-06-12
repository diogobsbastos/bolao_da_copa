// Polish v9 — X simples sem fundo (so o caracter), toggle Auto sem background extra
// (deixa estilo original passar). Strip do que estava sobrando do v8.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FLAG = join(__dir, "_fix_mobile_polish_v9.done");

const CSS_INSERT =
  "\n/* --- MOBILE POLISH v9 (12/jun): X simples sem fundo, toggle volta ao natural --- */\n" +
  "@media(max-width:600px){\n" +
  " /* X (.actcol): sem fundo, sem borda, sem circulo. So o '×' branco posicionado */\n" +
  " div#autobar.actpanel>.actcol,.actpanel>.actcol{display:inline-flex!important;position:absolute!important;top:6px!important;right:8px!important;width:auto!important;min-width:0!important;max-width:none!important;height:auto!important;padding:2px 6px!important;font-size:16px!important;line-height:1!important;background:transparent!important;background-color:transparent!important;border:0!important;color:rgba(255,255,255,0.7)!important;border-radius:0!important;box-shadow:none!important;cursor:pointer!important;font-weight:400!important;z-index:5;align-items:center!important;justify-content:center!important}\n" +
  " /* Toggle Auto: deixa estilo natural, so garante que tem espaco */\n" +
  " div#autobar.actpanel>.act-logic>label,div#autobar.actpanel>.act-logic>.toggle,div#autobar.actpanel>.act-logic>.switch,div#autobar.actpanel>.act-logic>[class*=auto-toggle]{background:none!important;background-color:transparent!important;border:0!important;padding:0!important;flex:0 0 auto!important;min-width:0!important;max-width:none!important;width:auto!important;border-radius:0!important;color:inherit!important;box-shadow:none!important}\n" +
  "}\n";

try {
  if (existsSync(FLAG)) {
    console.log("[fix_mobile_polish_v9] ja aplicado, skip");
  } else {
    const log: any = {};
    const LP = join(__dir, "jogar_style.ts");
    const s = readFileSync(LP, "utf8");
    const anchor = ".ob-emoji{font-size:46px}}\n`;";
    const occ = s.split(anchor).length - 1;
    log.anchor_occ = occ;
    if (occ === 1) {
      const novo = s.replace(anchor, CSS_INSERT + anchor);
      writeFileSync(LP + ".prefix_fix_polish_v9", s, "utf8");
      writeFileSync(LP, novo, "utf8");
      log.aplicado = true;
      log.delta = novo.length - s.length;
    } else { log.aplicado = false; log.motivo = "anchor !== 1"; }
    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_mobile_polish_v9]", log);
  }
} catch (e) {
  console.error("[fix_mobile_polish_v9] ERRO", e);
}
