// Polish mobile v2 (12/jun) — pedidos especificos do dono na aba Bolao:
// 1) Descricao do "Palpite da Rodada" em 2 linhas (line-clamp em .pgsub)
// 2) Aba PROGRESSO centralizada (.pgsteps/.steprow com justify-content:center)
// 3) Palpite IA collapsed por default em mobile (JS injetado fecha 1x apos render)
// 4) Quando IA abre: cada item numa linha (column layout dentro de #autobar.actpanel)
// 5) Esconder svg de fechadura no .tag.lk dos cards de jogo
// 6) Esconder svg de relogio nos demais .tag do topo dos cards (.cm.cmtop)
// Idempotente via flag .done. Patcha jogar_style.ts (CSS) E jogar_page.ts (script).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FLAG = join(__dir, "_fix_mobile_polish_v2.done");

const CSS_INSERT =
  "\n/* --- MOBILE POLISH v2 (12/jun): Bolao polish — desc 2 linhas, progresso centro, IA layout coluna, esconder svg de cm.cmtop --- */\n" +
  "@media(max-width:600px){\n" +
  " /* 1) Descricao do Bolao em 2 linhas */\n" +
  " .pghead .pgsub,.pghl .pgsub{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.35}\n" +
  " /* 2) Aba Progresso centralizada */\n" +
  " .pgsteps,.pgsteps-inner{justify-content:center;margin-left:auto;margin-right:auto;width:100%}\n" +
  " .pgsteps-inner .steprow,.pgsteps-inner .stephead{justify-content:center;margin-left:auto;margin-right:auto}\n" +
  " /* 4) Palpite IA aberto: cada item numa linha */\n" +
  " #autobar.actpanel{flex-direction:column!important;align-items:stretch!important;gap:8px!important;padding:10px!important}\n" +
  " #autobar.actpanel>*{flex:1 1 100%!important;width:100%;max-width:100%;min-width:0}\n" +
  " #autobar.actpanel .act-ia,#autobar.actpanel .act-logic{flex-direction:column;align-items:stretch;width:100%;gap:6px}\n" +
  " #autobar.actpanel .act-ia>*,#autobar.actpanel .act-logic>*{flex:1 1 100%!important;width:100%!important;max-width:100%}\n" +
  " #autobar.actpanel button{width:100%;max-width:100%;white-space:normal;text-align:center;padding:10px 12px;font-size:13px}\n" +
  " #autobar.actpanel .masc{margin:0 auto;align-self:center}\n" +
  " #autobar.actpanel .bubble{width:100%;max-width:100%;white-space:normal}\n" +
  " /* 5+6) Esconder svg de fechadura/relogio no topo dos cards de jogo */\n" +
  " .cm.cmtop svg{display:none}\n" +
  " .cm.cmtop .tag{padding:2px 8px;gap:0}\n" +
  " .cm.cmtop .tag.lk{padding:2px 8px}\n" +
  "}\n";

const SCRIPT_INSERT =
  '<script>(function(){if(window.innerWidth>600)return;var closed=false;' +
  'function tryClose(){if(closed)return;var a=document.querySelector("#autobar.actpanel");' +
  'if(!a)return;var cs=window.getComputedStyle(a);if(cs.display==="none")return;' +
  'var x=a.querySelector(".actcol");if(x){x.click();}else{a.style.display="none";}closed=true;}' +
  'var t=setInterval(tryClose,500);setTimeout(function(){clearInterval(t);},15000);})();</script>';

try {
  if (existsSync(FLAG)) {
    console.log("[fix_mobile_polish_v2] ja aplicado, skip");
  } else {
    const log: any = {};

    // 1) CSS em jogar_style.ts (anchor: fim do template literal)
    try {
      const LP = join(__dir, "jogar_style.ts");
      const s = readFileSync(LP, "utf8");
      const anchor = ".ob-emoji{font-size:46px}}\n`;";
      const occ = s.split(anchor).length - 1;
      log.css_anchor_occ = occ;
      if (occ === 1) {
        const novo = s.replace(anchor, CSS_INSERT + anchor);
        writeFileSync(LP + ".prefix_fix_polish_v2", s, "utf8");
        writeFileSync(LP, novo, "utf8");
        log.css = { aplicado: true, delta: novo.length - s.length };
      } else { log.css = "anchor !== 1, skip"; }
    } catch (e: any) { log.css = "ERRO: " + String(e?.message); }

    // 2) Script em jogar_page.ts (anchor: o link rel=manifest injetado no Bloco D)
    try {
      const JP = join(__dir, "jogar_page.ts");
      const s = readFileSync(JP, "utf8");
      const anchor = '<link rel="manifest" href="/bolao-copa26/manifest.json">';
      const occ = s.split(anchor).length - 1;
      log.script_anchor_occ = occ;
      if (s.indexOf("[mobile-polish-v2-script]") !== -1) {
        log.script = "ja injetado, skip";
      } else if (occ === 1) {
        // Marker pra idempotencia
        const inject = '<!-- [mobile-polish-v2-script] -->' + SCRIPT_INSERT;
        const novo = s.replace(anchor, anchor + inject);
        writeFileSync(JP + ".prefix_fix_polish_v2", s, "utf8");
        writeFileSync(JP, novo, "utf8");
        log.script = { aplicado: true, delta: novo.length - s.length };
      } else { log.script = "anchor !== 1, skip (manifest link nao encontrado)"; }
    } catch (e: any) { log.script = "ERRO: " + String(e?.message); }

    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_mobile_polish_v2]", log);
  }
} catch (e) {
  console.error("[fix_mobile_polish_v2] ERRO", e);
}
