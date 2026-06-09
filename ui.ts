// Menu lateral unico e responsivo (fonte de verdade da navegacao do admin).
// Telas novas usam { NAV_CSS, sideHtml, NAV_JS }.
// Telas legadas/grandes (ex.: figurinhas) usam injetarMenu(html, active) via hook do servidor.

const ITENS: Array<[string, string, string]> = [
  ["dash", "&#128202; Dashboard", "/admin"],
  ["config", "&#9881;&#65039; Configuracoes", "/admin/config-hub"],
  ["tokenomics", "&#128176; Tokenomics", "/admin/tokenomics"],
  ["jogos", "&#9917; Jogos / Placar", "/admin/jogos-placar"],
  ["classif", "&#127942; Classificacao", "/admin/classificacao"],
  ["figs", "&#128203; Elencos / Figurinhas", "/admin/figurinhas"],
  ["criador", "&#127912; Criador de Figurinhas", "/admin/criador-fig"],
  ["cartas", "&#127981; Fabrica (nome/posicao)", "/admin/cartas"],
  ["users", "&#128100; Usuarios &amp; Carteiras", "/admin?pg=users"],
  ["rank", "&#127942; Ranking", "/admin?pg=rank"],
  ["integ", "&#128268; Integracoes / Crons", "/admin?pg=integ"],
];

// ---------- Variante para telas novas (dentro de um .app flex) ----------
export const NAV_CSS = `
.side{width:236px;background:var(--card);border-right:1px solid var(--bd);padding:18px 12px;position:sticky;top:0;height:100vh;flex-shrink:0;z-index:50;transition:transform .25s ease}
.brand{font-weight:800;font-size:17px;padding:6px 10px 16px}
.nav a{display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:10px;color:var(--mut);text-decoration:none;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:2px}
.nav a:hover{background:#eef1fb;color:var(--tx)}
.nav a.on{background:var(--pri);color:#fff}
.hamb{display:none;position:fixed;top:11px;left:11px;z-index:60;background:var(--card);border:1px solid var(--bd);border-radius:10px;width:40px;height:40px;font-size:18px;line-height:1;cursor:pointer;color:var(--tx);font-weight:700}
.ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:45}
@media(max-width:900px){
 .side{position:fixed;left:0;top:0;transform:translateX(-100%);box-shadow:2px 0 18px rgba(0,0,0,.18)}
 .side.open{transform:none}
 .hamb{display:block}
 .ov.show{display:block}
 .top{padding-left:62px!important}
}`;

export function sideHtml(active: string): string {
  const links = ITENS.map(([k, label, href]) => `<a class="${k === active ? "on" : ""}" onclick="go('${href}')">${label}</a>`).join("\n   ");
  return `<button class="hamb" onclick="toggleMenu()">&#9776;</button>
<div class="ov" onclick="toggleMenu()"></div>
<aside class="side">
  <div class="brand">&#9917; Bolao Copa 26</div>
  <nav class="nav">
   ${links}
  </nav>
</aside>`;
}

export const NAV_JS = `
function _b(){var p=location.pathname;var i=p.indexOf('/admin');return i>=0?p.substring(0,i):p;}
function go(p){location.href=_b()+p;}
function toggleMenu(){var s=document.querySelector('.side');var o=document.querySelector('.ov');if(!s)return;var on=s.classList.toggle('open');if(o)o.classList.toggle('show',on);}
`;

// ---------- Injetor para telas legadas (classes proprias .mnu-* para nao colidir) ----------
const MNU_CSS = `
.mnu-main{margin-left:236px}
.mnu-side{position:fixed;left:0;top:0;width:236px;height:100vh;overflow:auto;background:#fff;border-right:1px solid #e6e8f0;padding:18px 12px;z-index:50;transition:transform .25s ease}
.mnu-brand{font-weight:800;font-size:17px;padding:6px 10px 16px;color:#1f2430}
.mnu-side a{display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:10px;color:#7a8194;text-decoration:none;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:2px}
.mnu-side a:hover{background:#eef1fb;color:#1f2430}
.mnu-side a.on{background:#4361ee;color:#fff}
.mnu-hamb{display:none;position:fixed;top:11px;left:11px;z-index:60;background:#fff;border:1px solid #e6e8f0;border-radius:10px;width:40px;height:40px;font-size:18px;line-height:1;cursor:pointer;color:#1f2430;font-weight:700}
.mnu-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:45}
@media(max-width:900px){
 .mnu-main{margin-left:0}
 .mnu-side{transform:translateX(-100%);box-shadow:2px 0 18px rgba(0,0,0,.18)}
 .mnu-side.open{transform:none}
 .mnu-hamb{display:block}
 .mnu-ov.show{display:block}
}`;

function mnuHtml(active: string): string {
  const links = ITENS.map(([k, label, href]) => `<a class="${k === active ? "on" : ""}" onclick="mnuGo('${href}')">${label}</a>`).join("");
  return `<button class="mnu-hamb" onclick="mnuToggle()">&#9776;</button><div class="mnu-ov" onclick="mnuToggle()"></div><aside class="mnu-side"><div class="mnu-brand">&#9917; Bolao Copa 26</div><nav>${links}</nav></aside>`;
}

const MNU_JS = `<script>
function mnuB(){var p=location.pathname;var i=p.indexOf('/admin');return i>=0?p.substring(0,i):p;}
function mnuGo(p){location.href=mnuB()+p;}
function mnuToggle(){var s=document.querySelector('.mnu-side');var o=document.querySelector('.mnu-ov');if(!s)return;var on=s.classList.toggle('open');if(o)o.classList.toggle('show',on);}
</script>`;

export function injetarMenu(html: string, active: string): string {
  if (typeof html !== "string" || html.indexOf("</head>") < 0 || html.indexOf("mnu-side") >= 0) return html;
  return html
    .replace("</head>", `<style>${MNU_CSS}</style></head>`)
    .replace(/(<body[^>]*>)/i, `$1${mnuHtml(active)}<div class="mnu-main">`)
    .replace(/<\/body>/i, `</div>${MNU_JS}</body>`);
}
