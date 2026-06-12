// Round 6: injeta loadCd JS no jogar_page.ts (anchor sem backslash)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const JP = join(__dir, "jogar_page.ts");
const FLAG = join(__dir, "_fix_clock_app2.done");

try {
  if (existsSync(FLAG)) { console.log("[fix_clock_app2] skip"); }
  else {
    let s = readFileSync(JP, "utf8");
    const before = s;
    const log: any = {};

    if (s.includes("function loadCd()")) {
      log.status = "ja_existe";
    } else {
      const anchor = `var TOKEN=localStorage.getItem("sessao");`;
      const inject = anchor + `
async function loadCd(){try{var r=await fetch(BASE+"/inicio");var d=await r.json();if(!d||!d.iso)return;var alvo=new Date(d.iso).getTime();function z(n){return("0"+n).slice(-2);}function tickCd(){var el=document.getElementById("cdminival");if(!el)return;var di=alvo-Date.now();if(di<=0){el.textContent="\\u26bd AGORA";return;}var D=Math.floor(di/86400000),H=Math.floor(di/3600000)%24,M=Math.floor(di/60000)%60,S=Math.floor(di/1000)%60;el.textContent=(D>0?(D+"d "):"")+z(H)+":"+z(M)+":"+z(S);}tickCd();setInterval(tickCd,1000);}catch(e){}}
setTimeout(loadCd,300);`;
      const occ = s.split(anchor).length - 1;
      log.occ = occ;
      if (occ === 1) {
        s = s.replace(anchor, inject);
        log.fix = "ok";
        writeFileSync(JP + ".prefix_fix_clock_app2", before, "utf8");
        writeFileSync(JP, s, "utf8");
      } else {
        log.fix = "NAO_TROCOU";
      }
    }
    log.changed = s !== before;
    log.ts = new Date().toISOString();
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_clock_app2]", log);
  }
} catch (e: any) {
  console.error("[fix_clock_app2] ERRO", e?.message || e);
}
