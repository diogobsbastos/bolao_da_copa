import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { randomBytes } from "node:crypto";
import { usuarioDaReq } from "./auth.js";
import { PAGINA_JOGAR } from "./jogar_page.js";
import { invocarTexto, listarModelos } from "./llm.js";
import { registrarGasto } from "./custos.js";
import { timePT, rankOf, palpiteOdds, calcClassificacao, mapaGrupos, forma2022, noticiasTime, classifGrupoDe, resumirNoticias } from "./jogos_placar.js";

async function jogador(req: FastifyRequest) {
  const u = await usuarioDaReq(req); if (u) return u;
  const auth = req.headers["authorization"]; const tok = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!tok || tok.length < 8) return null;
  try { const r = (await pool.query("SELECT id, papel, nome, email FROM usuarios WHERE pat=$1 AND length(pat)>0", [tok])).rows[0] as any; return r || null; } catch { return null; }
}
function palpiteDetLite(rkC: number, rkV: number) { const d = rkV - rkC, ad = Math.abs(d); if (ad < 4) return { pc: 1, pv: 1 }; const gf = Math.min(3, 1 + Math.round(ad / 12)), gc = Math.max(0, 1 - Math.round(ad / 22)); return d > 0 ? { pc: gf, pv: gc } : { pc: gc, pv: gf }; }
function jitter(pc: number, pv: number): [number, number] { const r = Math.random(); let a = pc, b = pv; if (r < 0.5) return [a, b]; if (r < 0.78) a = Math.max(0, a + (Math.random() < 0.5 ? 1 : -1)); else b = Math.max(0, b + (Math.random() < 0.5 ? 1 : -1)); return [a, b]; }
// Palpite ALEATÓRIO inteligente: sorteia o resultado PONDERADO pelas odds (zebra possível) e a margem por faixa de força. Cada chamada varia.
function palpiteAleatorio(o: any): { pc: number; pv: number } | null {
  const c = Number(o?.casa), e = Number(o?.empate), f = Number(o?.fora);
  if (!(c > 0) || !(f > 0)) return null;
  const ic = 1 / c, ie = e > 0 ? 1 / e : 0, iff = 1 / f; const tot = ic + ie + iff;
  const wc = ic / tot, we = ie / tot;
  const r = Math.random();
  const outcome = r < wc ? "casa" : (r < wc + we ? "empate" : "fora");
  if (outcome === "empate") { const g = Math.floor(Math.random() * 3); return { pc: g, pv: g }; }
  const venceCasa = outcome === "casa";
  const od = venceCasa ? c : f;
  let gv: number;
  if (od <= 1.30) gv = 2 + Math.floor(Math.random() * 3);
  else if (od <= 1.70) gv = 1 + Math.floor(Math.random() * 3);
  else if (od <= 2.40) gv = 1 + Math.floor(Math.random() * 2);
  else gv = 1;
  const maxLoser = Math.min(gv - 1, 2);
  const gp = maxLoser <= 0 ? 0 : Math.floor(Math.random() * (maxLoser + 1));
  return venceCasa ? { pc: gv, pv: gp } : { pc: gp, pv: gv };
}
function palpiteAuto1(o: any, enC: string, enV: string): { pc: number; pv: number } {
  let p = palpiteAleatorio(o);
  if (!p) { const d = palpiteDetLite(rankOf(enC), rankOf(enV)); const j = jitter(d.pc, d.pv); p = { pc: j[0], pv: j[1] }; }
  return p;
}
// Cron: 1h antes do jogo, preenche os FALTANTES de quem ligou o auto (odds do banco + sorteio). Nao sobrescreve manual.
export async function autoPreencherTick(): Promise<void> {
  let jogos: any[] = [], users: any[] = [];
  try {
    jogos = (await pool.query("SELECT id, selecao_casa, selecao_visitante, odds FROM jogos WHERE selecao_casa<>'A definir' AND selecao_visitante<>'A definir' AND inicio > now() AND inicio <= now() + interval '60 minutes'")).rows as any[];
    if (!jogos.length) return;
    users = (await pool.query("SELECT id FROM usuarios WHERE auto_preencher=true")).rows as any[];
    if (!users.length) return;
  } catch { return; }
  let n = 0;
  for (const j of jogos) {
    for (const u of users) {
      try {
        const ex = await pool.query("SELECT 1 FROM palpites_bolao WHERE usuario_id=$1 AND jogo_id=$2", [u.id, j.id]);
        if (ex.rowCount) continue;
        const p = palpiteAuto1(j.odds, j.selecao_casa, j.selecao_visitante);
        await pool.query("INSERT INTO palpites_bolao (usuario_id, jogo_id, placar_casa, placar_visitante, auto) VALUES ($1,$2,$3,$4,true) ON CONFLICT (usuario_id, jogo_id) DO NOTHING", [u.id, j.id, p.pc, p.pv]); n++;
      } catch {}
    }
  }
  if (n) console.log("[auto-preencher]", n, "palpites em", jogos.length, "jogo(s)");
}


function medias5(arr: any[]): any { if (!Array.isArray(arr) || !arr.length) return null; let gp = 0, gc = 0, pts = 0; for (const m of arr) { gp += Number(m.gp) || 0; gc += Number(m.gc) || 0; pts += (m.res === "V" ? 3 : (m.res === "E" ? 1 : 0)); } const n = arr.length; return { n, gpM: gp / n, gcM: gc / n, pts, aprov: pts / (n * 3) }; }
const fetchandoCtx = new Set<number>();
async function montarContexto(id: number): Promise<any | null> {
  const j = (await pool.query("SELECT id, selecao_casa, selecao_visitante, inicio, rodada, fase, odds, lineup_casa, lineup_visitante, dados365 FROM jogos WHERE id=$1", [id])).rows[0] as any;
  if (!j) return null;
  const c = timePT(j.selecao_casa), v = timePT(j.selecao_visitante);
  let odds: any = null, prob: any = null;
  if (j.odds && j.odds.casa != null) {
    odds = { casa: j.odds.casa, empate: j.odds.empate, fora: j.odds.fora, fonte: j.odds.fonte || "", url: j.odds.url || null };
    const ic = 1 / Number(j.odds.casa), ie = j.odds.empate ? 1 / Number(j.odds.empate) : 0, iff = 1 / Number(j.odds.fora), tot = ic + ie + iff;
    prob = { casa: Math.round(100 * ic / tot), empate: Math.round(100 * ie / tot), fora: Math.round(100 * iff / tot) };
  }
  const lineup = (l: any) => (l && Array.isArray(l.titulares)) ? { formacao: l.formacao, confirmada: !!l.confirmada, titulares: l.titulares.map((t: any) => ({ nome: t.nome, posicao: t.posicao })) } : null;
  const clas = await classifGrupoDe(j.selecao_casa).catch(() => null);
  const dc: any = j.dados365 || {};
  const colhido = dc.colhidoEm ? new Date(dc.colhidoEm).getTime() : 0;
  const fresco = (Date.now() - colhido) < 60 * 60 * 1000;
  let forCasa: any = dc.forma2022Casa, forVisi: any = dc.forma2022Visi, nCasa: any = dc.noticiasCasa, nVisi: any = dc.noticiasVisitante;
  if (!(fresco && nCasa !== undefined && forCasa !== undefined)) {
    if (fetchandoCtx.has(j.id)) {
      forCasa = forCasa || []; forVisi = forVisi || []; nCasa = nCasa || []; nVisi = nVisi || [];
    } else {
      fetchandoCtx.add(j.id);
      try {
        [forCasa, forVisi, nCasa, nVisi] = await Promise.all([
          forma2022(j.selecao_casa).catch(() => []), forma2022(j.selecao_visitante).catch(() => []),
          noticiasTime(c.pt, j.selecao_casa).catch(() => []), noticiasTime(v.pt, j.selecao_visitante).catch(() => []),
        ]);
        const novo = { ...dc, forma2022Casa: forCasa, forma2022Visi: forVisi, noticiasCasa: nCasa, noticiasVisitante: nVisi, colhidoEm: new Date().toISOString() };
        await pool.query("UPDATE jogos SET dados365=$1 WHERE id=$2", [JSON.stringify(novo), j.id]);
      } finally { fetchandoCtx.delete(j.id); }
    }
  }
  try { nCasa = await resumirNoticias(nCasa, null, null); nVisi = await resumirNoticias(nVisi, null, null); } catch {}
  const f5 = (l: any) => { const m = medias5(l?.ultimas5); return m ? { jogos: m.n, golsPro: +m.gpM.toFixed(2), golsContra: +m.gcM.toFixed(2), aproveitamento: Math.round(m.aprov * 100) } : null; };
  return { ok: true, jogo: { id: j.id, rodada: j.rodada, fase: j.fase, inicio: j.inicio, casa: { pt: c.pt, en: j.selecao_casa, iso: c.iso, rankFifa: rankOf(j.selecao_casa) }, visitante: { pt: v.pt, en: j.selecao_visitante, iso: v.iso, rankFifa: rankOf(j.selecao_visitante) } }, odds, probabilidade: prob, escalacao: { casa: lineup(j.lineup_casa), visitante: lineup(j.lineup_visitante) }, forma2022: { casa: forCasa, visitante: forVisi }, classificacao: clas, noticias: { casa: nCasa, visitante: nVisi }, extra365: j.dados365 || null, forma5: { casa: f5(j.dados365?.casa), visitante: f5(j.dados365?.visitante) } };
}

export async function rotasJogar(app: FastifyInstance) {
  app.get("/jogar", async (_req, reply) => reply.header("cache-control", "no-store").type("text/html").send(PAGINA_JOGAR));

  app.get("/jogar/dados", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    let cart = (await pool.query("SELECT saldo FROM usuarios_carteiras WHERE usuario_id=$1", [u.id])).rows[0] as any;
    if (!cart) { try { await pool.query("INSERT INTO usuarios_carteiras (usuario_id) VALUES ($1) ON CONFLICT DO NOTHING", [u.id]); } catch {} cart = { saldo: 500 }; }
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
    let autoP = false; try { autoP = !!((await pool.query("SELECT auto_preencher FROM usuarios WHERE id=$1", [u.id])).rows[0] as any)?.auto_preencher; } catch {}
    let iaOn = false; try { iaOn = !!((await pool.query("SELECT (length(api_key)>0) k FROM usuarios_llm WHERE usuario_id=$1", [u.id])).rows[0] as any)?.k; } catch {}
    let acessoFull = false; let pf: any = {};
    try { pf = (await pool.query("SELECT acesso_full, nome_time, avatar, pagou FROM usuarios WHERE id=$1", [u.id])).rows[0] as any || {}; acessoFull = !!pf.acesso_full || u.papel === "admin"; } catch {}
    let valorPago = 0; try { valorPago = Number(((await pool.query("SELECT COALESCE(SUM(valor),0) v FROM depositos WHERE usuario_id=$1 AND status='approved'", [u.id])).rows[0] as any)?.v || 0); } catch {}
    let mataAberto = false; try { const mf = (await pool.query("SELECT valor FROM config WHERE chave='mata_aberto'")).rows[0]?.valor; if (mf==='1' || mf==='true') mataAberto=true; else { const mn = (await pool.query("SELECT min(inicio) m FROM jogos WHERE fase<>'grupos' AND inicio IS NOT NULL")).rows[0]?.m; if (mn && Date.now() >= new Date(mn).getTime()) mataAberto=true; } } catch {}
    let longoFeito = false; try { longoFeito = !!((await pool.query("SELECT 1 FROM palpites_longo WHERE usuario_id=$1 AND campeao IS NOT NULL AND campeao<>'' AND vice IS NOT NULL AND vice<>'' AND terceiro IS NOT NULL AND terceiro<>'' AND quarto IS NOT NULL AND quarto<>'' AND artilheiro_id IS NOT NULL", [u.id])).rowCount); } catch {}
    let stRod = [0,0,0]; try { const sr = (await pool.query("SELECT j.rodada AS r, count(*) AS n FROM jogos j WHERE j.fase='grupos' AND j.selecao_casa<>'A definir' AND j.selecao_visitante<>'A definir' AND j.inicio>=now() AND NOT EXISTS (SELECT 1 FROM palpites_bolao pb WHERE pb.jogo_id=j.id AND pb.usuario_id=$1) GROUP BY j.rodada", [u.id])).rows as any[]; for (const x of sr) { const i = Number(x.r) - 1; if (i>=0 && i<3) stRod[i] = Number(x.n); } } catch {}
    let poteTot=0;try{const _pr=await pool.query("SELECT COALESCE(SUM(valor),0) AS v FROM depositos WHERE status='approved'");poteTot=Number(_pr.rows[0].v)||0;}catch{}
    return { ok: true, pote: poteTot, autoPreencher: autoP, iaConectada: iaOn, acessoFull, me: { id: u.id, nome: u.nome || u.email, email: u.email, papel: u.papel, nomeTime: pf.nome_time || "", avatar: pf.avatar || "", pagou: !!pf.pagou, valorPago }, carteiras: { saldo: Number(cart.saldo || 0) }, ranking: { pos, pontos, total }, proximo, palpitesPendentes: pend, mataAberto, longoFeito, steps: { rod: stRod, ca: longoFeito } };
  });

  app.post("/jogar/perfil", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const b: any = req.body || {};
    const nome = String(b.nome || "").trim().slice(0, 60);
    const time = String(b.nomeTime || "").trim().slice(0, 40);
    if (nome) await pool.query("UPDATE usuarios SET nome=$2 WHERE id=$1", [u.id, nome]);
    await pool.query("UPDATE usuarios SET nome_time=$2 WHERE id=$1", [u.id, time]);
    return { ok: true };
  });
  app.post("/jogar/perfil/avatar", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const b: any = req.body || {};
    const data = String(b.dataUrl || "");
    if (!/^data:image\/(png|jpeg|jpg|webp);base64,/.test(data) || data.length > 400000) return reply.code(400).send({ erro: "imagem invalida ou grande demais" });
    await pool.query("UPDATE usuarios SET avatar=$2 WHERE id=$1", [u.id, data]);
    return { ok: true, avatar: data };
  });

  app.get("/jogar/bolao", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const rod = Number((req.query as any)?.rodada || 0);
    const args: any[] = [u.id];
    let q = `SELECT j.id, j.selecao_casa, j.selecao_visitante, j.inicio, j.status, j.rodada, j.odds, pb.placar_casa pc, pb.placar_visitante pv, pb.auto pauto
      FROM jogos j LEFT JOIN palpites_bolao pb ON pb.jogo_id=j.id AND pb.usuario_id=$1
      WHERE j.selecao_casa<>'A definir' AND j.selecao_visitante<>'A definir' AND j.fase='grupos'`;
    if (rod) { args.push(rod); q += ` AND j.rodada=$${args.length}`; }
    q += " ORDER BY j.inicio NULLS LAST, j.id";
    const rows = (await pool.query(q, args)).rows as any[];
    const allg = (await pool.query("SELECT selecao_casa, selecao_visitante, inicio FROM jogos WHERE fase='grupos' AND selecao_casa<>'A definir' AND selecao_visitante<>'A definir'")).rows as any[];
    let gmap = new Map<string, string>(); try { gmap = mapaGrupos(allg); } catch {}
    const agora = Date.now();
    const jogos = rows.map((j) => { const c = timePT(j.selecao_casa), v = timePT(j.selecao_visitante); const travado = j.inicio ? new Date(j.inicio).getTime() <= agora : false; const od = j.odds && j.odds.casa != null ? { casa: j.odds.casa, empate: j.odds.empate, fora: j.odds.fora, fonte: j.odds.fonte || "", gid: j.odds.gid || null, url: j.odds.url || null } : null; return { id: j.id, rodada: j.rodada, inicio: j.inicio, travado, grupo: gmap.get(j.selecao_casa) || "", casa: { pt: c.pt, iso: c.iso, en: j.selecao_casa }, visitante: { pt: v.pt, iso: v.iso, en: j.selecao_visitante }, odds: od, meu: (j.pc != null && j.pv != null) ? { pc: j.pc, pv: j.pv, auto: !!j.pauto } : null }; });
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

  app.post("/jogar/palpite-limpar", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const b = (req.body ?? {}) as any; const id = Number(b.jogo_id);
    if (!Number.isInteger(id)) return reply.code(400).send({ erro: "dados invalidos" });
    const jg = (await pool.query("SELECT inicio FROM jogos WHERE id=$1", [id])).rows[0] as any;
    if (jg && jg.inicio && new Date(jg.inicio).getTime() <= Date.now()) return reply.code(403).send({ erro: "jogo ja comecou" });
    await pool.query("DELETE FROM palpites_bolao WHERE jogo_id=$1 AND usuario_id=$2", [id, u.id]);
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
      const pal = palpiteAuto1(j.odds, j.selecao_casa, j.selecao_visitante);
      await pool.query(`INSERT INTO palpites_bolao (usuario_id, jogo_id, placar_casa, placar_visitante) VALUES ($1,$2,$3,$4)
        ON CONFLICT (usuario_id, jogo_id) DO UPDATE SET placar_casa=$3, placar_visitante=$4, atualizado_em=now()`, [u.id, j.id, pal.pc, pal.pv]); n++;
    }
    return { ok: true, preenchidos: n };
  });

  app.post("/jogar/auto", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const on = !!(req.body as any)?.on;
    try { await pool.query("UPDATE usuarios SET auto_preencher=$1 WHERE id=$2", [on, u.id]); } catch (e: any) { return { ok: false, erro: String(e?.message ?? e).slice(0,120) }; }
    return { ok: true, on };
  });


  app.get("/jogar/pat", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    let pat = ""; try { pat = String(((await pool.query("SELECT pat FROM usuarios WHERE id=$1", [u.id])).rows[0] as any)?.pat || ""); } catch {}
    return { ok: true, pat };
  });
  app.post("/jogar/pat", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const pat = "blc_" + randomBytes(18).toString("hex");
    try { await pool.query("UPDATE usuarios SET pat=$1 WHERE id=$2", [pat, u.id]); } catch (e: any) { return { ok: false, erro: String(e?.message ?? e).slice(0, 120) }; }
    return { ok: true, pat };
  });

  app.get("/jogar/ranking", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const tipo = String((req.query as any)?.tipo || "geral");
    const rs = (await pool.query(`SELECT r.usuario_id uid, COALESCE(us.nome, us.email) nome, us.nome_time time, us.avatar avatar, COALESCE(r.pontos_bolao,0) bolao, COALESCE(r.pontos_arena,0) arena FROM ranking r JOIN usuarios us ON us.id=r.usuario_id`)).rows as any[];
    const metric = (x: any) => tipo === "bolao" ? Number(x.bolao) : tipo === "arena" ? Number(x.arena) : Number(x.bolao) + Number(x.arena);
    rs.sort((a, b) => metric(b) - metric(a) || String(a.nome).localeCompare(String(b.nome)));
    return { ok: true, eu: u.id, tipo, ranking: rs.slice(0, 50).map((x, i) => ({ pos: i + 1, nome: x.nome, time: x.time || "", avatar: x.avatar || "", bolao: Number(x.bolao || 0), arena: Number(x.arena || 0), total: Number(x.bolao || 0) + Number(x.arena || 0), pts: metric(x), eu: x.uid === u.id })) };
  });

  app.get("/jogar/contexto", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const id = Number((req.query as any)?.jogo || 0); if (!id) return reply.code(400).send({ erro: "jogo?" });
    const ctx = await montarContexto(id); if (!ctx) return reply.code(404).send({ erro: "jogo nao existe" });
    return ctx;
  });

  app.get("/jogar/ia", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const cfg = (await pool.query("SELECT provedor, modelo, base_url, (api_key<>'') temkey FROM usuarios_llm WHERE usuario_id=$1", [u.id])).rows[0] as any;
    let gastoBrl = 0; try { gastoBrl = Number(((await pool.query("SELECT COALESCE(sum(custo_brl),0) g FROM gastos_log WHERE origem='jogador' AND processo=$1", [String(u.id)])).rows[0] as any)?.g || 0); } catch {}
    return { ok: true, conectada: !!(cfg && cfg.temkey), provedor: cfg?.provedor || "gemini", modelo: cfg?.modelo || "", base_url: cfg?.base_url || "", gastoBrl };
  });

  app.post("/jogar/ia", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const b = (req.body ?? {}) as any;
    const provedor = String(b.provedor || "gemini"), modelo = String(b.modelo || ""), base_url = String(b.base_url || ""), key = String(b.api_key || "");
    try {
      if (key) await pool.query("INSERT INTO usuarios_llm (usuario_id,provedor,modelo,api_key,base_url,atualizado_em) VALUES ($1,$2,$3,$4,$5,now()) ON CONFLICT (usuario_id) DO UPDATE SET provedor=$2,modelo=$3,api_key=$4,base_url=$5,atualizado_em=now()", [u.id, provedor, modelo, key, base_url]);
      else await pool.query("INSERT INTO usuarios_llm (usuario_id,provedor,modelo,base_url,atualizado_em) VALUES ($1,$2,$3,$4,now()) ON CONFLICT (usuario_id) DO UPDATE SET provedor=$2,modelo=$3,base_url=$4,atualizado_em=now()", [u.id, provedor, modelo, base_url]);
    } catch (e: any) { return { ok: false, erro: String(e?.message ?? e).slice(0, 120) }; }
    return { ok: true };
  });

  app.post("/jogar/ia/desconectar", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    try { await pool.query("DELETE FROM usuarios_llm WHERE usuario_id=$1", [u.id]); } catch (e: any) { return { ok: false, erro: String(e?.message ?? e).slice(0, 120) }; }
    return { ok: true };
  });

  app.post("/jogar/ia/modelos", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const b = (req.body ?? {}) as any;
    let mkey = String(b.api_key || ""); if (!mkey) { try { mkey = String(((await pool.query("SELECT api_key FROM usuarios_llm WHERE usuario_id=$1", [u.id])).rows[0] as any)?.api_key || ""); } catch {} }
    try { const mods = await listarModelos(String(b.provedor || "gemini"), mkey, String(b.base_url || ""), "texto"); return { ok: true, modelos: mods.slice(0, 80) }; }
    catch (e: any) { return { ok: false, erro: String(e?.message ?? e).slice(0, 140) }; }
  });

  app.post("/jogar/ia/testar", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const b = (req.body ?? {}) as any;
    const provedor = String(b.provedor || "gemini"), modelo = String(b.modelo || ""), base_url = String(b.base_url || "");
    let api_key = String(b.api_key || ""); if (!api_key) { try { api_key = String(((await pool.query("SELECT api_key FROM usuarios_llm WHERE usuario_id=$1", [u.id])).rows[0] as any)?.api_key || ""); } catch {} }
    if (!api_key) return { ok: false, erro: "conecte sua IA primeiro" };
    if (!modelo) return { ok: false, erro: "escolha um modelo" };
    try { const r = await invocarTexto({ provedor, modelo, api_key, base_url } as any, "Responda apenas: OK"); return { ok: true, resposta: String(r.texto || "").trim().slice(0, 40) || "OK", tokens: { in: r.usage.in, out: r.usage.out } }; }
    catch (e: any) { return { ok: false, erro: String(e?.message ?? e).slice(0, 140) }; }
  });

  app.post("/jogar/ia/preencher", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const rod = Number((req.body as any)?.rodada || 0);
    const prov = (await pool.query("SELECT provedor, modelo, api_key, base_url FROM usuarios_llm WHERE usuario_id=$1", [u.id])).rows[0] as any;
    if (!prov || !prov.api_key) return { ok: false, erro: "conecte sua IA primeiro" };
    const args: any[] = [u.id]; let q = "SELECT id, selecao_casa, selecao_visitante FROM jogos j WHERE fase='grupos' AND selecao_casa<>'A definir' AND selecao_visitante<>'A definir' AND inicio>now() AND NOT EXISTS (SELECT 1 FROM palpites_bolao pb WHERE pb.jogo_id=j.id AND pb.usuario_id=$1)";
    if (rod) { args.push(rod); q += ` AND rodada=$${args.length}`; }
    q += " ORDER BY inicio LIMIT 20";
    let jogos: any[] = []; try { jogos = (await pool.query(q, args)).rows as any[]; } catch (e: any) { return { ok: false, erro: String(e?.message ?? e).slice(0, 120) }; }
    const palpites: any[] = []; let erros = 0;
    for (const jj of jogos) {
      try {
        const ctx = await montarContexto(jj.id); if (!ctx) continue;
        const prompt = "Você é um analista de futebol. Com base no CONTEXTO (JSON) do jogo da Copa, preveja o placar final mais provável (considere odds, probabilidade, escalação, forma e notícias). IMPORTANTE: e Copa do Mundo em sedes neutras (EUA/Canada/Mexico) — NAO existe mando de campo nem vantagem de jogar em casa (so o pais-sede jogando no seu pais tem leve fator torcida); 'casa'/'visitante' e apenas a ordem do confronto, nunca cite 'mando' ou 'vantagem de casa' como argumento. Responda SOMENTE com JSON válido {\"pc\":N,\"pv\":N} onde pc=gols " + ctx.jogo.casa.pt + " e pv=gols " + ctx.jogo.visitante.pt + ", sem texto extra. CONTEXTO: " + JSON.stringify(ctx);
        const t0 = Date.now();
        const r = await invocarTexto({ provedor: prov.provedor, modelo: prov.modelo, api_key: prov.api_key, base_url: prov.base_url } as any, prompt);
        const m = String(r.texto).match(/\{[\s\S]*?\}/); let pc: any = null, pv: any = null;
        if (m) { try { const o = JSON.parse(m[0]); pc = Math.max(0, Math.min(20, Math.round(+o.pc))); pv = Math.max(0, Math.min(20, Math.round(+o.pv))); } catch {} }
        if (pc == null || pv == null || isNaN(pc) || isNaN(pv)) { erros++; }
        else {
          await pool.query("INSERT INTO palpites_bolao (usuario_id,jogo_id,placar_casa,placar_visitante,ia) VALUES ($1,$2,$3,$4,true) ON CONFLICT (usuario_id,jogo_id) DO UPDATE SET placar_casa=$3,placar_visitante=$4,ia=true,atualizado_em=now()", [u.id, jj.id, pc, pv]);
          palpites.push({ jogo_id: jj.id, casa: ctx.jogo.casa.pt, visitante: ctx.jogo.visitante.pt, pc, pv });
        }
        try { await registrarGasto({ modelo: prov.modelo, tokens_in: r.usage.in, tokens_out: r.usage.out, tokens_cache: r.usage.cache, processo: String(u.id), origem: "jogador", tempo: (Date.now() - t0) / 1000 }); } catch {}
      } catch (e: any) { erros++; }
    }
    let gastoBrl = 0; try { gastoBrl = Number(((await pool.query("SELECT COALESCE(sum(custo_brl),0) g FROM gastos_log WHERE origem='jogador' AND processo=$1", [String(u.id)])).rows[0] as any)?.g || 0); } catch {}
    return { ok: true, preenchidos: palpites.length, erros, palpites, gastoBrl };
  });

  app.post("/jogar/ia/palpitar-jogo", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const id = Number((req.body as any)?.jogo || 0); if (!id) return { ok: false, erro: "jogo?" };
    const ctx = await montarContexto(id); if (!ctx) return { ok: false, erro: "jogo nao existe" };
    try { const pv = (await pool.query("SELECT provedor, modelo, api_key, base_url FROM usuarios_llm WHERE usuario_id=$1", [u.id])).rows[0] as any; if (pv && pv.api_key && ctx.noticias) { const inv = (p: string) => invocarTexto({ provedor: pv.provedor, modelo: pv.modelo, api_key: pv.api_key, base_url: pv.base_url } as any, p).then((r: any) => String(r.texto || "")); ctx.noticias.casa = await resumirNoticias(ctx.noticias.casa, inv, u.id); ctx.noticias.visitante = await resumirNoticias(ctx.noticias.visitante, inv, u.id); } } catch {}
    const base: any = { ok: true, jogo_id: id, casa: ctx.jogo.casa.pt, visitante: ctx.jogo.visitante.pt, isoC: ctx.jogo.casa.iso, isoV: ctx.jogo.visitante.iso };
    const prov = (await pool.query("SELECT provedor, modelo, api_key, base_url FROM usuarios_llm WHERE usuario_id=$1", [u.id])).rows[0] as any;
    const logico = (): any => {
      const c = ctx.jogo.casa.pt, v = ctx.jogo.visitante.pt;
      const od = ctx.odds, ex = ctx.extra365 || {};
      const mc = medias5(ex?.casa?.ultimas5), mv = medias5(ex?.visitante?.ultimas5);
      const passos: string[] = [];
      let favCasa = true, fodd = 2.0; const pr = ctx.probabilidade;
      if (od && od.casa != null && od.fora != null) {
        const oc = Number(od.casa), of = Number(od.fora);
        favCasa = oc <= of; fodd = favCasa ? oc : of;
        const prFav = pr ? (favCasa ? pr.casa : pr.fora) : null;
        passos.push("Favorito pelas odds: " + (favCasa ? c : v) + (prFav != null ? (" (~" + prFav + "% de vitória)") : ""));
        if (Math.abs(oc - of) < 0.25) {
          let pc = 1, pv = 1, resumo = "Jogo equilibrado, empate provável.";
          passos.push("Odds quase iguais → jogo muito parelho.");
          if (mc && mv) {
            if (mc.aprov - mv.aprov >= 0.34) { pc = 2; pv = 1; favCasa = true; resumo = c + " em melhor fase, leva por pouco."; }
            else if (mv.aprov - mc.aprov >= 0.34) { pc = 1; pv = 2; favCasa = false; resumo = v + " em melhor fase, leva por pouco."; }
            passos.push("Forma desempata: " + c + " " + Math.round(mc.aprov * 100) + "% x " + v + " " + Math.round(mv.aprov * 100) + "% de aproveitamento (últimos 5).");
          } else passos.push("Sem forma recente p/ desempatar → mantém empate.");
          passos.push("Placar final: " + pc + "-" + pv);
          return { ...base, pc, pv, resumo, fonte: "logica", passos };
        }
      } else if (ctx.jogo.casa.rankFifa && ctx.jogo.visitante.rankFifa) {
        favCasa = ctx.jogo.casa.rankFifa <= ctx.jogo.visitante.rankFifa; fodd = 1.9;
        passos.push("Sem odds — favorito pelo ranking FIFA: " + (favCasa ? c : v) + " (#" + (favCasa ? ctx.jogo.casa.rankFifa : ctx.jogo.visitante.rankFifa) + ").");
      } else {
        return { ...base, pc: 1, pv: 1, resumo: "Sem dados suficientes, empate.", fonte: "logica", passos: ["Sem odds nem ranking — palpite conservador 1-1."] };
      }
      let gv: number, gp: number;
      if (fodd <= 1.4) { gv = 2; gp = 0; } else if (fodd <= 1.9) { gv = 2; gp = 1; } else { gv = 1; gp = 0; }
      passos.push("Placar base pela força das odds: " + gv + "-" + gp + " para o favorito.");
      const favM = favCasa ? mc : mv, undM = favCasa ? mv : mc;
      const aj: string[] = [];
      if (favM && undM) {
        if (favM.gpM >= 2.2 && undM.gcM >= 1.4) { gv = Math.min(gv + 1, 4); aj.push("favorito marca muito (" + favM.gpM.toFixed(1) + "/jogo) e o rival sofre (" + undM.gcM.toFixed(1) + ") → +1 gol do favorito"); }
        if (undM.gpM >= 1.6 && favM.gcM >= 1.4) { gp = Math.min(gp + 1, 3); aj.push("azarão tem ataque (" + undM.gpM.toFixed(1) + ") e o favorito sofre (" + favM.gcM.toFixed(1) + ") → azarão balança a rede"); }
        if (favM.gcM <= 0.6 && gp > 0) { gp = Math.max(0, gp - 1); aj.push("favorito quase não sofre gols (" + favM.gcM.toFixed(1) + ") → -1 do azarão"); }
        passos.push("Ajuste pela forma (últimos 5): " + (aj.length ? aj.join("; ") : "sem mudança relevante") + ".");
      } else passos.push("Sem forma recente suficiente → mantém o placar base.");
      const pc = favCasa ? gv : gp, pv = favCasa ? gp : gv;
      passos.push("Placar final: " + pc + "-" + pv);
      const resumo = (favCasa ? c : v) + " favorito" + (favM && favM.aprov >= 0.6 ? " e em boa fase" : "") + ", vitória provável.";
      return { ...base, pc, pv, resumo, fonte: "logica", passos };
    };
    const soLogica = !!((req.body as any)?.soLogica);
    if (soLogica || !prov || !prov.api_key) return logico();
    try {
      const prompt = "Voce e um analista de futebol. Com base no CONTEXTO (JSON) do jogo da Copa, preveja o placar final mais provavel (considere odds, probabilidade, escalacao, forma e noticias). IMPORTANTE: e Copa do Mundo em sedes neutras (EUA/Canada/Mexico) — NAO existe mando de campo nem vantagem de jogar em casa (so o pais-sede jogando no seu pais tem leve fator torcida); 'casa'/'visitante' e apenas a ordem do confronto, nunca cite 'mando' ou 'vantagem de casa' como argumento. Responda SOMENTE com JSON valido {\"pc\":N,\"pv\":N,\"resumo\":\"...\"} onde pc=gols " + ctx.jogo.casa.pt + ", pv=gols " + ctx.jogo.visitante.pt + " e resumo = no maximo 8 palavras em portugues dizendo o porque. Nada fora do JSON. CONTEXTO: " + JSON.stringify(ctx);
      const t0 = Date.now();
      const r = await invocarTexto({ provedor: prov.provedor, modelo: prov.modelo, api_key: prov.api_key, base_url: prov.base_url } as any, prompt);
      try { await registrarGasto({ modelo: prov.modelo, tokens_in: r.usage.in, tokens_out: r.usage.out, tokens_cache: r.usage.cache, processo: String(u.id), origem: "jogador", tempo: (Date.now() - t0) / 1000 }); } catch {}
      const m = String(r.texto).match(/\{[\s\S]*\}/);
      if (m) {
        const o = JSON.parse(m[0]);
        const pc = Math.max(0, Math.min(20, Math.round(+o.pc))), pv = Math.max(0, Math.min(20, Math.round(+o.pv)));
        if (!isNaN(pc) && !isNaN(pv)) {
          let resumo = String(o.resumo || "").trim().replace(/\s+/g, " ");
          const w = resumo.split(" "); if (w.length > 9) resumo = w.slice(0, 8).join(" ") + "...";
          if (!resumo) resumo = "Palpite da sua IA.";
          return { ...base, pc, pv, resumo, fonte: "ia" };
        }
      }
      return logico();
    } catch (e: any) {
      const t = String(e?.message ?? e).toLowerCase();
      const lo = logico();
      lo.aviso = (t.indexOf("quota") >= 0 || t.indexOf("exceeded") >= 0 || t.indexOf("rate") >= 0 || t.indexOf("429") >= 0) ? "Sua IA bateu o limite grátis agora — palpitei este jogo pela lógica das odds. Tente de novo em ~1 min ou troque o modelo." : "Sua IA não respondeu aqui — palpitei este jogo pela lógica das odds.";
      return lo;
    }
  });

  app.get("/jogar/ia/custos", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    let resumo: any = { ops: 0, tin: 0, tout: 0, gasto: 0 };
    try { resumo = (await pool.query("SELECT count(*)::int ops, COALESCE(sum(tokens_in),0)::bigint tin, COALESCE(sum(tokens_out),0)::bigint tout, COALESCE(sum(custo_brl),0) gasto FROM gastos_log WHERE origem='jogador' AND processo=$1", [String(u.id)])).rows[0] as any; } catch {}
    let log: any[] = [];
    try { log = (await pool.query("SELECT to_char(ts,'DD/MM HH24:MI') quando, modelo, tokens_in, tokens_out, custo_brl FROM gastos_log WHERE origem='jogador' AND processo=$1 ORDER BY ts DESC LIMIT 50", [String(u.id)])).rows as any[]; } catch {}
    return { ok: true, ops: Number(resumo.ops || 0), tin: Number(resumo.tin || 0), tout: Number(resumo.tout || 0), gastoBrl: Number(resumo.gasto || 0), log };
  });

  app.get("/jogar/copa", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const rows = (await pool.query("SELECT selecao_casa, selecao_visitante, inicio, rodada, resultado_casa AS placar_casa, resultado_visitante AS placar_visitante FROM jogos WHERE fase='grupos' AND selecao_casa<>'A definir' AND selecao_visitante<>'A definir' ORDER BY inicio NULLS LAST, id")).rows as any[];
    let grupos: any[] = []; try { grupos = calcClassificacao(rows); } catch {}
    let gcal = new Map<string, string>(); try { gcal = mapaGrupos(rows); } catch {}
    const calendario = rows.map((j) => { const c = timePT(j.selecao_casa), v = timePT(j.selecao_visitante); return { casa: { pt: c.pt, iso: c.iso }, visitante: { pt: v.pt, iso: v.iso }, inicio: j.inicio, rodada: j.rodada, grupo: gcal.get(j.selecao_casa) || "", rc: j.placar_casa, rv: j.placar_visitante }; });
    const proxRows = (await pool.query("SELECT selecao_casa, selecao_visitante, inicio, rodada FROM jogos WHERE inicio>=now() AND selecao_casa<>'A definir' AND selecao_visitante<>'A definir' ORDER BY inicio ASC LIMIT 8")).rows as any[];
    const proximos = proxRows.map((j) => { const c = timePT(j.selecao_casa), v = timePT(j.selecao_visitante); return { casa: { pt: c.pt, iso: c.iso }, visitante: { pt: v.pt, iso: v.iso }, inicio: j.inicio, rodada: j.rodada }; });
    return { ok: true, grupos, proximos, calendario };
  });
  app.post("/jogar/pacote/abrir", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const tem = (await pool.query("SELECT count(*) n FROM inventario_figurinhas WHERE usuario_id=$1", [u.id])).rows[0] as any;
    if (Number(tem.n) > 0) return { ok: false, jaAbriu: true };
    const plano: [string, number][] = [["Goalkeeper", 1], ["Defence", 4], ["Midfield", 4], ["Offence", 2]];
    const cartas: any[] = [];
    for (const [pos, n] of plano) {
      const cards = (await pool.query("SELECT id, nome, posicao, selecao, raridade, figurinha FROM jogadores WHERE posicao=$1 AND figurinha IS NOT NULL ORDER BY random() LIMIT $2", [pos, n])).rows as any[];
      for (const c of cards) { await pool.query("INSERT INTO inventario_figurinhas (usuario_id, jogador_id, origem) VALUES ($1,$2,'pacote_gratis') ON CONFLICT DO NOTHING", [u.id, c.id]); cartas.push(c); }
    }
    return { ok: true, cartas };
  });
  app.get("/jogar/news", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const itens: any[] = [];
    try {
      const res = (await pool.query("SELECT selecao_casa, selecao_visitante, resultado_casa, resultado_visitante, resultado_em FROM jogos WHERE status='final' AND resultado_casa IS NOT NULL ORDER BY resultado_em DESC NULLS LAST LIMIT 6")).rows as any[];
      for (const j of res){ const c=timePT(j.selecao_casa), v=timePT(j.selecao_visitante); itens.push({tipo:"resultado",tit:"Resultado",txt:c.pt+" "+j.resultado_casa+" x "+j.resultado_visitante+" "+v.pt,iso:c.iso,ts:j.resultado_em,past:true}); }
      const mp = (await pool.query("SELECT pb.pontos, j.selecao_casa, j.selecao_visitante, j.resultado_em FROM palpites_bolao pb JOIN jogos j ON j.id=pb.jogo_id WHERE pb.usuario_id=$1 AND pb.creditado=true AND pb.pontos>0 ORDER BY j.resultado_em DESC NULLS LAST LIMIT 5", [u.id])).rows as any[];
      for (const m of mp){ const c=timePT(m.selecao_casa), v=timePT(m.selecao_visitante); itens.push({tipo:"pontos",tit:"Voce pontuou",txt:"+"+m.pontos+" pts em "+c.pt+" x "+v.pt,iso:c.iso,ts:m.resultado_em,past:true}); }
      const px = (await pool.query("SELECT selecao_casa, selecao_visitante, inicio FROM jogos WHERE inicio>=now() AND selecao_casa<>'A definir' ORDER BY inicio ASC LIMIT 3")).rows as any[];
      for (const j of px){ const c=timePT(j.selecao_casa), v=timePT(j.selecao_visitante); itens.push({tipo:"proximo",tit:"Proximo jogo",txt:c.pt+" x "+v.pt,iso:c.iso,ts:j.inicio,past:false}); }
    } catch {}
    itens.sort((a:any,b:any)=> new Date(b.ts||0).getTime() - new Date(a.ts||0).getTime());
    return { ok:true, itens: itens.slice(0,12) };
  });
  app.get("/jogar/longo", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    let trava = "2026-06-23T23:59:00-03:00";
    try { const tv = (await pool.query("SELECT valor FROM config WHERE chave='longo_trava'")).rows[0]?.valor; if (tv) trava = tv; } catch {}
    const locked = Date.now() >= new Date(trava).getTime();
    const meu = (await pool.query("SELECT campeao, vice, terceiro, quarto, artilheiro_id, artilheiro_nome FROM palpites_longo WHERE usuario_id=$1", [u.id])).rows[0] || {};
    const selRows = (await pool.query("SELECT DISTINCT s FROM (SELECT selecao_casa s FROM jogos WHERE selecao_casa<>'A definir' UNION SELECT selecao_visitante FROM jogos WHERE selecao_visitante<>'A definir') q")).rows as any[];
    const selecoes = selRows.map((r: any) => { const t = timePT(r.s); return { en: r.s, pt: t.pt, iso: t.iso }; }).sort((a: any, b: any) => String(a.pt).localeCompare(String(b.pt)));
    const jogRows = (await pool.query("SELECT id, nome, selecao, figurinha FROM jogadores ORDER BY nome")).rows as any[];
    const jogadores = jogRows.map((j: any) => ({ id: j.id, nome: j.nome, sel: timePT(j.selecao).pt, fig: j.figurinha || "" }));
    return { ok: true, locked, trava, meu, selecoes, jogadores };
  });

  app.post("/jogar/longo", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    let trava = "2026-06-23T23:59:00-03:00";
    try { const tv = (await pool.query("SELECT valor FROM config WHERE chave='longo_trava'")).rows[0]?.valor; if (tv) trava = tv; } catch {}
    if (Date.now() >= new Date(trava).getTime()) return reply.code(403).send({ erro: "palpites de longo prazo travados (fim da Rodada 2)" });
    const b = (req.body ?? {}) as any;
    const v = (x: any) => { const t = String(x || "").trim(); return t ? t.slice(0, 40) : null; };
    const campeao = v(b.campeao), vice = v(b.vice), terceiro = v(b.terceiro), quarto = v(b.quarto);
    const _pod = [campeao, vice, terceiro, quarto].filter((x) => x); if (new Set(_pod).size !== _pod.length) return reply.code(400).send({ erro: "nao repita selecoes no podio" });
    const artId = (b.artilheiro_id != null && b.artilheiro_id !== "") ? Number(b.artilheiro_id) : null;
    let artNome: string | null = null;
    if (artId != null) { const jr = (await pool.query("SELECT nome FROM jogadores WHERE id=$1", [artId])).rows[0] as any; if (!jr) return reply.code(400).send({ erro: "artilheiro invalido" }); artNome = jr.nome; }
    await pool.query(`INSERT INTO palpites_longo (usuario_id,campeao,vice,terceiro,quarto,artilheiro_id,artilheiro_nome,atualizado_em)
      VALUES ($1,$2,$3,$4,$5,$6,$7,now())
      ON CONFLICT (usuario_id) DO UPDATE SET campeao=$2,vice=$3,terceiro=$4,quarto=$5,artilheiro_id=$6,artilheiro_nome=$7,atualizado_em=now()`,
      [u.id, campeao, vice, terceiro, quarto, artId, artNome]);
    return { ok: true };
  });

  app.get("/jogar/longo/auto", async (req, reply) => {
    const u = await jogador(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const modo = String((req.query as any)?.modo || "logica");
    const selRows = (await pool.query("SELECT DISTINCT s FROM (SELECT selecao_casa s FROM jogos WHERE selecao_casa<>'A definir' UNION SELECT selecao_visitante FROM jogos WHERE selecao_visitante<>'A definir') q")).rows as any[];
    const selecoes = selRows.map((r: any) => r.s as string);
    if (modo !== "ia") {
      // sorteio PONDERADO pela forca (ranking FIFA): favorito tem muito mais chance, mas cada clique varia
      const peso = (en: string) => 1 / Math.pow(rankOf(en) || 50, 1.3);
      const cand = selecoes.map((en) => ({ en, w: peso(en) }));
      const pick: string[] = [];
      for (let n = 0; n < 4 && cand.length; n++) {
        let tot = cand.reduce((acc, x) => acc + x.w, 0);
        let rnd = Math.random() * tot, idx = 0;
        for (let i = 0; i < cand.length; i++) { rnd -= cand[i].w; if (rnd <= 0) { idx = i; break; } }
        pick.push(cand[idx].en); cand.splice(idx, 1);
      }
      const arts = (await pool.query("SELECT j.id, j.nome, j.figurinha, g.shooting FROM jogadores_365 g JOIN jogadores j ON j.id=g.jogador_id WHERE g.shooting IS NOT NULL ORDER BY g.shooting DESC NULLS LAST LIMIT 20")).rows as any[];
      let tota = arts.reduce((acc, a) => acc + Number(a.shooting || 0), 0), rnda = Math.random() * tota, art: any = arts[0] || null;
      for (const a of arts) { rnda -= Number(a.shooting || 0); if (rnda <= 0) { art = a; break; } }
      return { ok: true, modo: "logica", campeao: pick[0] || "", vice: pick[1] || "", terceiro: pick[2] || "", quarto: pick[3] || "", artilheiro_id: art?.id || null, artilheiro_nome: art?.nome || "", artilheiro_fig: art?.figurinha || "" };
    }
    const prov = (await pool.query("SELECT provedor, modelo, api_key, base_url FROM usuarios_llm WHERE usuario_id=$1", [u.id])).rows[0] as any;
    if (!prov || !prov.api_key) return { ok: false, erro: "conecte sua IA primeiro (menu Conectar IA)" };
    const lista = selecoes.map((en) => timePT(en).pt).join(", ");
    const prompt = "Voce e especialista na Copa do Mundo 2026. Das selecoes a seguir, preveja o podio final (campeao, vice, 3o, 4o) e o ARTILHEIRO da Copa. SELECOES: " + lista + ". Responda SOMENTE JSON valido {\"campeao\":\"\",\"vice\":\"\",\"terceiro\":\"\",\"quarto\":\"\",\"artilheiro\":\"\"} com os nomes das selecoes EXATAMENTE como na lista; artilheiro = nome de um jogador. Nada fora do JSON.";
    try {
      const t0 = Date.now();
      const rr = await invocarTexto({ provedor: prov.provedor, modelo: prov.modelo, api_key: prov.api_key, base_url: prov.base_url } as any, prompt);
      try { await registrarGasto({ modelo: prov.modelo, tokens_in: rr.usage.in, tokens_out: rr.usage.out, tokens_cache: rr.usage.cache, processo: String(u.id), origem: "jogador", tempo: (Date.now() - t0) / 1000 }); } catch {}
      const mm = String(rr.texto).match(/\{[\s\S]*\}/); if (!mm) return { ok: false, erro: "a IA nao retornou um palpite valido" };
      const o = JSON.parse(mm[0]);
      const norm = (x: any) => String(x || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
      const mapPt = new Map<string, string>(); for (const en of selecoes) mapPt.set(norm(timePT(en).pt), en);
      const toEn = (pt: any) => mapPt.get(norm(pt)) || "";
      let art: any = null;
      if (o.artilheiro) { const an = norm(o.artilheiro); const jl = (await pool.query("SELECT id, nome, figurinha FROM jogadores")).rows as any[]; art = jl.find((j: any) => norm(j.nome) === an) || jl.find((j: any) => norm(j.nome).indexOf(an) >= 0 || an.indexOf(norm(j.nome)) >= 0); }
      return { ok: true, modo: "ia", campeao: toEn(o.campeao), vice: toEn(o.vice), terceiro: toEn(o.terceiro), quarto: toEn(o.quarto), artilheiro_id: art?.id || null, artilheiro_nome: art?.nome || String(o.artilheiro || ""), artilheiro_fig: art?.figurinha || "" };
    } catch (e: any) { return { ok: false, erro: String(e?.message ?? e).slice(0, 140) }; }
  });
}
