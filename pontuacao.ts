import { pool } from "./db.js";
import { notificar } from "./notificacoes.js";
import { timePT } from "./jogos_placar.js";

// ===== Motor de pontuacao do Bolao (fase de grupos) — Beta 1.0 =====
// Regras (config.pontos_regra), aplicadas em CAMADAS (vale a MAIOR que bater):
//   placar exato            -> exato            (10)
//   vencedor certo + saldo  -> vencedor_saldo   (7)  [so quando NAO e empate]
//   vencedor/empate certo   -> vencedor         (5)
//   acertou os gols de 1 dos times -> gol_time  (1)
//   nada                    -> 0
// Os MESMOS pontos viram token (creditado no ledger como 'premio_bolao').
//
// TRAVA DE PONTUACAO (config.bolao_trava_pontuacao):
//   'on'  (default): jogos com inicio < config.bolao_inicio_oficial NAO sao apurados
//                    SEM nenhuma mutacao no banco — desligavel a qualquer momento.
//   'off': apuracao normal pra todos os jogos.

export interface Regra { exato: number; vencedor_saldo: number; vencedor: number; gol_time: number; }
export const REGRA_PADRAO: Regra = { exato: 10, vencedor_saldo: 7, vencedor: 5, gol_time: 1 };

export function calcPontos(pc: number, pv: number, rc: number, rv: number, regra: Regra = REGRA_PADRAO): number {
  if (![pc, pv, rc, rv].every((n) => Number.isInteger(n) && n >= 0)) return 0;
  if (pc === rc && pv === rv) return regra.exato;
  const sp = Math.sign(pc - pv), sr = Math.sign(rc - rv);
  if (sp === sr) {
    if (sp !== 0 && (pc - pv) === (rc - rv)) return regra.vencedor_saldo;
    return regra.vencedor;
  }
  if (pc === rc || pv === rv) return regra.gol_time;
  return 0;
}

export async function regraAtual(): Promise<Regra> {
  try {
    const v = (await pool.query("SELECT valor FROM config WHERE chave='pontos_regra'")).rows[0]?.valor;
    const o = JSON.parse(v || "{}");
    return {
      exato: Number(o.exato) || REGRA_PADRAO.exato,
      vencedor_saldo: Number(o.vencedor_saldo) || REGRA_PADRAO.vencedor_saldo,
      vencedor: Number(o.vencedor) || REGRA_PADRAO.vencedor,
      gol_time: Number(o.gol_time) || REGRA_PADRAO.gol_time,
    };
  } catch { return REGRA_PADRAO; }
}

// Apura UM jogo (precisa de resultado real em jogos.resultado_casa/visitante).
// Idempotente: jogos.apurado trava re-apuracao; palpites_bolao.creditado trava re-credito de token.
export async function apurarJogo(jogoId: number): Promise<{ ok: boolean; jogo: number; palpites: number; creditados: number; tokens: number; motivo?: string }> {
  const j = (await pool.query("SELECT id, inicio, selecao_casa AS casa, selecao_visitante AS visitante, resultado_casa AS rc, resultado_visitante AS rv, resultado_pendente AS rpend FROM jogos WHERE id=$1", [jogoId])).rows[0] as any;
  if (!j) return { ok: false, jogo: jogoId, palpites: 0, creditados: 0, tokens: 0, motivo: "jogo nao existe" };
  if (j.rc == null || j.rv == null) return { ok: false, jogo: jogoId, palpites: 0, creditados: 0, tokens: 0, motivo: "sem resultado real" };
  if (j.rpend != null) return { ok: true, jogo: jogoId, palpites: 0, creditados: 0, tokens: 0, motivo: "aguardando_double_check" };

  // TRAVA — saida CEDO sem nenhuma mutacao no banco.
  // Permite ligar/desligar a qualquer momento sem corromper estado.
  try {
    const _trava = (await pool.query("SELECT valor FROM config WHERE chave='bolao_trava_pontuacao'")).rows[0]?.valor;
    const travaAtiva = String(_trava || "on").toLowerCase() === "on";
    if (travaAtiva) {
      const _ini = (await pool.query("SELECT valor FROM config WHERE chave='bolao_inicio_oficial'")).rows[0]?.valor;
      if (_ini && j.inicio && new Date(j.inicio).getTime() < new Date(_ini).getTime()) {
        return { ok: true, jogo: jogoId, palpites: 0, creditados: 0, tokens: 0, motivo: "trava_pre_inicio_oficial" };
      }
    }
  } catch {}

  const regra = await regraAtual();
  const pals = (await pool.query("SELECT id, usuario_id, placar_casa AS pc, placar_visitante AS pv, creditado FROM palpites_bolao WHERE jogo_id=$1", [jogoId])).rows as any[];
  let creditados = 0, tokens = 0; const usuarios = new Set<number>();
  for (const p of pals) {
    const pts = calcPontos(p.pc, p.pv, j.rc, j.rv, regra);
    usuarios.add(p.usuario_id);
    if (!p.creditado) {
      if (pts > 0) {
        const r = (await pool.query("UPDATE usuarios_carteiras SET saldo=saldo+$2 WHERE usuario_id=$1 RETURNING saldo", [p.usuario_id, pts])).rows[0] as any;
        if (r) { try { await pool.query("INSERT INTO transacoes_tokens (usuario_id,carteira,valor,saldo_apos,tipo,referencia) VALUES ($1,'token',$2,$3,'premio_bolao',$4)", [p.usuario_id, pts, r.saldo, "jogo:" + jogoId]); } catch {} creditados++; tokens += pts; try { const _c = timePT(j.casa).pt, _v = timePT(j.visitante).pt; notificar(p.usuario_id, "pontos", "\u2b50 Voce pontuou!", "+" + pts + " pts e +" + pts + " tokens em " + _c + " " + j.rc + " x " + j.rv + " " + _v, { canais: ["inapp", "webpush"], referencia: "pts:jogo:" + jogoId }).catch(() => {}); } catch {} }
      }
      await pool.query("UPDATE palpites_bolao SET pontos=$2, creditado=true WHERE id=$1", [p.id, pts]);
    } else {
      await pool.query("UPDATE palpites_bolao SET pontos=$2 WHERE id=$1", [p.id, pts]);
    }
  }
  // ranking idempotente: pontos_bolao = soma dos pontos dos palpites do usuario
  for (const uid of usuarios) {
    await pool.query("UPDATE ranking SET pontos_bolao=(SELECT COALESCE(sum(pontos),0) FROM palpites_bolao WHERE usuario_id=$1), atualizado_em=now() WHERE usuario_id=$1", [uid]);
  }
  await pool.query("UPDATE jogos SET apurado=true WHERE id=$1", [jogoId]);
  return { ok: true, jogo: jogoId, palpites: pals.length, creditados, tokens };
}

// Apura todos com resultado real e ainda nao apurados.
export async function apurarPendentes(): Promise<{ jogos: number; detalhes: any[] }> {
  const js = (await pool.query("SELECT id FROM jogos WHERE resultado_casa IS NOT NULL AND resultado_visitante IS NOT NULL AND apurado=false ORDER BY inicio NULLS LAST, id")).rows as any[];
  const detalhes: any[] = [];
  for (const j of js) detalhes.push(await apurarJogo(j.id));
  return { jogos: js.length, detalhes };
}
