// Patch scores365.ts processarResultadoJogo pra estrategia anti-erro:
// 1o grab salva como pendente, espera 20min, 2o grab confirma. Se divergir, usa LATEST.
// Idempotente via .done flag. Coluna resultado_pendente jsonb ja foi criada via SQL.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FLAG = join(__dir, "_fix_resultados_doublecheck.done");

const OLD = `async function processarResultadoJogo(j: { id: number; selecao_casa: string; selecao_visitante: string; gid: string; inicio: any }): Promise<{ jogo: number; estado: string; placar?: string; tokens?: number }> {
  const gj = await s365(\`/game?appTypeId=5&langId=1&userCountryId=21&timezoneName=America/Sao_Paulo&gameId=\${j.gid}\`);
  const g = gj?.game; if (!g) return { jogo: j.id, estado: "sem game" };
  const hs = numScore(g.homeCompetitor?.score), ascore = numScore(g.awayCompetitor?.score);
  if (hs == null || ascore == null) return { jogo: j.id, estado: "sem placar" };
  const velho = j.inicio ? (Date.now() - new Date(j.inicio).getTime()) > 150 * 60 * 1000 : false;
  if (!statusFinal365(g) && !velho) return { jogo: j.id, estado: "em andamento" };
  const homeNome = String(g.homeCompetitor?.name || "");
  let rc: number, rv: number;
  if (casaLado(al(j.selecao_casa), homeNome)) { rc = hs; rv = ascore; }
  else if (casaLado(al(j.selecao_visitante), homeNome)) { rc = ascore; rv = hs; }
  else return { jogo: j.id, estado: "orientacao nao casou" };
  await pool.query("UPDATE jogos SET resultado_casa=$2, resultado_visitante=$3, resultado_em=now(), status='final' WHERE id=$1 AND resultado_casa IS NULL", [j.id, rc, rv]);
  await coletarGolsDoJogo(g, j.id).catch(() => {});
  const ap = await apurarJogo(j.id);
  return { jogo: j.id, estado: "final", placar: rc + "-" + rv, tokens: ap.tokens };
}`;

const NEW = `async function processarResultadoJogo(j: { id: number; selecao_casa: string; selecao_visitante: string; gid: string; inicio: any }): Promise<{ jogo: number; estado: string; placar?: string; tokens?: number }> {
  const gj = await s365(\`/game?appTypeId=5&langId=1&userCountryId=21&timezoneName=America/Sao_Paulo&gameId=\${j.gid}\`);
  const g = gj?.game; if (!g) return { jogo: j.id, estado: "sem game" };
  const hs = numScore(g.homeCompetitor?.score), ascore = numScore(g.awayCompetitor?.score);
  if (hs == null || ascore == null) return { jogo: j.id, estado: "sem placar" };
  // Precisa estar marcado final E ter passado >=120min do apito inicial (cobre regulamentar+stoppage)
  const elapsed = j.inicio ? Date.now() - new Date(j.inicio).getTime() : 0;
  if (!statusFinal365(g) || elapsed < 120 * 60 * 1000) return { jogo: j.id, estado: "em andamento" };
  const homeNome = String(g.homeCompetitor?.name || "");
  let rc: number, rv: number;
  if (casaLado(al(j.selecao_casa), homeNome)) { rc = hs; rv = ascore; }
  else if (casaLado(al(j.selecao_visitante), homeNome)) { rc = ascore; rv = hs; }
  else return { jogo: j.id, estado: "orientacao nao casou" };
  // ESTRATEGIA ANTI-ERRO: 1o grab vira pendente. 20min depois, 2o grab. Se divergir, usa LATEST.
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
  return { jogo: j.id, estado: "final", placar: rc + "-" + rv, tokens: ap.tokens };
}`;

try {
  if (existsSync(FLAG)) {
    console.log("[fix_resultados_doublecheck] ja aplicado, skip");
  } else {
    const SP = join(__dir, "scores365.ts");
    const s = readFileSync(SP, "utf8");
    const occ = s.split(OLD).length - 1;
    const log: any = { anchor_occ: occ };
    if (occ === 1) {
      const novo = s.replace(OLD, NEW);
      writeFileSync(SP + ".prefix_doublecheck", s, "utf8");
      writeFileSync(SP, novo, "utf8");
      log.aplicado = true;
      log.delta = novo.length - s.length;
    } else {
      log.aplicado = false;
      log.motivo = "anchor !== 1";
    }
    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_resultados_doublecheck]", log);
  }
} catch (e) {
  console.error("[fix_resultados_doublecheck] ERRO", e);
}
