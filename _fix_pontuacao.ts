// Trava a pontuacao: jogos antes de config.bolao_inicio_oficial nao pontuam.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const PP = join(__dir, "pontuacao.ts");
const FLAG = join(__dir, "_fix_pontuacao.r1.done");

try {
  if (existsSync(FLAG)) {
    console.log("[fix_pontuacao] ja aplicado, skip");
  } else {
    let s = readFileSync(PP, "utf8");
    const before = s;
    const log: any = {};

    const old = `  const j = (await pool.query("SELECT id, resultado_casa AS rc, resultado_visitante AS rv FROM jogos WHERE id=$1", [jogoId])).rows[0] as any;
  if (!j) return { ok: false, jogo: jogoId, palpites: 0, creditados: 0, tokens: 0, motivo: "jogo nao existe" };
  if (j.rc == null || j.rv == null) return { ok: false, jogo: jogoId, palpites: 0, creditados: 0, tokens: 0, motivo: "sem resultado real" };`;
    const neu = `  const j = (await pool.query("SELECT id, inicio, resultado_casa AS rc, resultado_visitante AS rv FROM jogos WHERE id=$1", [jogoId])).rows[0] as any;
  if (!j) return { ok: false, jogo: jogoId, palpites: 0, creditados: 0, tokens: 0, motivo: "jogo nao existe" };
  if (j.rc == null || j.rv == null) return { ok: false, jogo: jogoId, palpites: 0, creditados: 0, tokens: 0, motivo: "sem resultado real" };
  // Trava de inicio oficial do bolao (config.bolao_inicio_oficial)
  let bloqueadoPreInicio = false;
  try {
    const _ini = (await pool.query("SELECT valor FROM config WHERE chave='bolao_inicio_oficial'")).rows[0]?.valor;
    if (_ini && j.inicio && new Date(j.inicio).getTime() < new Date(_ini).getTime()) bloqueadoPreInicio = true;
  } catch {}
  if (bloqueadoPreInicio) {
    // Zera pontos, nao credita token, marca como apurado pra nao reprocessar
    const pals0 = (await pool.query("SELECT id, usuario_id FROM palpites_bolao WHERE jogo_id=$1", [jogoId])).rows as any[];
    for (const p of pals0) {
      await pool.query("UPDATE palpites_bolao SET pontos=0, creditado=true WHERE id=$1", [p.id]);
    }
    await pool.query("UPDATE jogos SET apurado=true WHERE id=$1", [jogoId]);
    return { ok: true, jogo: jogoId, palpites: pals0.length, creditados: 0, tokens: 0, motivo: "pre_inicio_oficial" };
  }`;

    const occ = s.split(old).length - 1;
    log.occ = occ;
    if (occ === 1) {
      s = s.replace(old, neu);
      log.fix = "ok";
    } else {
      log.fix = "NAO_TROCOU";
    }

    log.changed = s !== before;
    log.ts = new Date().toISOString();

    if (s !== before) {
      writeFileSync(PP + ".prefix_fix_r1", before, "utf8");
      writeFileSync(PP, s, "utf8");
    }
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_pontuacao]", log);
  }
} catch (e) {
  console.error("[fix_pontuacao] ERRO", e);
}
