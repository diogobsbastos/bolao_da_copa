// UNDO de TODAS as alteracoes do polish_running na landing.ts.
// Remove TODOS os blocos POLISH-LANDING-CSS (v23..v28) e volta ao landing original.
// Idempotente via flag .done.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FLAG = join(__dir, "_fix_landing_undo.done");

try {
  if (existsSync(FLAG)) {
    console.log("[fix_landing_undo] ja aplicado, skip");
  } else {
    const LDP = join(__dir, "landing.ts");
    const s = readFileSync(LDP, "utf8");
    const before = s;

    // Estrategia: remove cada bloco POLISH-LANDING-CSS + seu @media completo (com brace matching).
    let result = s;
    let removed = 0;
    while (true) {
      const startIdx = result.indexOf("/* POLISH-LANDING-CSS");
      if (startIdx < 0) break;
      // Acha o fim do bloco: do startIdx ate o fechamento do @media (depth=0)
      // Pula ate o primeiro @media{
      let pos = startIdx;
      // Pula o comentario /* ... */
      const endComment = result.indexOf("*/", pos);
      if (endComment < 0) break;
      pos = endComment + 2;
      // Pula whitespace ate o @media
      while (pos < result.length && /\s/.test(result[pos])) pos++;
      // Confirma @media
      if (!result.substring(pos).startsWith("@media")) {
        // Apenas remove o comentario se nao tem @media a seguir
        result = result.substring(0, startIdx) + result.substring(endComment + 2);
        removed++;
        continue;
      }
      // Acha o primeiro {
      const openIdx = result.indexOf("{", pos);
      if (openIdx < 0) break;
      // Conta braces ate fechar o @media
      let depth = 1, endIdx = -1;
      for (let i = openIdx + 1; i < result.length; i++) {
        if (result[i] === "{") depth++;
        else if (result[i] === "}") { depth--; if (depth === 0) { endIdx = i + 1; break; } }
      }
      if (endIdx < 0) break;
      // Pula whitespace+newline pos fim
      let trim = endIdx;
      while (trim < result.length && /[\s\n]/.test(result[trim])) trim++;
      result = result.substring(0, startIdx) + result.substring(trim);
      removed++;
    }

    if (result !== before) {
      writeFileSync(LDP + ".prefix_landing_undo", before, "utf8");
      writeFileSync(LDP, result, "utf8");
      console.log("[fix_landing_undo] removidos", removed, "blocos, delta=" + (result.length - before.length));
    } else {
      console.log("[fix_landing_undo] nada a remover");
    }
    writeFileSync(FLAG, JSON.stringify({ removed, em: new Date().toISOString() }, null, 2));
  }
} catch (e) {
  console.error("[fix_landing_undo] ERRO", e);
}
