// Mobile UX Bloco A — P0.2 landing v2.
// v1 falhou: o @media(max-width:560px){} vazio que a auditoria sinalizou estava DENTRO de
// @keyframes shimmer (slot mal-posicionado). Ao preencher virou @media aninhado invalido
// e o parser CSS pulou. Agora: restaura do backup, e INJETA o CSS de mobile no topo-do-arquivo
// LOGO APOS o @media(max-width:560px){.cdlab...} ja existente (que e top-level valido).
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const LP = join(__dir, "landing.ts");
const BK = join(__dir, "landing.ts.prefix_fix_mobile");
const FLAG = join(__dir, "_fix_mobile_landing.done");
const FLAG_V2 = join(__dir, "_fix_mobile_landing.v2.done");

try {
  if (existsSync(FLAG_V2)) {
    console.log("[fix_mobile_landing v2] ja aplicado, skip");
  } else {
    const log: any = {};

    // 1) Rollback: se backup do v1 existe, restaura landing.ts dele.
    if (existsSync(BK)) {
      copyFileSync(BK, LP);
      log.rollback = "OK do .prefix_fix_mobile";
    } else {
      log.rollback = "sem backup v1 (assumindo landing.ts ja original)";
    }

    const s = readFileSync(LP, "utf8");
    const before = s;

    // 2) Ancora: o bloco @media(max-width:560px){.cdlab/.cdval} ja existente.
    // Esse e top-level (do CSS principal). Vamos appendar nosso bloco logo apos.
    const ANCHOR = "@media(max-width:560px){.cdlab{display:none}.cdval{min-width:0}}";
    const occ = s.split(ANCHOR).length - 1;
    log.anchor_occ = occ;

    const CSS_INNER =
      ".nav{padding:10px 14px;gap:8px}" +
      ".brand .blogo{height:26px}" +
      ".nav .cdmini{position:static;transform:none;order:3;flex:1 1 100%;justify-content:center;margin:2px 0 0;left:auto;top:auto}" +
      ".hmpote{font-size:11px;padding:4px 9px}";

    const INSERT = "@media(max-width:560px){" + CSS_INNER + "}";

    if (occ === 1) {
      // Garantir que nao vai duplicar caso v1 tenha sobrevivido por algum motivo
      const yaTem = s.indexOf(CSS_INNER) !== -1;
      log.ja_tinha_meu_css = yaTem;
      if (!yaTem) {
        const novo = s.replace(ANCHOR, ANCHOR + INSERT);
        writeFileSync(LP + ".prefix_fix_mobile_v2", before, "utf8");
        writeFileSync(LP, novo, "utf8");
        log.aplicado = true;
        log.delta = novo.length - before.length;
      } else {
        log.aplicado = false;
        log.motivo = "css ja presente";
      }
    } else {
      log.aplicado = false;
      log.motivo = "anchor !== 1 ocorrencia";
    }

    // 3) Limpa flag v1 (se existir) pra registro
    if (existsSync(FLAG)) {
      try { writeFileSync(FLAG, JSON.stringify({superseded_by: "v2", ts: new Date().toISOString()}, null, 2)); } catch {}
    }
    log.ts = new Date().toISOString();
    writeFileSync(FLAG_V2, JSON.stringify(log, null, 2));
    console.log("[fix_mobile_landing v2]", log);
  }
} catch (e) {
  console.error("[fix_mobile_landing v2] ERRO", e);
}
