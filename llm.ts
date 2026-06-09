import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db.js";
import { usuarioDaReq } from "./auth.js";
import { registrarGasto, garantirPreco } from "./custos.js";

async function admOk(req: FastifyRequest): Promise<boolean> {
  const t = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (expected && t === expected) return true;
  const u = await usuarioDaReq(req);
  return u?.papel === "admin";
}

type Prov = { id?: number; provedor: string; modelo: string; api_key: string; base_url: string; papel?: string; em_uso?: boolean; ultimo_teste?: string };
type Uso = { in: number; out: number; cache: number };
type Resp = { texto: string; usage: Uso };

const VAZIO: Uso = { in: 0, out: 0, cache: 0 };

async function invocarTexto(p: Prov, prompt: string): Promise<Resp> {
  if (typeof fetch !== "function") throw new Error("fetch indisponivel");
  if (p.provedor === "gemini") {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(p.modelo) + ":generateContent?key=" + encodeURIComponent(p.api_key);
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
    const j: any = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error?.message || ("http " + r.status));
    const u = j?.usageMetadata || {};
    return {
      texto: j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
      usage: { in: Number(u.promptTokenCount || 0), out: Number(u.candidatesTokenCount || 0), cache: Number(u.cachedContentTokenCount || 0) },
    };
  }
  const base = (p.base_url || "").replace(/\/+$/, "");
  if (!base) throw new Error("sem base_url");
  const r = await fetch(base + "/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", "authorization": "Bearer " + (p.api_key || "x") },
    body: JSON.stringify({ model: p.modelo, messages: [{ role: "user", content: prompt }], max_tokens: 200 }),
  });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error?.message || ("http " + r.status));
  const u = j?.usage || {};
  return {
    texto: j?.choices?.[0]?.message?.content ?? "",
    usage: { in: Number(u.prompt_tokens || 0), out: Number(u.completion_tokens || 0), cache: Number(u.prompt_tokens_details?.cached_tokens || 0) },
  };
}

// lista modelos disponiveis no provedor
async function listarModelos(provedor: string, api_key: string, base_url: string, papel: string): Promise<string[]> {
  if (typeof fetch !== "function") throw new Error("fetch indisponivel");
  if (provedor === "gemini") {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + encodeURIComponent(api_key) + "&pageSize=200");
    const j: any = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error?.message || ("http " + r.status));
    let mods = (j.models || []).map((m: any) => ({ id: String(m.name || "").replace("models/", ""), met: m.supportedGenerationMethods || [] }));
    if (papel === "imagem") mods = mods.filter((m: any) => /image|imagen|nano/i.test(m.id));
    else mods = mods.filter((m: any) => (m.met || []).includes("generateContent") && !/embedding/i.test(m.id) && !/image|imagen/i.test(m.id));
    return mods.map((m: any) => m.id);
  }
  const base = (base_url || "").replace(/\/+$/, "");
  if (!base) throw new Error("informe a Base URL do provedor local/openai-compativel");
  const r = await fetch(base + "/models", { headers: { authorization: "Bearer " + (api_key || "x") } });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("http " + r.status);
  return (j.data || j.models || []).map((m: any) => m.id || m.name).filter(Boolean);
}

export async function chamarLLM(prompt: string, papel = "texto", ctx: { origem?: string; processo?: string } = {}): Promise<string> {
  let { rows } = await pool.query("SELECT * FROM llm_provedores WHERE em_uso=true AND papel=$1 ORDER BY id LIMIT 1", [papel]);
  if (!rows.length) ({ rows } = await pool.query("SELECT * FROM llm_provedores WHERE em_uso=true ORDER BY id LIMIT 1"));
  const p = rows[0] as Prov | undefined;
  if (!p) throw new Error("nenhuma LLM em uso");
  const t0 = Date.now();
  const r = await invocarTexto(p, prompt);
  await registrarGasto({
    modelo: p.modelo, tokens_in: r.usage.in, tokens_out: r.usage.out, tokens_cache: r.usage.cache,
    processo: ctx.processo || papel, origem: ctx.origem || "backend", tempo: (Date.now() - t0) / 1000,
  });
  return r.texto;
}

export async function rotasLLM(app: FastifyInstance) {
  app.get("/admin/llm", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const papel = String((req.query as any)?.papel ?? "");
    const q = papel ? "SELECT * FROM llm_provedores WHERE papel=$1 ORDER BY id" : "SELECT * FROM llm_provedores ORDER BY papel, id";
    const { rows } = await pool.query(q, papel ? [papel] : []);
    return (rows as Prov[]).map((p) => ({ ...p, api_key_set: Boolean(p.api_key), api_key: p.api_key ? ("..." + p.api_key.slice(-4)) : "" }));
  });

  // busca a chave salva de um provedor (pra reusar ao buscar modelos/testar sem redigitar)
  async function keyDe(id: any, fornecida: string): Promise<string> {
    if (fornecida) return fornecida;
    if (id) { const { rows } = await pool.query("SELECT api_key FROM llm_provedores WHERE id=$1", [Number(id)]); return (rows as any[])[0]?.api_key ?? ""; }
    return "";
  }

  app.post("/admin/llm/modelos", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    const provedor = String(b.provedor ?? "");
    const papel = ["texto", "imagem"].includes(String(b.papel)) ? String(b.papel) : "texto";
    const base_url = String(b.base_url ?? "");
    try {
      const key = await keyDe(b.id, String(b.api_key ?? ""));
      const modelos = await listarModelos(provedor, key, base_url, papel);
      return { ok: true, modelos };
    } catch (e: any) {
      return { ok: false, detalhe: String(e?.message ?? e).slice(0, 160) };
    }
  });

  // testa um provedor SEM salvar (com os parametros atuais do formulario)
  app.post("/admin/llm/testar_params", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    try {
      const key = await keyDe(b.id, String(b.api_key ?? ""));
      const r = await invocarTexto({ provedor: String(b.provedor ?? ""), modelo: String(b.modelo ?? ""), api_key: key, base_url: String(b.base_url ?? "") }, "Responda apenas com a palavra OK.");
      return { ok: true, resposta: (r.texto || "").trim().slice(0, 60) };
    } catch (e: any) {
      return { ok: false, detalhe: String(e?.message ?? e).slice(0, 160) };
    }
  });

  app.post("/admin/llm", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const b = (req.body ?? {}) as any;
    const provedor = String(b.provedor ?? "").trim();
    const modelo = String(b.modelo ?? "").trim();
    const base_url = String(b.base_url ?? "").trim();
    const papel = ["texto", "imagem"].includes(String(b.papel)) ? String(b.papel) : "texto";
    const api_key = String(b.api_key ?? "");
    if (!provedor || !modelo) return reply.code(400).send({ erro: "provedor e modelo obrigatorios" });
    let id: number;
    if (b.id) {
      if (api_key) await pool.query("UPDATE llm_provedores SET provedor=$1, modelo=$2, base_url=$3, papel=$4, api_key=$5 WHERE id=$6", [provedor, modelo, base_url, papel, api_key, Number(b.id)]);
      else await pool.query("UPDATE llm_provedores SET provedor=$1, modelo=$2, base_url=$3, papel=$4 WHERE id=$5", [provedor, modelo, base_url, papel, Number(b.id)]);
      id = Number(b.id);
    } else {
      const { rows } = await pool.query("INSERT INTO llm_provedores (provedor, modelo, api_key, base_url, papel) VALUES ($1,$2,$3,$4,$5) RETURNING id", [provedor, modelo, api_key, base_url, papel]);
      id = (rows as any[])[0].id;
    }
    // toda LLM cadastrada entra na biblioteca de precos (sempre precisamos do preco)
    await garantirPreco(modelo, provedor);
    return { ok: true, id };
  });

  app.post("/admin/llm/del", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const id = Number(((req.body ?? {}) as any).id);
    if (!id) return reply.code(400).send({ erro: "id" });
    await pool.query("DELETE FROM llm_provedores WHERE id=$1", [id]);
    return { ok: true };
  });

  app.post("/admin/llm/usar", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const id = Number(((req.body ?? {}) as any).id);
    if (!id) return reply.code(400).send({ erro: "id" });
    const { rows } = await pool.query("SELECT papel FROM llm_provedores WHERE id=$1", [id]);
    const papel = (rows as any[])[0]?.papel ?? "texto";
    await pool.query("UPDATE llm_provedores SET em_uso=false WHERE papel=$1", [papel]);
    await pool.query("UPDATE llm_provedores SET em_uso=true WHERE id=$1", [id]);
    return { ok: true };
  });

  app.post("/admin/llm/testar", async (req, reply) => {
    if (!(await admOk(req))) return reply.code(401).send({ erro: "token invalido" });
    const id = Number(((req.body ?? {}) as any).id);
    if (!id) return reply.code(400).send({ erro: "id" });
    const { rows } = await pool.query("SELECT * FROM llm_provedores WHERE id=$1", [id]);
    const p = (rows as Prov[])[0];
    if (!p) return reply.code(404).send({ erro: "nao encontrado" });
    try {
      const r = await invocarTexto(p, "Responda apenas com a palavra OK.");
      const txt = (r.texto || "").trim().slice(0, 60);
      await pool.query("UPDATE llm_provedores SET ultimo_teste=$1 WHERE id=$2", ["OK: " + txt, id]);
      return { ok: true, resposta: txt };
    } catch (e: any) {
      const det = String(e?.message ?? e).slice(0, 120);
      await pool.query("UPDATE llm_provedores SET ultimo_teste=$1 WHERE id=$2", ["ERRO: " + det, id]);
      return { ok: false, detalhe: det };
    }
  });
}
