// v2: 1o grab COMMITA o placar (UI ja mostra FINAL) + marca resultado_pendente.
// apurarJogo bloqueia enquanto resultado_pendente != null. 2o grab confirma + libera apuracao.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FLAG = join(__dir, "_fix_doublecheck_v2.done");

// === Patch 1: scores365.ts processarResultadoJogo ===
const SC_OLD = `  // ESTRATEGIA ANTI-ERRO: 1o grab vira pendente. 20min depois, 2o grab. Se divergir, usa LATEST.
  let pendRaw: any = null;
  try { pendRaw = (await pool.query("SELECT resultado_pendente FROM jogos WHERE id=$1", [j.id])).rows[0]?.resultado_pendente; } catch {}
  if (!pendRaw) {
    try { await pool.query("UPDATE jogos SET resultado_pendente=$1::jsonb WHERE id=$2 AND resultado_pendente IS NULL AND resultado_casa IS NULL", [JSON.stringify({ rc, rv, em: new Date().toISOString() }), j.id]); } catch {}
    console.log("[resultados] jogo", j.id, "1o grab pendente", rc + "-" + rv, "(aguarda 20min)");
    return { jogo: j.id, estado: "pendente-1o-grab", placar: rc + "-" + rv };
  }
  const pendObj: any = typeof pendRaw === "string" ? JSON.parse(pendRaw) : pendRaw;
  const pendEm = new Date(pendObj?.em || 0).getTime();
  if (Date.now() - pendEm < 20 * 60 * 1000) return { jogo: j.id, estado: "aguardando-20min", placar: rc + "-" + rv };
  // 20min passou — usa LATEST (placar recem buscado vence)
  const divergiu = (pendObj.rc !== rc || pendObj.rv !== rv);
  await pool.query("UPDATE jogos SET resultado_casa=$2, resultado_visitante=$3, resultado_em=now(), status='final', resultado_pendente=NULL WHERE id=$1 AND resultado_casa IS NULL", [j.id, rc, rv]);
  await coletarGolsDoJogo(g, j.id).catch(() => {});
  const ap = await apurarJogo(j.id);
  if (divergiu) console.log("[resultados] jogo", j.id, "DIVERGENCIA 1o:", pendObj.rc + "-" + pendObj.rv, "2o:", rc + "-" + rv, "(usei 2o)");
  console.log("[resultados] jogo", j.id, "FINAL apos double-check", rc + "-" + rv, "tokens", ap.tokens);
  return { jogo: j.id, estado: "final", placar: rc + "-" + rv, tokens: ap.tokens };`;

const SC_NEW = `  // ESTRATEGIA ANTI-ERRO v2: 1o grab COMMITA placar (UI mostra FINAL) + bloqueia apuracao. 20min depois, 2o grab confirma. Se divergir, atualiza.
  let pendRaw: any = null;
  try { pendRaw = (await pool.query("SELECT resultado_pendente FROM jogos WHERE id=$1", [j.id])).rows[0]?.resultado_pendente; } catch {}
  if (!pendRaw) {
    // 1o grab: COMMITA placar (status=final, resultado_casa/visitante setados) + marca pendente pra bloquear apuracao
    try { await pool.query("UPDATE jogos SET resultado_casa=$2, resultado_visitante=$3, resultado_em=now(), status='final', resultado_pendente=$4::jsonb WHERE id=$1 AND resultado_casa IS NULL", [j.id, rc, rv, JSON.stringify({ rc, rv, em: new Date().toISOString() })]); } catch {}
    await coletarGolsDoJogo(g, j.id).catch(() => {});
    console.log("[resultados] jogo", j.id, "1o grab COMMITADO", rc + "-" + rv, "(apuracao bloqueada 20min)");
    return { jogo: j.id, estado: "1o-grab-commitado", placar: rc + "-" + rv };
  }
  const pendObj: any = typeof pendRaw === "string" ? JSON.parse(pendRaw) : pendRaw;
  const pendEm = new Date(pendObj?.em || 0).getTime();
  if (Date.now() - pendEm < 20 * 60 * 1000) return { jogo: j.id, estado: "aguardando-20min", placar: rc + "-" + rv };
  // 20min passou — usa LATEST e libera apuracao
  const divergiu = (pendObj.rc !== rc || pendObj.rv !== rv);
  await pool.query("UPDATE jogos SET resultado_casa=$2, resultado_visitante=$3, resultado_em=now(), status='final', resultado_pendente=NULL WHERE id=$1", [j.id, rc, rv]);
  if (divergiu) { await coletarGolsDoJogo(g, j.id).catch(() => {}); }
  const ap = await apurarJogo(j.id);
  if (divergiu) console.log("[resultados] jogo", j.id, "DIVERGENCIA 1o:", pendObj.rc + "-" + pendObj.rv, "2o:", rc + "-" + rv, "(atualizei pro 2o)");
  console.log("[resultados] jogo", j.id, "APURADO apos double-check", rc + "-" + rv, "tokens", ap.tokens);
  return { jogo: j.id, estado: "final", placar: rc + "-" + rv, tokens: ap.tokens };`;

// === Patch 2: pontuacao.ts apurarJogo — bloqueia se resultado_pendente nao for null ===
const PT_OLD = `  const j = (await pool.query("SELECT id, inicio, selecao_casa AS casa, selecao_visitante AS visitante, resultado_casa AS rc, resultado_visitante AS rv FROM jogos WHERE id=$1", [jogoId])).rows[0] as any;
  if (!j) return { ok: false, jogo: jogoId, palpites: 0, creditados: 0, tokens: 0, motivo: "jogo nao existe" };
  if (j.rc == null || j.rv == null) return { ok: false, jogo: jogoId, palpites: 0, creditados: 0, tokens: 0, motivo: "sem resultado real" };`;

const PT_NEW = `  const j = (await pool.query("SELECT id, inicio, selecao_casa AS casa, selecao_visitante AS visitante, resultado_casa AS rc, resultado_visitante AS rv, resultado_pendente AS rpend FROM jogos WHERE id=$1", [jogoId])).rows[0] as any;
  if (!j) return { ok: false, jogo: jogoId, palpites: 0, creditados: 0, tokens: 0, motivo: "jogo nao existe" };
  if (j.rc == null || j.rv == null) return { ok: false, jogo: jogoId, palpites: 0, creditados: 0, tokens: 0, motivo: "sem resultado real" };
  if (j.rpend != null) return { ok: true, jogo: jogoId, palpites: 0, creditados: 0, tokens: 0, motivo: "aguardando_double_check" };`;

try {
  if (existsSync(FLAG)) {
    console.log("[fix_doublecheck_v2] ja aplicado, skip");
  } else {
    const log: any = {};
    // 1) scores365.ts
    try {
      const SP = join(__dir, "scores365.ts");
      const s = readFileSync(SP, "utf8");
      const occ = s.split(SC_OLD).length - 1;
      log.sc_occ = occ;
      if (occ === 1) {
        const novo = s.replace(SC_OLD, SC_NEW);
        writeFileSync(SP + ".prefix_dc_v2", s, "utf8");
        writeFileSync(SP, novo, "utf8");
        log.sc = { aplicado: true, delta: novo.length - s.length };
      } else log.sc = "anchor !== 1";
    } catch (e: any) { log.sc = "ERRO: " + String(e?.message); }
    // 2) pontuacao.ts
    try {
      const PP = join(__dir, "pontuacao.ts");
      const s = readFileSync(PP, "utf8");
      const occ = s.split(PT_OLD).length - 1;
      log.pt_occ = occ;
      if (occ === 1) {
        const novo = s.replace(PT_OLD, PT_NEW);
        writeFileSync(PP + ".prefix_dc_v2", s, "utf8");
        writeFileSync(PP, novo, "utf8");
        log.pt = { aplicado: true, delta: novo.length - s.length };
      } else log.pt = "anchor !== 1";
    } catch (e: any) { log.pt = "ERRO: " + String(e?.message); }
    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_doublecheck_v2]", log);
  }
} catch (e) {
  console.error("[fix_doublecheck_v2] ERRO", e);
}
