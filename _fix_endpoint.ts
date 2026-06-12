// Garante que existe app.get("/inicio") em landing.ts
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const LP = join(__dir, "landing.ts");
const FLAG = join(__dir, "_fix_endpoint.done");

try {
  if (existsSync(FLAG)) { console.log("[fix_endpoint] skip"); }
  else {
    let s = readFileSync(LP, "utf8");
    const before = s;
    const log: any = {};
    log.has_inicio = s.includes(`app.get("/inicio"`);
    if (!log.has_inicio) {
      const anchor = `app.get("/pote", async (_req, reply) => {`;
      const inject = `app.get("/inicio", async (_req, reply) => {
    try {
      const r = await pool.query("SELECT valor FROM config WHERE chave='bolao_inicio_oficial'");
      const iso = String((r.rows[0] as any)?.valor || "2026-06-13T22:00:00.000Z");
      return reply.header("cache-control","public, max-age=60").send({ ok: true, iso });
    } catch { return { ok: false, iso: "2026-06-13T22:00:00.000Z" }; }
  });
  ` + anchor;
      const occ = s.split(anchor).length - 1;
      log.anchor_occ = occ;
      if (occ === 1) {
        s = s.replace(anchor, inject);
        log.injected = true;
        writeFileSync(LP + ".prefix_fix_endpoint", before, "utf8");
        writeFileSync(LP, s, "utf8");
      }
    }
    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_endpoint]", log);
  }
} catch (e: any) {
  console.error("[fix_endpoint] ERRO", e?.message || e);
}
