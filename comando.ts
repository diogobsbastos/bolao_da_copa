import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";
import { PAGINA_COMANDO } from "./comando_page.js";
import { atualizarDadosJogo, coletarResultadoJogo, syncOdds, confirmarAgenda } from "./scores365.js";
import { autoPreencherTick } from "./jogar.js";
import { timePT } from "./jogos_placar.js";

async function admOk(req: FastifyRequest): Promise<boolean> {
  const t = req.headers["x-admin-token"]; const e = process.env.ADMIN_TOKEN ?? "";
  if (e && t === e) return true; const u = await usuarioDaReq(req); return u?.papel === "admin";
}
async function setCfg(k: string, v: string): Promise<void> { try { await pool.query("INSERT INTO config (chave,valor) VALUES ($1,$2) ON CONFLICT (chave) DO UPDATE SET valor=$2, atualizado_em=now()", [k, v]); } catch {} }

// Mapa de acoes do robo. Fase 1: dados do jogo, auto-preencher, resultado(+gols+apuracao) e odds = REAIS.
const FONTE: Record<string, string> = {
  atualizar_dados_jogo: "365scores + ESPN", coletar_resultado: "365scores", atualizar_odds: "365scores", confirmar_agenda: "365scores", regua_figurinhas: "365scores",
  auto_preencher: "interno", injetar_tokens: "interno", liquidar_bets: "interno", arena_resolver: "interno", gerar_noticias: "ESPN + IA",
};
const ACOES: Record<string, (p: any) => Promise<any>> = {
  atualizar_dados_jogo: (p) => atualizarDadosJogo(Number(p?.jogo_id)),
  auto_preencher: async () => { await autoPreencherTick(); return { ok: true, msg: "auto-preencher rodado" }; },
  coletar_resultado: (p) => coletarResultadoJogo(Number(p?.jogo_id)),
  atualizar_odds: () => syncOdds(),
  confirmar_agenda: async () => { const r = await confirmarAgenda(); await gerarTarefasDosJogos(); return { ok: true, agenda: r }; },
  gerar_noticias: async () => ({ ok: true, placeholder: true, msg: "Noticias IA (Cron 01): modulo a construir" }),
  injetar_tokens: async () => ({ ok: true, placeholder: true, msg: "Drip de tokens diario: modulo a construir" }),
  liquidar_bets: async () => ({ ok: true, placeholder: true, msg: "Bet: fora do Beta 1.0" }),
  arena_resolver: async () => ({ ok: true, placeholder: true, msg: "Arena PvP: modulo a construir" }),
  regua_figurinhas: async () => ({ ok: true, placeholder: true, msg: "Regua de notas (figurinhas): modulo a construir" }),
};

let TICKANDO = false;
export async function tickTarefas(): Promise<void> {
  if (TICKANDO) return; TICKANDO = true;
  try {
    await setCfg("tarefas_last_tick", new Date().toISOString());
    const due = (await pool.query("SELECT id, acao, parametros, tentativas FROM tarefas_agendadas WHERE status='pendente' AND horario_gatilho <= now() ORDER BY horario_gatilho LIMIT 20")).rows as any[];
    for (const t of due) {
      await pool.query("UPDATE tarefas_agendadas SET status='rodando', tentativas=tentativas+1, atualizado_em=now() WHERE id=$1", [t.id]);
      try {
        const fn = ACOES[t.acao];
        const res: any = fn ? await fn(t.parametros || {}) : { ok: false, erro: "acao desconhecida: " + t.acao };
        if (res && res.retry === true && Number(t.tentativas || 0) < 30) {
          await pool.query("UPDATE tarefas_agendadas SET status='pendente', horario_gatilho=now() + interval '10 minutes', log=$2, atualizado_em=now() WHERE id=$1", [t.id, ("soneca: " + (res.estado || "aguardando") + " - nova tentativa em 10min").slice(0, 600)]);
        } else {
          const placeholder = res && res.placeholder === true;
          const ok = res && res.ok !== false;
          const novo = placeholder ? "ignorado" : (ok ? "concluido" : "erro");
          await pool.query("UPDATE tarefas_agendadas SET status=$2, log=$3, atualizado_em=now() WHERE id=$1", [t.id, novo, JSON.stringify(res).slice(0, 600)]);
        }
      } catch (e: any) {
        await pool.query("UPDATE tarefas_agendadas SET status='erro', log=$2, atualizado_em=now() WHERE id=$1", [t.id, ("EXC: " + String(e?.message ?? e)).slice(0, 600)]);
      }
    }
  } finally { TICKANDO = false; }
}

async function upsertTarefa(chave: string, categoria: string, acao: string, horario: Date, params: any, diaRef: string): Promise<void> {
  try {
    await pool.query(
      "INSERT INTO tarefas_agendadas (chave_unica, categoria, acao, horario_gatilho, parametros, dia_ref) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (chave_unica) DO UPDATE SET horario_gatilho=EXCLUDED.horario_gatilho, dia_ref=EXCLUDED.dia_ref, atualizado_em=now() WHERE tarefas_agendadas.status='pendente'",
      [chave, categoria, acao, horario.toISOString(), JSON.stringify(params || {}), diaRef]
    );
  } catch {}
}

export async function gerarTarefasDosJogos(): Promise<any> {
  const jogos = (await pool.query("SELECT id, inicio, rodada FROM jogos WHERE inicio IS NOT NULL AND selecao_casa<>'A definir' AND selecao_visitante<>'A definir' AND inicio > now() - interval '1 day' AND inicio < now() + interval '40 days'")).rows as any[];
  for (const j of jogos) {
    const ini = new Date(j.inicio);
    const diaJogo = ini.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
    await upsertTarefa("jogo:" + j.id + ":dados", "Jogos", "atualizar_dados_jogo", new Date(ini.getTime() - 30 * 60000), { jogo_id: j.id }, diaJogo);
    await upsertTarefa("jogo:" + j.id + ":auto", "Jogos", "auto_preencher", new Date(ini.getTime() - 20 * 60000), { jogo_id: j.id, rodada: j.rodada }, diaJogo);
    await upsertTarefa("jogo:" + j.id + ":res", "Pontuacao", "coletar_resultado", new Date(ini.getTime() + 120 * 60000), { jogo_id: j.id }, diaJogo);
  }
  const hoje = new Date(); const ymd = hoje.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  const at = (h: number, m = 0) => { const d = new Date(hoje); d.setHours(h, m, 0, 0); return d; };
  for (const h of [0, 4, 8, 12, 16, 20]) await upsertTarefa("diario:odds:" + ymd + ":" + h, "Diario", "atualizar_odds", at(h), {}, ymd);
  await upsertTarefa("diario:noticias:" + ymd, "Diario", "gerar_noticias", at(3), {}, ymd);
  await upsertTarefa("diario:tokens:" + ymd, "Diario", "injetar_tokens", at(0, 1), {}, ymd);
  await upsertTarefa("diario:agenda:" + ymd, "Diario", "confirmar_agenda", at(5), {}, ymd);
  return { ok: true, jogos: jogos.length };
}

export function iniciarComando(): void {
  setTimeout(() => { gerarTarefasDosJogos().catch(() => {}); }, 8000);
  setInterval(() => { gerarTarefasDosJogos().catch(() => {}); }, 60 * 60 * 1000);
  setTimeout(() => { tickTarefas().catch(() => {}); }, 15000);
  setInterval(() => { tickTarefas().catch(() => {}); }, 60 * 1000);
}

export async function rotasComando(app: FastifyInstance) {
  app.get("/admin/comando", async (_req, reply) => reply.header("cache-control", "no-store").type("text/html").send(PAGINA_COMANDO));
  app.get("/admin/comando/tarefas", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const q = (req.query as any) || {};
    const dia = /^\d{4}-\d{2}-\d{2}$/.test(q.dia || "") ? q.dia : null;
    const cat = q.cat && q.cat !== "Todos" ? String(q.cat) : null;
    const params: any[] = []; let where = "WHERE 1=1";
    if (dia) { params.push(dia); where += " AND dia_ref = $" + params.length + "::date"; }
    else { where += " AND dia_ref = (now() AT TIME ZONE 'America/Sao_Paulo')::date"; }
    if (cat) { params.push(cat); where += " AND categoria = $" + params.length; }
    const sql = "SELECT t.id, t.categoria, t.acao, t.horario_gatilho, t.dia_ref, t.status, t.tentativas, t.log, j.selecao_casa, j.selecao_visitante, j.inicio AS jogo_inicio FROM tarefas_agendadas t LEFT JOIN jogos j ON j.id = NULLIF(t.parametros->>'jogo_id','')::int " + where + " ORDER BY t.horario_gatilho";
    const tarefas = (await pool.query(sql, params)).rows.map((t: any) => { const o: any = { id: t.id, categoria: t.categoria, acao: t.acao, horario_gatilho: t.horario_gatilho, status: t.status, tentativas: t.tentativas, log: t.log, fonte: FONTE[t.acao] || "\u2014" }; if (t.selecao_casa) { const cc = timePT(t.selecao_casa), vv = timePT(t.selecao_visitante); o.jogo = { casa_pt: cc.pt, casa_iso: cc.iso, visit_pt: vv.pt, visit_iso: vv.iso, inicio: t.jogo_inicio }; } return o; });
    let lastTick = ""; try { lastTick = (await pool.query("SELECT valor FROM config WHERE chave='tarefas_last_tick'")).rows[0]?.valor || ""; } catch {}
    return { ok: true, tarefas, lastTick, agora: new Date().toISOString() };
  });
  app.post("/admin/comando/retry", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const id = Number((req.body as any)?.id); if (!Number.isInteger(id)) return reply.code(400).send({ erro: "id invalido" });
    await pool.query("UPDATE tarefas_agendadas SET status='pendente', atualizado_em=now() WHERE id=$1", [id]); return { ok: true };
  });
  app.post("/admin/comando/rodar-agora", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const id = Number((req.body as any)?.id); if (!Number.isInteger(id)) return reply.code(400).send({ erro: "id invalido" });
    await pool.query("UPDATE tarefas_agendadas SET status='pendente', horario_gatilho=now() WHERE id=$1", [id]); await tickTarefas(); return { ok: true };
  });
  app.post("/admin/comando/gerar", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    return await gerarTarefasDosJogos();
  });
}
