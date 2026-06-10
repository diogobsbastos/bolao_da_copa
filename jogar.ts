import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { randomBytes } from "node:crypto";
import { usuarioDaReq } from "./auth.js";
import { PAGINA_JOGAR } from "./jogar_page.js";
import { invocarTexto, listarModelos } from "./llm.js";
import { registrarGasto } from "./custos.js";
import { timePT, rankOf, palpiteOdds, calcClassificacao, mapaGrupos, forma2022, noticiasTime, classifGrupoDe } from "./jogos_placar.js";

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


async function montarContexto(id: number): Promise<any | null> {
  const j = (await pool.query("SELECT id, selecao_casa, selecao_visitante, inicio, rodada, fase, odds, lineup_casa, lineup_visitante FROM jogos WHERE id=$1", [id])).rows[0] as any;
  if (!j) return null;
  const c = timePT(j.selecao_casa), v = timePT(j.selecao_visitante);
  let odds: any = null, prob: any = null;
  if (j.odds && j.odds.casa != null) {
    odds = { casa: j.odds.casa, empate: j.odds.empate, fora: j.odds.fora, fonte: j.odds.fonte || "", url: j.odds.url || null };
    const ic = 1 / Number(j.odds.casa), ie = j.odds.empate ? 1 / Number(j.odds.empate) : 0, iff = 1 / Number(j.odds.fora), tot = ic + ie + iff;
    prob = { casa: Math.round(100 * ic / tot), empate: Math.round(100 * ie / tot), fora: Math.round(100 * iff / tot) };
  }
  const lineup = (l: any) => (l && Array.isArray(l.titulares)) ? { formacao: l.formacao, confirmada: !!l.confirmada, titulares: l.titulares.map((t: any) => ({ nome: t.nome, posicao: t.posicao })) } : null;
  const [forCasa, forVisi, nCasa, nVisi, clas] = await Promise.all([
    forma2022(j.selecao_casa).catch(() => []), forma2022(j.selecao_visitante).catch(() => []),
    noticiasTime(c.pt, j.selecao_casa).catch(() => []), noticiasTime(v.pt, j.selecao_visitante).catch(() => []),
    classifGrupoDe(j.selecao_casa).catch(() => null),
  ]);
  return { ok: true, jogo: { id: j.id, rodada: j.rodada, fase: j.fase, inicio: j.inicio, casa: { pt: c.pt, en: j.selecao_casa, iso: c.iso, rankFifa: rankOf(j.selecao_casa) }, visitante: { pt: v.pt, en: j.selecao_visitante, iso: v.iso, rankFifa: rankOf(j.selecao_visitante) } }, odds, probabilidade: prob, escalacao: { casa: lineup(j.lineup_casa), visitante: lineup(j.lineup_visitante) }, forma2022: { casa: forCasa, visitante: forVisi }, classificacao: clas, noticias: { casa: nCasa, visitante: nVisi } };
}

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
    let autoP = false; try { autoP = !!((await pool.query("SELECT auto_preencher FROM usuarios WHERE id=$1", [u.id])).rows[0] as any)?.auto_preencher; } catch {}
    let iaOn = false; try { iaOn = !!((await pool.query("SELECT (length(api_key)>0) k FROM usuarios_llm WHERE usuario_id=$1", [u.id])).rows[0] as any)?.k; } catch {}
    return { ok: true, autoPreencher: autoP, iaConectada: iaOn, me: { id: u.id, nome: u.nome || u.email, email: u.email, papel: u.papel }, carteiras: { colecionador: Number(cart.c || 0), apostas: Number(cart.a || 0), arena: Number(cart.ar || 0) }, ranking: { pos, pontos, total }, proximo, palpitesPendentes: pend };
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
    const rows = (await pool.query(`SELECT r.usuario_id uid, COALESCE(us.nome, us.email) nome, r.pontos_bolao pts FROM ranking r JOIN usuarios us ON us.id=r.usuario_id ORDER BY r.pontos_bolao DESC, us.nome LIMIT 50`)).rows as any[];
    return { ok: true, eu: u.id, ranking: rows.map((x, i) => ({ pos: i + 1, nome: x.nome, pts: Number(x.pts || 0), eu: x.uid === u.id })) };
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
    const base: any = { ok: true, jogo_id: id, casa: ctx.jogo.casa.pt, visitante: ctx.jogo.visitante.pt, isoC: ctx.jogo.casa.iso, isoV: ctx.jogo.visitante.iso };
    const prov = (await pool.query("SELECT provedor, modelo, api_key, base_url FROM usuarios_llm WHERE usuario_id=$1", [u.id])).rows[0] as any;
    const logico = (): any => {
      const p = palpiteAuto1(ctx.odds, ctx.jogo.casa.en, ctx.jogo.visitante.en);
      let resumo = "Palpite pela logica das odds.";
      const pr = ctx.probabilidade;
      if (pr) { if (pr.casa >= pr.fora && pr.casa >= pr.empate) resumo = ctx.jogo.casa.pt + " favorito pelas odds."; else if (pr.fora >= pr.casa && pr.fora >= pr.empate) resumo = ctx.jogo.visitante.pt + " favorito pelas odds."; else resumo = "Jogo equilibrado, tende ao empate."; }
      return { ...base, pc: p.pc, pv: p.pv, resumo, fonte: "logica" };
    };
    if (!prov || !prov.api_key) return logico();
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
      lo.aviso = (t.indexOf("quota") >= 0 || t.indexOf("exceeded") >= 0 || t.indexOf("rate") >= 0 || t.indexOf("429") >= 0) ? "Cota gratis da IA no limite agora — usei a logica." : "Sua IA falhou aqui — usei a logica.";
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
    const rows = (await pool.query("SELECT selecao_casa, selecao_visitante, inicio, placar_casa, placar_visitante FROM jogos WHERE fase='grupos' AND selecao_casa<>'A definir' AND selecao_visitante<>'A definir'")).rows as any[];
    let grupos: any[] = []; try { grupos = calcClassificacao(rows); } catch {}
    const proxRows = (await pool.query("SELECT selecao_casa, selecao_visitante, inicio, rodada FROM jogos WHERE inicio>=now() AND selecao_casa<>'A definir' AND selecao_visitante<>'A definir' ORDER BY inicio ASC LIMIT 8")).rows as any[];
    const proximos = proxRows.map((j) => { const c = timePT(j.selecao_casa), v = timePT(j.selecao_visitante); return { casa: { pt: c.pt, iso: c.iso }, visitante: { pt: v.pt, iso: v.iso }, inicio: j.inicio, rodada: j.rodada }; });
    return { ok: true, grupos, proximos };
  });
}
