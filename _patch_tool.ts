import { readFile, writeFile, unlink } from "node:fs/promises";

// Ferramenta TEMPORARIA: liga NewsData.io.
// _patch_cmd.txt = "go" dispara no boot; resultado em _patch_out.json. Remover depois.
const RAIZ = "/home/ubuntu/bolao-copa26";
const FPAGE = RAIZ + "/config_hub_page.ts";
const FADMIN = RAIZ + "/admin.ts";
const FJOGOS = RAIZ + "/jogos_placar.ts";
const CMD = RAIZ + "/_patch_cmd.txt";
const OUT = RAIZ + "/_patch_out.json";

const SITE = "style=\"text-decoration:none;background:#eef1fb;color:#4361ee;padding:7px 12px;border-radius:9px;font-size:12px;font-weight:700;white-space:nowrap;align-self:flex-start\"";

const CARD_NEWS = `<div class="card"><div class="cardhead"><div><h3>&#128240; Noticias das selecoes &mdash; NewsData.io <span class="pill local">a configurar</span></h3>
      <div class="sub">Manchetes recentes de cada selecao (lesao, fase, escalacao provavel) que entram no palpite da IA. Plano free 200/dia, suporta PT.</div></div>
      <a ${SITE} href="https://newsdata.io/register" target="_blank">Criar chave gratis &#8599;</a></div>
     <label>API Key</label><input id="newsdata_api_key" placeholder="(em branco mantem)">
     <div class="save"><button class="sm" onclick="salvar(['newsdata_api_key'])">Salvar</button></div></div>
    `;

const MARK_ODDS = '<div class="card"><div class="cardhead"><div><h3>&#128176; Odds &mdash; The-Odds-API';

const NEWS_HELPER = `
// ===== NOTICIAS (NewsData.io) — entram no prompt do palpite =====
const CACHE_NEWS = new Map<string, { t: number; linhas: string[] }>();
async function noticiasTime(nomePT: string, en: string): Promise<string[]> {
  const key = await getCfg("newsdata_api_key");
  if (!key) return [];
  const c = CACHE_NEWS.get(en);
  if (c && Date.now() - c.t < 12 * 3600 * 1000) return c.linhas;
  try {
    const url = "https://newsdata.io/api/1/latest?apikey=" + encodeURIComponent(key) + "&language=pt&q=" + encodeURIComponent(nomePT + " futebol selecao");
    const r = await fetch(url);
    const j: any = await r.json().catch(() => ({}));
    const arr: any[] = Array.isArray(j?.results) ? j.results : [];
    const linhas = arr.slice(0, 4).map((a) => String(a?.title || "").trim()).filter(Boolean);
    CACHE_NEWS.set(en, { t: Date.now(), linhas });
    return linhas;
  } catch { return []; }
}
`;

const JITTER_ANCHOR = `function jitter(pc: number, pv: number): [number, number] {
  const r = Math.random(); let a = pc, b = pv;
  if (r < 0.55) return [a, b];
  if (r < 0.8) a = Math.max(0, a + (Math.random() < 0.5 ? 1 : -1));
  else b = Math.max(0, b + (Math.random() < 0.5 ? 1 : -1));
  return [a, b];
}`;

const PROMPT_ANCHOR = '          const prompt = "Voce e um analista de futebol.';
const PROMPT_INJECT = `          const nc = await noticiasTime(cP, j.selecao_casa), nv = await noticiasTime(vP, j.selecao_visitante);
          const ctxNews = (nc.length || nv.length) ? (" Noticias recentes -> " + cP + ": " + (nc.join(" | ") || "sem destaque") + ". " + vP + ": " + (nv.join(" | ") || "sem destaque") + ".") : "";
          const prompt = "Voce e um analista de futebol.`;

export async function runPatch(): Promise<void> {
  let go = ""; try { go = (await readFile(CMD, "utf-8")).trim(); } catch { return; }
  if (go !== "go") return;
  const res: string[] = [];
  const log = (o: any) => writeFile(OUT, JSON.stringify(o, null, 2)).catch(() => {});
  try {
    // 1) card NewsData no Configuracoes
    let s = await readFile(FPAGE, "utf-8");
    if (s.indexOf("newsdata_api_key") >= 0) res.push("page:skip");
    else if (s.indexOf(MARK_ODDS) >= 0) { s = s.replace(MARK_ODDS, CARD_NEWS + MARK_ODDS); await writeFile(FPAGE, s); res.push("page:ok"); }
    else res.push("page:NAO(sem marcador odds)");

    // 2) chave no admin.ts
    let ad = await readFile(FADMIN, "utf-8");
    if (ad.indexOf("newsdata_api_key") >= 0) res.push("admin:skip");
    else {
      ad = ad.replace('"api_futebol_token"]);', '"api_futebol_token", "newsdata_api_key"]);');
      ad = ad.replace('"api_futebol_token", "llm_base"', '"api_futebol_token", "newsdata_api_key", "llm_base"');
      await writeFile(FADMIN, ad); res.push("admin:ok");
    }

    // 3) plugar noticias no gerador de palpites
    let jg = await readFile(FJOGOS, "utf-8");
    let mexeu = false;
    if (jg.indexOf("noticiasTime") < 0 && jg.indexOf(JITTER_ANCHOR) >= 0) {
      jg = jg.replace(JITTER_ANCHOR, JITTER_ANCHOR + "\n" + NEWS_HELPER); mexeu = true; res.push("jogos:helper:ok");
    } else res.push("jogos:helper:skip");
    if (jg.indexOf("const ctxNews") < 0 && jg.indexOf(PROMPT_ANCHOR) >= 0) {
      jg = jg.replace(PROMPT_ANCHOR, PROMPT_INJECT); mexeu = true; res.push("jogos:inject:ok");
    } else res.push("jogos:inject:skip");
    if (jg.indexOf('"). Preveja o placar mais provavel considerando a forca das selecoes. "') >= 0) {
      jg = jg.replace('"). Preveja o placar mais provavel considerando a forca das selecoes. "', '")." + ctxNews + " Considerando a forca (ranking) e as noticias (lesoes, fase, escalacao), preveja o placar mais provavel. "');
      mexeu = true; res.push("jogos:prompt:ok");
    } else res.push("jogos:prompt:skip");
    if (jg.indexOf('"confianca":0a100') >= 0) { jg = jg.replace('"confianca":0a100', '"confianca":70'); mexeu = true; res.push("jogos:conf:ok"); }
    else res.push("jogos:conf:skip");
    if (mexeu) await writeFile(FJOGOS, jg);

    await log({ ok: true, res });
  } catch (e: any) { await log({ ok: false, erro: String(e?.message ?? e), res }); }
  try { await unlink(CMD); } catch {}
}
