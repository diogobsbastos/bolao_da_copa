// Round 3: /pote agora soma deposito approved + patrocinadores ativo
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const LP = join(__dir, "landing.ts");
const FLAG = join(__dir, "_fix_landing.r3.done");

try {
  if (existsSync(FLAG)) {
    console.log("[fix_landing_r3] ja aplicado, skip");
  } else {
    let s = readFileSync(LP, "utf8");
    const before = s;
    const log: any = {};

    // Bloco original que calcula v (soma depositos) + n (count)
    const oldBlock = `      const r = await pool.query("SELECT COALESCE(SUM(valor),0) AS v, COUNT(*) AS n FROM depositos WHERE status='approved' AND creditado=true");
      const v = Number((r.rows[0] as any).v || 0);
      const n = Number((r.rows[0] as any).n || 0);`;
    const newBlock = `      const r = await pool.query("SELECT COALESCE(SUM(valor),0) AS v, COUNT(*) AS n FROM depositos WHERE status='approved' AND creditado=true");
      let v = Number((r.rows[0] as any).v || 0);
      const n = Number((r.rows[0] as any).n || 0);
      try {
        const sp = await pool.query("SELECT COALESCE(SUM(valor),0) AS pv FROM patrocinadores WHERE status='ativo'");
        v += Number((sp.rows[0] as any).pv || 0);
      } catch {}`;
    const occ = s.split(oldBlock).length - 1;
    log.occ = occ;
    if (occ === 1) {
      s = s.replace(oldBlock, newBlock);
      log.pote = "ok";
    } else {
      log.pote = "NAO_TROCOU";
    }

    log.changed = s !== before;
    log.ts = new Date().toISOString();

    if (s !== before) {
      writeFileSync(LP + ".prefix_fix_r3", before, "utf8");
      writeFileSync(LP, s, "utf8");
    }
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_landing_r3]", log);
  }
} catch (e) {
  console.error("[fix_landing_r3] ERRO", e);
}
