// ===== Sistema de Notificacoes multicanal (Beta 1.0 — ROADMAP §1, Onda A) =====
// Canais: inapp (sino do header) + webpush (Service Worker + VAPID, sem lib externa).
// Tabelas: notif_canais (subscriptions), notif_mensagens (broadcasts), notif_envios (inbox/fila).
// API principal: notificar(uid, tipo, titulo, texto, opts) e notificarSegmento(...).
// Web Push: VAPID ES256 (JWT) + cifra aes128gcm (RFC 8291) implementados com node:crypto puro.

import type { FastifyInstance, FastifyRequest } from "fastify";
import crypto from "node:crypto";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";
import { NAV_CSS, NAV_JS, sideHtml } from "./ui.js";
import { timePT } from "./jogos_placar.js";

async function admOk(req: FastifyRequest): Promise<boolean> {
  const t = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (expected && t === expected) return true;
  const u = await usuarioDaReq(req);
  return u?.papel === "admin";
}
async function getCfg(k: string): Promise<string> {
  try { const { rows } = await pool.query("SELECT valor FROM config WHERE chave=$1", [k]); return (rows as any[])[0]?.valor ?? ""; } catch { return ""; }
}
async function setCfg(k: string, v: string): Promise<void> {
  await pool.query("INSERT INTO config (chave,valor) VALUES ($1,$2) ON CONFLICT (chave) DO UPDATE SET valor=$2, atualizado_em=now()", [k, v]);
}

// ---------- base64url ----------
function b64u(b: Buffer): string { return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function fromB64u(s: string): Buffer { s = String(s || "").replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return Buffer.from(s, "base64"); }

// ---------- VAPID ----------
let VAPID: { pub: string; priv: string } | null = null;
export async function ensureVapid(): Promise<{ pub: string; priv: string }> {
  if (VAPID) return VAPID;
  let pub = await getCfg("webpush_vapid_pub"), priv = await getCfg("webpush_vapid_priv");
  if (!pub || !priv) {
    const ec = crypto.createECDH("prime256v1"); ec.generateKeys();
    pub = b64u(ec.getPublicKey()); priv = b64u(ec.getPrivateKey());
    await setCfg("webpush_vapid_pub", pub); await setCfg("webpush_vapid_priv", priv);
    console.log("[notif] chaves VAPID geradas e salvas no config");
  }
  VAPID = { pub, priv }; return VAPID;
}

function vapidJwt(aud: string, pub: string, priv: string): string {
  const now = Math.floor(Date.now() / 1000);
  const hdr = b64u(Buffer.from(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const pay = b64u(Buffer.from(JSON.stringify({ aud, exp: now + 12 * 3600, sub: "mailto:mmonteprof@gmail.com" })));
  const data = hdr + "." + pay;
  const pubBuf = fromB64u(pub);
  const jwk: any = { kty: "EC", crv: "P-256", d: priv, x: b64u(pubBuf.subarray(1, 33)), y: b64u(pubBuf.subarray(33, 65)) };
  const key = crypto.createPrivateKey({ key: jwk, format: "jwk" });
  const sig = crypto.sign("sha256", Buffer.from(data), { key, dsaEncoding: "ieee-p1363" } as any);
  return data + "." + b64u(sig);
}

// ---------- cifra aes128gcm (RFC 8291 / 8188) ----------
function hkdf(salt: Buffer, ikm: Buffer, info: Buffer, len: number): Buffer {
  return Buffer.from(crypto.hkdfSync("sha256", ikm, salt, info, len));
}
function cifrarPush(p256dh: string, auth: string, plaintext: Buffer): Buffer {
  const uaPub = fromB64u(p256dh), authSec = fromB64u(auth);
  const ec = crypto.createECDH("prime256v1"); ec.generateKeys();
  const asPub = ec.getPublicKey();
  const shared = ec.computeSecret(uaPub);
  const ikm = hkdf(authSec, shared, Buffer.concat([Buffer.from("WebPush: info\0"), uaPub, asPub]), 32);
  const salt = crypto.randomBytes(16);
  const cek = hkdf(salt, ikm, Buffer.from("Content-Encoding: aes128gcm\0"), 16);
  const nonce = hkdf(salt, ikm, Buffer.from("Content-Encoding: nonce\0"), 12);
  const rs = Buffer.alloc(4); rs.writeUInt32BE(4096, 0);
  const header = Buffer.concat([salt, rs, Buffer.from([asPub.length]), asPub]);
  const cipher = crypto.createCipheriv("aes-128-gcm", cek, nonce);
  const ct = Buffer.concat([cipher.update(Buffer.concat([plaintext, Buffer.from([2])])), cipher.final(), cipher.getAuthTag()]);
  return Buffer.concat([header, ct]);
}

async function pushHttp(canal: { destino: string; webpush_p256dh: string; webpush_auth: string }, payload: any): Promise<{ ok: boolean; code: number }> {
  const { pub, priv } = await ensureVapid();
  const url = new URL(canal.destino);
  const jwt = vapidJwt(url.origin, pub, priv);
  const body = cifrarPush(canal.webpush_p256dh, canal.webpush_auth, Buffer.from(JSON.stringify(payload)));
  const r = await fetch(canal.destino, {
    method: "POST",
    headers: { "TTL": "86400", "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream", "Urgency": "normal", "Authorization": "vapid t=" + jwt + ", k=" + pub },
    body,
  } as any);
  return { ok: r.status >= 200 && r.status < 300, code: r.status };
}

// ---------- API principal ----------
export interface NotifOpts { referencia?: string | null; canais?: string[]; mensagemId?: number | null; }

export async function notificar(uid: number, tipo: string, titulo: string, texto: string, opts: NotifOpts = {}): Promise<void> {
  const canais = opts.canais && opts.canais.length ? opts.canais : ["inapp", "webpush"];
  const ref = opts.referencia ?? null;
  const mid = opts.mensagemId ?? null;
  try {
    if (canais.includes("inapp")) {
      if (ref) await pool.query("INSERT INTO notif_envios (mensagem_id,usuario_id,canal,tipo,titulo,texto,referencia) VALUES ($1,$2,'inapp',$3,$4,$5,$6) ON CONFLICT (usuario_id,canal,referencia) WHERE referencia IS NOT NULL DO NOTHING", [mid, uid, tipo, titulo, texto, ref]);
      else await pool.query("INSERT INTO notif_envios (mensagem_id,usuario_id,canal,tipo,titulo,texto) VALUES ($1,$2,'inapp',$3,$4,$5)", [mid, uid, tipo, titulo, texto]);
    }
    if (canais.includes("webpush")) {
      const subs = (await pool.query("SELECT id FROM notif_canais WHERE usuario_id=$1 AND canal='webpush' AND ativo=true", [uid])).rows as any[];
      for (const s of subs) {
        if (ref) await pool.query("INSERT INTO notif_envios (mensagem_id,usuario_id,canal,canal_id,tipo,titulo,texto,referencia) VALUES ($1,$2,'webpush',$3,$4,$5,$6,$7) ON CONFLICT (usuario_id,canal,referencia) WHERE referencia IS NOT NULL DO NOTHING", [mid, uid, s.id, tipo, titulo, texto, ref]);
        else await pool.query("INSERT INTO notif_envios (mensagem_id,usuario_id,canal,canal_id,tipo,titulo,texto) VALUES ($1,$2,'webpush',$3,$4,$5,$6)", [mid, uid, s.id, tipo, titulo, texto]);
      }
    }
  } catch (e) { console.error("[notif] erro notificar:", (e as any)?.message || e); }
}

const SEGMENTOS: Record<string, string> = {
  "todos": "SELECT id FROM usuarios",
  "full": "SELECT id FROM usuarios WHERE COALESCE(acesso_full,false)=true OR COALESCE(pagou,false)=true",
  "nao-full": "SELECT id FROM usuarios WHERE COALESCE(acesso_full,false)=false AND COALESCE(pagou,false)=false",
  "top50": "SELECT usuario_id AS id FROM ranking ORDER BY (COALESCE(pontos_bolao,0)+COALESCE(pontos_arena,0)) DESC LIMIT 50",
  "inativos": "SELECT id FROM usuarios WHERE id NOT IN (SELECT usuario_id FROM sessoes WHERE criado_em > now() - interval '3 days')",
};

export async function notificarSegmento(segmento: string, titulo: string, texto: string, criadoPor: number | null, canais: string[] = ["inapp", "webpush"]): Promise<{ mensagemId: number; usuarios: number }> {
  const sql = SEGMENTOS[segmento] || SEGMENTOS["todos"];
  const m = (await pool.query("INSERT INTO notif_mensagens (tipo,segmento,titulo,template,criado_por) VALUES ('broadcast',$1,$2,$3,$4) RETURNING id", [segmento, titulo, texto, criadoPor])).rows[0] as any;
  const ids = (await pool.query(sql)).rows as any[];
  for (const r of ids) await notificar(Number(r.id), "broadcast", titulo, texto, { canais, mensagemId: m.id });
  return { mensagemId: m.id, usuarios: ids.length };
}

// inbox do sino: ultimas notifs inapp do usuario; marca pendente->enviado
export async function notifsDoUsuario(uid: number): Promise<any[]> {
  const rows = (await pool.query("SELECT id, tipo, titulo, texto, criado_em FROM notif_envios WHERE usuario_id=$1 AND canal='inapp' ORDER BY id DESC LIMIT 10", [uid])).rows as any[];
  try { await pool.query("UPDATE notif_envios SET status='enviado', enviado_em=now() WHERE usuario_id=$1 AND canal='inapp' AND status='pendente'", [uid]); } catch {}
  return rows.map((r: any) => ({ tipo: "notif", tit: r.titulo || "Aviso", txt: r.texto || "", ts: r.criado_em, past: false }));
}

// ---------- fila webpush ----------
export async function enviarPendentesWebpush(): Promise<number> {
  let rows: any[] = [];
  try {
    rows = (await pool.query("SELECT e.id, e.titulo, e.texto, e.canal_id, c.destino, c.webpush_p256dh, c.webpush_auth FROM notif_envios e JOIN notif_canais c ON c.id=e.canal_id WHERE e.canal='webpush' AND e.status='pendente' AND c.ativo=true ORDER BY e.id LIMIT 60")).rows as any[];
  } catch { return 0; }
  if (!rows.length) return 0;
  let ok = 0;
  for (const r of rows) {
    try {
      const res = await pushHttp(r, { tit: r.titulo, txt: r.texto });
      if (res.ok) { ok++; await pool.query("UPDATE notif_envios SET status='enviado', enviado_em=now(), resposta=$2 WHERE id=$1", [r.id, String(res.code)]); }
      else {
        await pool.query("UPDATE notif_envios SET status='falhou', resposta=$2 WHERE id=$1", [r.id, String(res.code)]);
        if (res.code === 404 || res.code === 410) await pool.query("UPDATE notif_canais SET ativo=false WHERE id=$1", [r.canal_id]);
      }
    } catch (e) {
      try { await pool.query("UPDATE notif_envios SET status='falhou', resposta=$2 WHERE id=$1", [r.id, String((e as any)?.message || e).slice(0, 180)]); } catch {}
    }
  }
  if (ok) console.log("[notif] webpush enviados:", ok, "/", rows.length);
  return ok;
}

// ---------- gatilho: palpite pendente (jogo entre 60 e 180 min) ----------
export async function lembretePalpites(): Promise<number> {
  let jogos: any[] = [];
  try {
    jogos = (await pool.query("SELECT id, selecao_casa, selecao_visitante, inicio FROM jogos WHERE selecao_casa<>'A definir' AND selecao_visitante<>'A definir' AND inicio > now() + interval '60 minutes' AND inicio <= now() + interval '180 minutes'")).rows as any[];
  } catch { return 0; }
  if (!jogos.length) return 0;
  // trava de pontuacao ligada -> so lembra de jogos que de fato pontuam (inicio >= bolao_inicio_oficial)
  try {
    const trava = String((await getCfg("bolao_trava_pontuacao")) || "on").toLowerCase() === "on";
    if (trava) {
      const ini = await getCfg("bolao_inicio_oficial");
      if (ini) jogos = jogos.filter((j: any) => j.inicio && new Date(j.inicio).getTime() >= new Date(ini).getTime());
    }
  } catch {}
  if (!jogos.length) return 0;
  let n = 0;
  for (const j of jogos) {
    const c = timePT(j.selecao_casa).pt, v = timePT(j.selecao_visitante).pt;
    const hora = new Date(j.inicio).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
    let users: any[] = [];
    try {
      users = (await pool.query("SELECT u.id FROM usuarios u WHERE (COALESCE(u.acesso_full,false)=true OR COALESCE(u.pagou,false)=true) AND NOT EXISTS (SELECT 1 FROM palpites_bolao pb WHERE pb.usuario_id=u.id AND pb.jogo_id=$1)", [j.id])).rows as any[];
    } catch { continue; }
    for (const u of users) {
      await notificar(Number(u.id), "palpite_pendente", "⏰ Palpite pendente!", c + " x " + v + " comeca as " + hora + " e voce ainda nao cravou. Corre la!", { referencia: "pend:jogo:" + j.id });
      n++;
    }
  }
  if (n) console.log("[notif] lembretes de palpite:", n);
  return n;
}

export function iniciarNotificacoes(): void {
  ensureVapid().catch(() => {});
  setTimeout(() => { enviarPendentesWebpush().catch(() => {}); }, 15 * 1000);
  setInterval(() => { enviarPendentesWebpush().catch(() => {}); }, 60 * 1000);
  setTimeout(() => { lembretePalpites().catch(() => {}); }, 30 * 1000);
  setInterval(() => { lembretePalpites().catch(() => {}); }, 10 * 60 * 1000);
  console.log("[notif] modulo de notificacoes iniciado (webpush 60s, lembretes 10min)");
}

// ---------- rotas ----------
export async function rotasNotificacoes(app: FastifyInstance) {
  // --- player ---
  app.get("/jogar/push/vapid", async (req, reply) => {
    const u = await usuarioDaReq(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const { pub } = await ensureVapid();
    return { ok: true, pub };
  });

  app.post("/jogar/push/subscribe", async (req, reply) => {
    const u = await usuarioDaReq(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const b = (req.body || {}) as any;
    const endpoint = String(b.endpoint || "").slice(0, 600), p256dh = String(b.p256dh || ""), auth = String(b.auth || "");
    if (!endpoint.startsWith("https://") || !p256dh || !auth) return reply.code(400).send({ erro: "subscription invalida" });
    await pool.query(`INSERT INTO notif_canais (usuario_id,canal,destino,webpush_p256dh,webpush_auth,consentimento,ativo)
      VALUES ($1,'webpush',$2,$3,$4,true,true)
      ON CONFLICT (canal,destino) DO UPDATE SET usuario_id=$1, webpush_p256dh=$3, webpush_auth=$4, consentimento=true, ativo=true`, [u.id, endpoint, p256dh, auth]);
    return { ok: true };
  });

  app.post("/jogar/push/unsubscribe", async (req, reply) => {
    const u = await usuarioDaReq(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    const b = (req.body || {}) as any;
    await pool.query("UPDATE notif_canais SET ativo=false WHERE canal='webpush' AND usuario_id=$1 AND ($2='' OR destino=$2)", [u.id, String(b.endpoint || "")]);
    return { ok: true };
  });

  app.post("/jogar/notifs/lidas", async (req, reply) => {
    const u = await usuarioDaReq(req); if (!u) return reply.code(401).send({ erro: "nao autenticado" });
    await pool.query("UPDATE notif_envios SET status='lido', lido_em=now() WHERE usuario_id=$1 AND canal='inapp' AND status<>'lido'", [u.id]);
    return { ok: true };
  });

  // --- service worker (escopo /bolao-copa26/) ---
  app.get("/sw.js", async (_req, reply) => reply.header("cache-control", "no-cache").type("application/javascript").send(SW_JS));

  // --- admin ---
  app.get("/admin/notificacoes", async (_req, reply) => reply.header("cache-control", "no-store").type("text/html").send(PAGE));

  app.get("/admin/notificacoes/dados", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "nao autorizado" });
    const n1 = async (q: string) => Number(((await pool.query(q)).rows[0] as any)?.n || 0);
    const pushSubs = await n1("SELECT count(*) n FROM notif_canais WHERE canal='webpush' AND ativo=true");
    const envios24h = await n1("SELECT count(*) n FROM notif_envios WHERE criado_em > now() - interval '24 hours'");
    const lidos24h = await n1("SELECT count(*) n FROM notif_envios WHERE lido_em > now() - interval '24 hours'");
    const usuarios = await n1("SELECT count(*) n FROM usuarios");
    const hist = (await pool.query(`SELECT m.id, m.titulo, m.segmento, m.criado_em,
      (SELECT count(*) FROM notif_envios e WHERE e.mensagem_id=m.id) AS total,
      (SELECT count(*) FROM notif_envios e WHERE e.mensagem_id=m.id AND e.status='lido') AS lidos,
      (SELECT count(*) FROM notif_envios e WHERE e.mensagem_id=m.id AND e.canal='webpush' AND e.status='enviado') AS push_ok
      FROM notif_mensagens m ORDER BY m.id DESC LIMIT 15`)).rows;
    return { ok: true, pushSubs, envios24h, lidos24h, usuarios, hist };
  });

  app.post("/admin/notificacoes/enviar", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "nao autorizado" });
    const b = (req.body || {}) as any;
    const titulo = String(b.titulo || "").trim().slice(0, 90);
    const texto = String(b.texto || "").trim().slice(0, 400);
    const segmento = String(b.segmento || "todos");
    if (!titulo || !texto) return reply.code(400).send({ erro: "titulo e texto obrigatorios" });
    const canais = b.push === false ? ["inapp"] : ["inapp", "webpush"];
    const u = await usuarioDaReq(req);
    const r = await notificarSegmento(segmento, titulo, texto, u?.id ?? null, canais);
    return { ok: true, ...r };
  });

  app.post("/admin/notificacoes/teste", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "nao autorizado" });
    const u = await usuarioDaReq(req);
    if (!u) return reply.code(400).send({ erro: "use logado como admin (Bearer) pra receber o teste" });
    await notificar(u.id, "teste", "🔔 Teste de notificacao", "Se voce esta vendo isso, o canal funciona. " + new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" }));
    await enviarPendentesWebpush().catch(() => {});
    return { ok: true };
  });
}

// ---------- Service Worker ----------
const SW_JS = `self.addEventListener("install",function(e){self.skipWaiting();});
self.addEventListener("activate",function(e){e.waitUntil(self.clients.claim());});
self.addEventListener("push",function(e){var d={};try{d=e.data?e.data.json():{};}catch(err){}
var tit=d.tit||"Bolao Copa 26";
var opts={body:d.txt||"",icon:new URL("og.png",self.registration.scope).href,data:{url:new URL("jogar",self.registration.scope).href}};
e.waitUntil(self.registration.showNotification(tit,opts));});
self.addEventListener("notificationclick",function(e){e.notification.close();
var url=(e.notification.data&&e.notification.data.url)||self.registration.scope;
e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(function(cs){
for(var i=0;i<cs.length;i++){if(cs[i].url.indexOf(self.registration.scope)===0){return cs[i].focus();}}
return self.clients.openWindow(url);}));});
self.addEventListener("fetch",function(){});`;

// ---------- pagina admin ----------
const PAGE = `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Notificacoes - Bolao Copa 26</title>
<style>
:root{--pri:#4361ee;--bg:#f3f4f8;--card:#fff;--tx:#1f2430;--mut:#7a8194;--bd:#e6e8f0;--gr:#1faa59;--rd:#e23744;--gd:#e0a008}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--tx)}
.app{display:flex;min-height:100vh}.main{flex:1;min-width:0}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 24px;background:var(--card);border-bottom:1px solid var(--bd)}
.top h2{margin:0;font-size:18px;display:flex;align-items:center;gap:10px}
.pad{padding:18px 24px 60px;max-width:860px}
.muted{color:var(--mut);font-size:13px}
.card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:18px;margin-bottom:14px}
h3{margin:0 0 6px;font-size:17px;display:flex;align-items:center;gap:8px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:10px}
.stat{background:#f7f8fc;border-radius:10px;padding:12px 14px}
.stat b{display:block;font-size:22px;font-weight:800;color:var(--pri)}
.stat small{font-size:11px;font-weight:700;color:var(--mut);text-transform:uppercase}
label{display:block;font-size:12px;font-weight:800;color:var(--mut);text-transform:uppercase;margin:12px 0 5px}
input[type=text],textarea,select{width:100%;border:1px solid var(--bd);border-radius:10px;padding:11px 12px;font-size:14px;color:var(--tx);background:#fff;font-family:inherit}
textarea{min-height:88px;resize:vertical}
input:focus,textarea:focus,select:focus{border-color:var(--pri);outline:none}
.row{display:flex;gap:10px;align-items:center}
.chk{display:inline-flex;gap:7px;align-items:center;font-size:13px;font-weight:700;margin-top:12px;cursor:pointer}
button{background:var(--gr);color:#fff;border:0;border-radius:10px;padding:11px 20px;font-weight:800;cursor:pointer;font-size:13px;margin-top:14px;transition:transform .1s}
button.sec{background:#283142}button:hover{transform:translateY(-1px)}button:disabled{opacity:.5;cursor:wait}
table{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}
th{font-size:11px;text-transform:uppercase;color:var(--mut);text-align:left;padding:7px 8px;border-bottom:1px solid var(--bd)}
td{padding:8px;border-bottom:1px dashed var(--bd)}
td b{color:var(--pri)}
.tag{display:inline-block;background:#eef1fb;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:800;color:var(--pri)}
.toast{position:fixed;top:18px;right:18px;background:var(--gr);color:#fff;padding:11px 18px;border-radius:10px;font-weight:800;box-shadow:0 8px 24px rgba(0,0,0,.18);opacity:0;transform:translateY(-10px);transition:.25s;z-index:1100}
.toast.show{opacity:1;transform:translateY(0)}.toast.rd{background:var(--rd)}
@media(max-width:700px){.stats{grid-template-columns:repeat(2,1fr)}}
${NAV_CSS}
</style></head><body>
<div class="app">${sideHtml("notif")}
 <main class="main">
  <div class="top"><h2>&#128276; Notificacoes</h2><span id="conn" class="muted">conectando...</span></div>
  <div class="pad">

   <div class="card">
    <h3>&#128202; Visao geral</h3>
    <div class="stats">
     <div class="stat"><b id="st-users">--</b><small>jogadores</small></div>
     <div class="stat"><b id="st-push">--</b><small>push ativos</small></div>
     <div class="stat"><b id="st-envios">--</b><small>envios 24h</small></div>
     <div class="stat"><b id="st-lidos">--</b><small>lidos 24h</small></div>
    </div>
   </div>

   <div class="card">
    <h3>&#128221; Enviar mensagem</h3>
    <div class="muted">Chega no <b>sino do app</b> (in-app) e como <b>notificacao push</b> pra quem ativou os alertas no celular/navegador.</div>
    <label>Titulo</label>
    <input type="text" id="f-tit" maxlength="90" placeholder="Ex.: A pontuacao comeca hoje 19h!" value="⚽ O Bolão começa HOJE às 19h!">
    <label>Texto</label>
    <textarea id="f-txt" maxlength="400" placeholder="Ex.: Hoje tem Brasil x Marrocos valendo. Confira seus palpites antes do apito!">Brasil x Marrocos abre a pontuação. Cadastre seus palpites antes do apito — a partir das 19h vale ponto e token!</textarea>
    <label>Segmento</label>
    <select id="f-seg">
     <option value="todos">Todos os jogadores</option>
     <option value="full">Somente FULL (pagaram ou convite)</option>
     <option value="nao-full">Somente NAO-full (visitantes)</option>
     <option value="top50">Top 50 do ranking</option>
     <option value="inativos">Inativos ha 3+ dias</option>
    </select>
    <label class="chk" style="text-transform:none"><input type="checkbox" id="f-push" checked> Enviar tambem como Web Push</label>
    <div class="row">
     <button id="b-env" onclick="enviar()">&#128640; Enviar agora</button>
     <button class="sec" onclick="teste()">&#128276; Testar comigo</button>
    </div>
   </div>

   <div class="card">
    <h3>&#128340; Historico</h3>
    <table>
     <thead><tr><th>Quando</th><th>Titulo</th><th>Segmento</th><th>Envios</th><th>Lidos</th><th>Push ok</th></tr></thead>
     <tbody id="hist"><tr><td colspan="6" class="muted">carregando...</td></tr></tbody>
    </table>
   </div>

  </div>
 </main>
</div>
<div class="toast" id="toast"></div>
${NAV_JS}
<script>
function H(){var h={"content-type":"application/json"};var s=localStorage.getItem("sessao");if(s)h["authorization"]="Bearer "+s;return h;}
function nb(){var p=location.pathname;var i=p.indexOf("/admin");return i>0?p.slice(0,i):"";}
function toast(m,rd){var t=document.getElementById("toast");t.textContent=m;t.className="toast show"+(rd?" rd":"");setTimeout(function(){t.className="toast";},2600);}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;");}
function carregar(){fetch(nb()+"/admin/notificacoes/dados",{headers:H()}).then(function(r){return r.json();}).then(function(d){
 if(!d||!d.ok){document.getElementById("conn").textContent="sem acesso";return;}
 document.getElementById("conn").textContent="ok";
 document.getElementById("st-users").textContent=d.usuarios;
 document.getElementById("st-push").textContent=d.pushSubs;
 document.getElementById("st-envios").textContent=d.envios24h;
 document.getElementById("st-lidos").textContent=d.lidos24h;
 var h="";var L=d.hist||[];
 if(!L.length)h='<tr><td colspan="6" class="muted">nenhuma mensagem ainda</td></tr>';
 for(var i=0;i<L.length;i++){var m=L[i];var dt=new Date(m.criado_em);function P(x){return(x<10?"0":"")+x;}
  h+='<tr><td>'+P(dt.getDate())+"/"+P(dt.getMonth()+1)+" "+P(dt.getHours())+":"+P(dt.getMinutes())+'</td><td>'+esc(m.titulo)+'</td><td><span class="tag">'+esc(m.segmento)+'</span></td><td><b>'+m.total+'</b></td><td>'+m.lidos+'</td><td>'+m.push_ok+'</td></tr>';}
 document.getElementById("hist").innerHTML=h;
}).catch(function(){document.getElementById("conn").textContent="erro";});}
function enviar(){var tit=document.getElementById("f-tit").value.trim(),txt=document.getElementById("f-txt").value.trim();
 if(!tit||!txt){toast("Preencha titulo e texto",1);return;}
 var seg=document.getElementById("f-seg").value;var push=document.getElementById("f-push").checked;
 var segLbl=document.getElementById("f-seg").selectedOptions[0].textContent;
 if(!confirm("Enviar para: "+segLbl+"?"))return;
 var b=document.getElementById("b-env");b.disabled=true;
 fetch(nb()+"/admin/notificacoes/enviar",{method:"POST",headers:H(),body:JSON.stringify({titulo:tit,texto:txt,segmento:seg,push:push})})
 .then(function(r){return r.json();}).then(function(d){b.disabled=false;
  if(d&&d.ok){toast("Enviado pra "+d.usuarios+" jogador(es)!");document.getElementById("f-tit").value="";document.getElementById("f-txt").value="";carregar();}
  else toast((d&&d.erro)||"erro ao enviar",1);
 }).catch(function(){b.disabled=false;toast("erro de rede",1);});}
function teste(){fetch(nb()+"/admin/notificacoes/teste",{method:"POST",headers:H()}).then(function(r){return r.json();}).then(function(d){
 if(d&&d.ok)toast("Teste enviado! Confira o sino e o push.");else toast((d&&d.erro)||"erro",1);}).catch(function(){toast("erro de rede",1);});}
carregar();setInterval(carregar,30000);
</script>
</body></html>`;
