import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";
import { PAGINA_JOGAR } from "./jogar_page.js";
import { timePT, rankOf, palpiteOdds, calcClassificacao } from "./jogos_placar.js";

async function jogador(req: FastifyRequest) { return await usuarioDaReq(req); }
function palpiteDetLite(rkC: number, rkV: number) { const d = rkV - rkC, ad = Math.abs(d); if (ad < 4) return { pc: 1, pv: 1 }; const gf = Math.min(3, 1 + Math.round(ad / 12)), gc = Math.max(0, 1 - Math.round(ad / 22)); return d > 0 ? { pc: gf, pv: gc } : { pc: gc, pv: gf }; }

export async function rotasJogar(app: FastifyInstance) {
  app.get("/jogar", async (_req, reply) => reply.header("cache-control", "no-store").type("text/html").send(PAGINA_JOGAR));

  app.get("/jogar/dados", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    let cart = (await pool.query("SELECT saldo_colecionador c, saldo_apostas a, saldo_arena ar FROM usuarios_carteiras WHERE usuario_id=$1", [u.id])).rows[0] as any;
    if (!cart) { try { await pool.query("INSERT INTO usuarios_carteiras (usuario_id) VALUES ($1) ON CONFLICT DO NOTHING", [u.id]); } catch {} cart = { c: 200, a: 200, ar: 100 }; }
    let pos: any = null, pontos = 0, total = 0;
    try {
      total = Number(((await pool.query("SELECT count(*) n FROM ranking")).rows[0] as any)?.n || 0);
      const meu = (await pool.query("SELECT pontos_bolao FROM ranking WHERE usuario_id=$1", [u.id])).rows[0] as any;
      pontos = Number(meu?.pontos_bolao || 0);
      pos = Number(((await pool.query("SELECT count(*)+1 n FROM ranking WHERE pontos_bolao > (SELECT COALESCE(pontos_bolao,0) FROM ranking WHERE usuario_id=$1)", [u.id])).rows[0] as any)?.n || 0);
    } catch {}
    const pj = (await pool.query("SELECT selecao_casa, selecao_visitante, inicio, rodada FROM jogos WHERE inicio >= now() AND selecao_casa<>'A definir' AND selecao_visitante<>'A definir' ORDER BY inicio ASC LIMIT 1")).rows[0] as any;
    let proximo: any = null;
    if (pj) { const c = timePT(pj.selecao_casa), v = timePT(pj.selecao_visitante); proximo = { casa: { pt: c.pt, iso: c.iso }, visitante: { pt: v.pt, iso: v.iso }, inicio: pj.inicio, rodada: pj.rodada }; }
    const pend = Number(((await pool.query("SELECT count(*) n FROM jogos j WHERE j.fase='grupos' AND j.selecao_casa<>'A definir' AND j.inicio>=now() AND NOT EXISTS (SELECT 1 FROM palpites_bolao pb WHERE pb.jogo_id=j.id AND pb.usuario_id=$1)", [u.id])).rows[0] as any)?.n || 0);
    return { ok: true, me: { id: u.id, nome: u.nome || u.email, email: u.email, papel: u.papel }, carteiras: { colecionador: Number(cart.c || 0), apostas: Number(cart.a || 0), arena: Number(cart.ar || 0) }, ranking: { pos, pontos, total }, proximo, palpitesPendentes: pend };
  });

  app.get("/jogar/bolao", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const rod = Number((req.query as any)?.rodada || 0);
    const args: any[] = [u.id];
    let q = `SELECT j.id, j.selecao_casa, j.selecao_visitante, j.inicio, j.status, j.rodada, j.odds, pb.placar_casa pc, pb.placar_visitante pv
      FROM jogos j LEFT JOIN palpites_bolao pb ON pb.jogo_id=j.id AND pb.usuario_id=$1
      WHERE j.selecao_casa<>'A definir' AND j.selecao_visitante<>'A definir' AND j.fase='grupos'`;
    if (rod) { args.push(rod); q += ` AND j.rodada=$${args.length}`; }
    q += " ORDER BY j.inicio NULLS LAST, j.id";
    const rows = (await pool.query(q, args)).rows as any[];
    const agora = Date.now();
    const jogos = rows.map((j) => { const c = timePT(j.selecao_casa), v = timePT(j.selecao_visitante); const travado = j.inicio ? new Date(j.inicio).getTime() <= agora : false; const od = j.odds && j.odds.casa != null ? { casa: j.odds.casa, empate: j.odds.empate, fora: j.odds.fora } : null; return { id: j.id, rodada: j.rodada, inicio: j.inicio, travado, casa: { pt: c.pt, iso: c.iso }, visitante: { pt: v.pt, iso: v.iso }, odds: od, meu: (j.pc != null && j.pv != null) ? { pc: j.pc, pv: j.pv } : null }; });
    return { ok: true, jogos, rodada: rod || null };
  });

  app.post("/jogar/palpite", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const b = (req.body ?? {}) as any; const id = Number(b.jogo_id), pc = Number(b.pc), pv = Number(b.pv);
    if (!Number.isInteger(id) || !Number.isInteger(pc) || !Number.isInteger(pv) || pc < 0 || pv < 0 || pc > 30 || pv > 30) return reply.code(400).send({ erro: "dados invalidos" });
    const jg = (await pool.query("SELECT inicio FROM jogos WHERE id=$1", [id])).rows[0] as any;
    if (!jg) return reply.code(404).send({ erro: "jogo nao existe" });
    if (jg.inicio && new Date(jg.inicio).getTime() <= Date.now()) return reply.code(403).send({ erro: "jogo ja comecou (palpite travado)" });
    await pool.query(`INSERT INTO palpites_bolao (usuario_id, jogo_id, placar_casa, placar_visitante) VALUES ($1,$2,$3,$4)
      ON CONFLICT (usuario_id, jogo_id) DO UPDATE SET placar_casa=$3, placar_visitante=$4, atualizado_em=now()`, [u.id, id, pc, pv]);
    return { ok: true };
  });

  app.post("/jogar/palpite-auto", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const rod = Number((req.body as any)?.rodada || 0);
    const args: any[] = []; let q = "SELECT id, selecao_casa, selecao_visitante, odds, inicio FROM jogos WHERE fase='grupos' AND selecao_casa<>'A definir' AND selecao_visitante<>'A definir'";
    if (rod) { args.push(rod); q += ` AND rodada=$${args.length}`; }
    const jogos = (await pool.query(q, args)).rows as any[]; let n = 0;
    for (const j of jogos) {
      if (j.inicio && new Date(j.inicio).getTime() <= Date.now()) continue;
      let pal: any = palpiteOdds(j.odds); if (!pal) { const d = palpiteDetLite(rankOf(j.selecao_casa), rankOf(j.selecao_visitante)); pal = { pc: d.pc, pv: d.pv }; }
      await pool.query(`INSERT INTO palpites_bolao (usuario_id, jogo_id, placar_casa, placar_visitante) VALUES ($1,$2,$3,$4)
        ON CONFLICT (usuario_id, jogo_id) DO UPDATE SET placar_casa=$3, placar_visitante=$4, atualizado_em=now()`, [u.id, j.id, pal.pc, pal.pv]); n++;
    }
    return { ok: true, preenchidos: n };
  });

  app.get("/jogar/ranking", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const rows = (await pool.query(`SELECT r.usuario_id uid, COALESCE(us.nome, us.email) nome, r.pontos_bolao pts FROM ranking r JOIN usuarios us ON us.id=r.usuario_id ORDER BY r.pontos_bolao DESC, us.nome LIMIT 50`)).rows as any[];
    return { ok: true, eu: u.id, ranking: rows.map((x, i) => ({ pos: i + 1, nome: x.nome, pts: Number(x.pts || 0), eu: x.uid === u.id })) };
  });

  app.get("/jogar/copa", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const rows = (await pool.query("SELECT selecao_casa, selecao_visitante, inicio, placar_casa, placar_visitante FROM jogos WHERE fase='grupos' AND selecao_casa<>'A definir' AND selecao_visitante<>'A definir'")).rows as any[];
    let grupos: any[] = []; try { grupos = calcClassificacao(rows); } catch {}
    const proxRows = (await pool.query("SELECT selecao_casa, selecao_visitante, inicio, rodada FROM jogos WHERE inicio>=now() AND selecao_casa<>'A definir' AND selecao_visitante<>'A definir' ORDER BY inicio ASC LIMIT 8")).rows as any[];
    const proximos = proxRows.map((j) => { const c = timePT(j.selecao_casa), v = timePT(j.selecao_visitante); return { casa: { pt: c.pt, iso: c.iso }, visitante: { pt: v.pt, iso: v.iso }, inicio: j.inicio, rodada: j.rodada }; });
    return { ok: true, grupos, proximos };
  });
}
