// Atualiza poteTot do jogar.ts (2 ocorrencias) pra somar deposito + patrocinador
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const JP = join(__dir, "jogar.ts");
const FLAG = join(__dir, "_fix_jogar.done");

try {
  if (existsSync(FLAG)) {
    console.log("[fix_jogar] ja aplicado, skip");
  } else {
    let s = readFileSync(JP, "utf8");
    const before = s;
    const log: any = {};

    const oldStr = `let poteTot=0;try{const _pr=await pool.query("SELECT COALESCE(SUM(valor),0) AS v FROM depositos WHERE status='approved'");poteTot=Number(_pr.rows[0].v)||0;}catch{}`;
    const newStr = `let poteTot=0;try{const _pr=await pool.query("SELECT COALESCE(SUM(valor),0) AS v FROM depositos WHERE status='approved'");poteTot=Number(_pr.rows[0].v)||0;}catch{} try{const _sp=await pool.query("SELECT COALESCE(SUM(valor),0) AS v FROM patrocinadores WHERE status='ativo'");poteTot+=Number(_sp.rows[0].v)||0;}catch{}`;

    const occ = s.split(oldStr).length - 1;
    log.occ = occ;
    if (occ >= 1) {
      s = s.split(oldStr).join(newStr);
      log.replace = "ok";
    } else {
      log.replace = "NAO_TROCOU";
    }

    log.changed = s !== before;
    log.ts = new Date().toISOString();

    if (s !== before) {
      writeFileSync(JP + ".prefix_fix", before, "utf8");
      writeFileSync(JP, s, "utf8");
    }
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_jogar]", log);
  }
} catch (e) {
  console.error("[fix_jogar] ERRO", e);
}
