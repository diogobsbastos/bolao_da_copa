// Mobile UX Bloco D — patcha head de jogar_page.ts e landing.ts + SW_JS em notificacoes.ts.
// Idempotente via flag .done.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FLAG = join(__dir, "_fix_pwa.done");

const HEAD_TAGS =
  '<link rel="manifest" href="/bolao-copa26/manifest.json">' +
  '<meta name="theme-color" content="#1faa59">' +
  '<meta name="apple-mobile-web-app-capable" content="yes">' +
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">' +
  '<meta name="apple-mobile-web-app-title" content="Bolão 26">' +
  '<link rel="apple-touch-icon" href="/bolao-copa26/icon-512.jpg">';

// Marcador unico no head pra checar se ja patchado e nao duplicar
const MARKER = 'rel="manifest" href="/bolao-copa26/manifest.json"';

// Anchor seguro pra inserir: depois do <meta name="viewport" ... >
// Em ambos arquivos esse meta aparece UMA vez na pagina principal.
const VP_RE = /<meta\s+name="viewport"\s+content="[^"]*">/;

// SW: append fetch handler pass-through (necessario pro Chrome aceitar como instalavel)
const SW_ANCHOR = 'return self.clients.openWindow(url);}));});`;';
const SW_APPEND = 'return self.clients.openWindow(url);}));});\nself.addEventListener("fetch",function(){});`;';

function patchHead(path: string, label: string, log: any) {
  if (!existsSync(path)) { log[label] = "arquivo nao existe, skip"; return; }
  const s = readFileSync(path, "utf8");
  if (s.indexOf(MARKER) !== -1) { log[label] = "ja tem manifest, skip"; return; }
  const m = s.match(VP_RE);
  if (!m) { log[label] = "viewport meta nao encontrado, skip"; return; }
  const vp = m[0];
  const occ = s.split(vp).length - 1;
  if (occ !== 1) { log[label] = "viewport ocorre " + occ + "x (esperado 1), skip"; return; }
  const novo = s.replace(vp, vp + HEAD_TAGS);
  writeFileSync(path + ".prefix_fix_pwa", s, "utf8");
  writeFileSync(path, novo, "utf8");
  log[label] = { aplicado: true, delta: novo.length - s.length };
}

try {
  if (existsSync(FLAG)) {
    console.log("[fix_pwa] ja aplicado, skip");
  } else {
    const log: any = {};

    // 1) Head do jogar_page.ts
    patchHead(join(__dir, "jogar_page.ts"), "jogar_page", log);
    // 2) Head do landing.ts
    patchHead(join(__dir, "landing.ts"), "landing", log);

    // 3) SW_JS em notificacoes.ts — adiciona fetch handler
    try {
      const NP = join(__dir, "notificacoes.ts");
      const n = readFileSync(NP, "utf8");
      if (n.indexOf('addEventListener("fetch"') !== -1) {
        log.sw = "ja tem fetch handler, skip";
      } else {
        const occ = n.split(SW_ANCHOR).length - 1;
        if (occ === 1) {
          const novo = n.replace(SW_ANCHOR, SW_APPEND);
          writeFileSync(NP + ".prefix_fix_pwa", n, "utf8");
          writeFileSync(NP, novo, "utf8");
          log.sw = { aplicado: true, delta: novo.length - n.length };
        } else {
          log.sw = "SW_ANCHOR ocorre " + occ + "x, skip";
        }
      }
    } catch (e: any) { log.sw = "ERRO: " + String(e?.message); }

    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_pwa]", log);
  }
} catch (e) {
  console.error("[fix_pwa] ERRO", e);
}
