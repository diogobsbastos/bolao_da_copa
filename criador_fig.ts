import type { FastifyInstance, FastifyRequest } from "fastify";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";
import { registrarGasto } from "./custos.js";
import { PAGINA } from "./criador_fig_page.js";

const pexec = promisify(execFile);
const DIR = "/home/ubuntu/bolao-copa26/figurinhas";
const RAIZ = "/home/ubuntu/bolao-copa26";
const REF_PADRAO = "08.png";
const CFG_KEY = "corte_local_v2";

// padroes: tarjas AUTO-DETECTADAS por tile; x e a faixa horizontal (medida); cabeca adaptativa
const DEFAULT_LOCAL: any = { cinza: [152, 156, 162], blur: 1.0, modo: "cabeca", ombro: 0.72, cab_y: 0.46, tarja_modo: "cor_real", pal_x: 0.085, x0: 0.062, x1: 0.745, nome_y0: 0.822, nome_y1: 0.900, pos_y0: 0.908, pos_y1: 0.960 };

async function admOk(req: FastifyRequest): Promise<boolean> {
  const t = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (expected && t === expected) return true;
  const u = await usuarioDaReq(req);
  return u?.papel === "admin";
}

const PROMPT_BASE_DEFAULT = `Edite a figurinha de colecionador da Panini Copa do Mundo 2026 da imagem de referencia anexada, mantendo VERTICAL e com o template IDENTICO.

MANTENHA INTEGRALMENTE todo o template do time: a borda colorida, o grande numero "26" e o logo FIFA World Cup ao fundo, a coluna lateral direita (bandeira do pais, sigla e texto vertical) e o logo da Panini no canto inferior direito. NENHUMA alteracao nesses elementos.

UNICA mudanca no retrato: troque a pessoa central por uma SILHUETA CINZA SOLIDA so na CABECA, mantendo a camisa oficial da selecao da referencia.

NAS DUAS TARJAS INFERIORES: apague APENAS o TEXTO, deixando as tarjas com a MESMA COR e formato do original, porem SEM palavras. NAO pinte de preto, NAO coloque retangulos por cima.

Acabamento de colecionador, impressao profissional. Nao adicione bordas, textos ou elementos novos.`;

const PROMPT_JOGADOR_DEFAULT = `Edite a figurinha de colecionador da Panini Copa do Mundo 2026 da imagem de template anexada, mantendo VERTICAL e com o template IDENTICO (mesma borda, numero "26", logo FIFA, coluna lateral com bandeira e sigla, logo Panini).

SUBSTITUA o retrato central pela PESSOA da segunda foto anexada (o rosto/retrato enviado), vestindo a MESMA camisa oficial da selecao da referencia (escudo e marca esportiva visiveis), integrando o rosto de forma natural a iluminacao, sombras e cor do template.

NAS DUAS TARJAS INFERIORES: apague APENAS o TEXTO, deixando as tarjas com a MESMA COR e formato do original, porem SEM palavras. NAO pinte de preto, NAO coloque retangulos por cima.

Acabamento de colecionador, impressao profissional. Nao adicione bordas, textos ou elementos novos.`;

async function getCfg(chave: string, def = ""): Promise<string> {
  try { const { rows } = await pool.query("SELECT valor FROM config WHERE chave=$1", [chave]); return (rows as any[])[0]?.valor ?? def; } catch { return def; }
}
async function setCfg(chave: string, valor: string): Promise<void> {
  await pool.query("INSERT INTO config (chave, valor) VALUES ($1,$2) ON CONFLICT (chave) DO UPDATE SET valor=$2, atualizado_em=now()", [chave, valor]);
}
async function getLocalCfg(): Promise<any> {
  try { const s = await getCfg(CFG_KEY); const o = s ? JSON.parse(s) : {}; return { ...DEFAULT_LOCAL, ...o }; } catch { return { ...DEFAULT_LOCAL }; }
}

async function provImagem(): Promise<any | null> {
  let { rows } = await pool.query("SELECT * FROM llm_provedores WHERE em_uso=true AND papel='imagem' ORDER BY id LIMIT 1");
  if (!rows.length) ({ rows } = await pool.query("SELECT * FROM llm_provedores WHERE papel='imagem' ORDER BY id LIMIT 1"));
  return (rows as any[])[0] ?? null;
}

async function gerarImagemGemini(prov: any, prompt: string, refs: string[]): Promise<{ b64: string; mime: string; usage: any }> {
  if (typeof fetch !== "function") throw new Error("fetch indisponivel");
  const parts: any[] = [{ text: prompt }];
  for (const b of refs) parts.push({ inline_data: { mime_type: "image/png", data: b } });
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(prov.modelo) + ":generateContent?key=" + encodeURIComponent(prov.api_key);
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contents: [{ parts }] }) });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error?.message || ("http " + r.status));
  const outParts: any[] = j?.candidates?.[0]?.content?.parts || [];
  let img: any = null;
  for (const p of outParts) { const d = p.inlineData || p.inline_data; if (d?.data) { img = d; break; } }
  if (!img) throw new Error("o modelo nao retornou imagem (resposta: " + JSON.stringify(outParts).slice(0, 120) + ")");
  const u = j?.usageMetadata || {};
  return { b64: img.data, mime: img.mimeType || img.mime_type || "image/png", usage: { in: Number(u.promptTokenCount || 0), out: Number(u.candidatesTokenCount || 0), cache: Number(u.cachedContentTokenCount || 0) } };
}

async function lerTiles(folder: string): Promise<{ arquivos: string[]; tipo: any; ocr: any }> {
  const base = join(DIR, folder);
  let tipo: any = {}, ocr: any = {};
  try { tipo = JSON.parse(await readFile(join(base, "_tipo.json"), "utf-8")); } catch {}
  try { ocr = JSON.parse(await readFile(join(base, "_ocr5.json"), "utf-8")); } catch {}
  let arquivos: string[] = [];
  try { arquivos = (await readdir(base)).filter((f) => /^\d+\.png$/.test(f)).sort(); } catch {}
  return { arquivos, tipo, ocr };
}

function escolherRef(arquivos: string[], tipo: any, salvo: string, pedido?: string): string {
  const ehJog = (f: string) => String(tipo[f] || "").includes("jogador");
  if (pedido && /^\d+\.png$/.test(pedido) && arquivos.includes(pedido)) return pedido;
  if (salvo && arquivos.includes(salvo)) return salvo;
  if (arquivos.includes(REF_PADRAO) && ehJog(REF_PADRAO)) return REF_PADRAO;
  return arquivos.find(ehJog) || arquivos[0] || "";
}

async function refDoTime(folder: string, pedido?: string): Promise<{ file: string; b64: string }> {
  const { arquivos, tipo } = await lerTiles(folder);
  if (!arquivos.length) throw new Error("nenhuma figurinha encontrada na pasta " + folder);
  const salvo = await getCfg("fig_ref:" + folder);
  const escolhido = escolherRef(arquivos, tipo, salvo, pedido);
  const buf = await readFile(join(DIR, folder, escolhido));
  return { file: escolhido, b64: buf.toString("base64") };
}

export async function rotasCriadorFig(app: FastifyInstance) {
  app.get("/admin/criador-fig", async (_req, reply) => reply.type("text/html").send(PAGINA));

  app.get("/admin/criador-fig/times", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    let dirs: string[] = [];
    try { const ents = await readdir(DIR, { withFileTypes: true }); dirs = ents.filter((e) => e.isDirectory()).map((e) => e.name).sort(); } catch {}
    return { times: dirs };
  });

  app.get("/admin/criador-fig/tiles", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const time = String((req.query as any)?.time ?? "").trim();
    if (!time || time.includes("/") || time.includes("..")) return reply.code(400).send({ erro: "time invalido" });
    const { arquivos, tipo, ocr } = await lerTiles(time);
    const salvo = await getCfg("fig_ref:" + time);
    const ref = escolherRef(arquivos, tipo, salvo);
    const tiles = arquivos.map((f) => ({ file: f, tipo: tipo[f] || "", nome: ocr[f] || "" }));
    return { tiles, ref };
  });

  app.get("/admin/criador-fig/prompts", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const prov = await provImagem();
    return {
      base: (await getCfg("prompt_fig_base")) || PROMPT_BASE_DEFAULT,
      jogador: (await getCfg("prompt_fig_jogador")) || PROMPT_JOGADOR_DEFAULT,
      local: await getLocalCfg(),
      motor: prov ? { provedor: prov.provedor, modelo: prov.modelo, em_uso: prov.em_uso } : null,
    };
  });

  app.post("/admin/criador-fig/prompts", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    if (typeof b.base === "string") await setCfg("prompt_fig_base", b.base);
    if (typeof b.jogador === "string") await setCfg("prompt_fig_jogador", b.jogador);
    if (b.local && typeof b.local === "object") await setCfg(CFG_KEY, JSON.stringify(b.local));
    return { ok: true };
  });

  app.post("/admin/criador-fig/base", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const body = (req.body ?? {}) as any;
    const time = String(body.time ?? "").trim();
    const refPedido = body.ref ? String(body.ref) : undefined;
    if (!time || time.includes("/") || time.includes("..")) return reply.code(400).send({ erro: "time invalido" });
    const prov = await provImagem();
    if (!prov) return reply.code(400).send({ erro: "configure o Motor de Imagem (Configuracoes - aba Motor de Imagem) com um modelo gemini de imagem, ex: gemini-2.5-flash-image" });
    try {
      const ref = await refDoTime(time, refPedido);
      await setCfg("fig_ref:" + time, ref.file);
      const prompt = (await getCfg("prompt_fig_base")) || PROMPT_BASE_DEFAULT;
      const t0 = Date.now();
      const out = await gerarImagemGemini(prov, prompt, [ref.b64]);
      const buf = Buffer.from(out.b64, "base64");
      await writeFile(join(DIR, time, "_base_silhueta.png"), buf);
      await registrarGasto({ modelo: prov.modelo, imagens: 1, processo: "fig_base:" + time, origem: "criador-fig", tempo: (Date.now() - t0) / 1000 });
      return { ok: true, url: "/fig/base/" + encodeURIComponent(time) + ".png?v=" + Date.now(), ref: ref.file, bytes: buf.length };
    } catch (e: any) {
      return reply.code(502).send({ ok: false, erro: String(e?.message ?? e).slice(0, 220) });
    }
  });

  app.post("/admin/criador-fig/local", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const body = (req.body ?? {}) as any;
    const time = String(body.time ?? "").trim();
    const refPedido = body.ref ? String(body.ref) : undefined;
    if (!time || time.includes("/") || time.includes("..")) return reply.code(400).send({ erro: "time invalido" });
    try {
      const { arquivos, tipo } = await lerTiles(time);
      if (!arquivos.length) return reply.code(400).send({ ok: false, erro: "sem figurinhas nessa pasta" });
      const salvo = await getCfg("fig_ref:" + time);
      const file = escolherRef(arquivos, tipo, salvo, refPedido);
      await setCfg("fig_ref:" + time, file);
      const cfg = (body.cfg && typeof body.cfg === "object") ? { ...DEFAULT_LOCAL, ...body.cfg } : await getLocalCfg();
      const src = join(DIR, time, file);
      const out = join(DIR, time, "_base_silhueta_local.png");
      const { stdout } = await pexec("python3", [join(RAIZ, "silhueta.py"), src, out, JSON.stringify(cfg)], { timeout: 180000, maxBuffer: 4 * 1024 * 1024 });
      let j: any = {};
      try { j = JSON.parse(String(stdout || "").trim().split("\n").pop() || "{}"); } catch {}
      if (!j.ok) return reply.code(502).send({ ok: false, erro: j.erro || "silhueta falhou" });
      return { ok: true, url: "/fig/baselocal/" + encodeURIComponent(time) + ".png?v=" + Date.now(), ref: file };
    } catch (e: any) {
      return reply.code(502).send({ ok: false, erro: String(e?.message ?? e).slice(0, 220) });
    }
  });

  app.get("/fig/base/:nome", async (req, reply) => {
    const nome = (req.params as any).nome as string;
    const folder = nome.replace(/\.png$/i, "");
    if (folder.includes("/") || folder.includes("..")) return reply.code(400).send({ erro: "invalido" });
    try { const buf = await readFile(join(DIR, folder, "_base_silhueta.png")); return reply.header("cache-control", "no-cache").type("image/png").send(buf); }
    catch { return reply.code(404).send({ erro: "ainda nao gerada" }); }
  });

  app.get("/fig/baselocal/:nome", async (req, reply) => {
    const nome = (req.params as any).nome as string;
    const folder = nome.replace(/\.png$/i, "");
    if (folder.includes("/") || folder.includes("..")) return reply.code(400).send({ erro: "invalido" });
    try { const buf = await readFile(join(DIR, folder, "_base_silhueta_local.png")); return reply.header("cache-control", "no-cache").type("image/png").send(buf); }
    catch { return reply.code(404).send({ erro: "ainda nao gerada" }); }
  });
}
