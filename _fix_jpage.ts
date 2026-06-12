// Tira espaco vazio do modal Auto-preencher
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FP = join(__dir, "jogar_page.ts");
const FLAG = join(__dir, "_fix_jpage.r1.done");

try {
  if (existsSync(FLAG)) {
    console.log("[fix_jpage] ja aplicado, skip");
  } else {
    let s = readFileSync(FP, "utf8");
    const before = s;
    const log: any = {};

    // 4 <br> consecutivos no modal Auto-preencher viram 2
    const old = `n&atilde;o fica igual ao dos outros.<br><br><br><br><div style="background:var(--surface2);border-radius:10px;padding:10px 12px">`;
    const neu = `n&atilde;o fica igual ao dos outros.<div style="background:var(--surface2);border-radius:10px;padding:10px 12px;margin-top:12px">`;
    const occ = s.split(old).length - 1;
    log.occ = occ;
    if (occ === 1) {
      s = s.replace(old, neu);
      log.fix = "ok";
    } else {
      log.fix = "NAO_TROCOU";
    }

    // remove o <br> sobrando entre a caixa azul e o paragrafo final
    const old2 = `</div><br>Voc&ecirc; pode <b>editar at&eacute; o apito</b>`;
    const neu2 = `</div><div style="margin-top:12px">Voc&ecirc; pode <b>editar at&eacute; o apito</b>`;
    const occ2 = s.split(old2).length - 1;
    log.occ2 = occ2;
    if (occ2 === 1) {
      s = s.replace(old2, neu2);
      log.fix2 = "ok";
      // fecha a div extra
      const old3 = `Palpites que voc&ecirc; j&aacute; fez <b>nunca</b> s&atilde;o sobrescritos.</div>`;
      const neu3 = `Palpites que voc&ecirc; j&aacute; fez <b>nunca</b> s&atilde;o sobrescritos.</div></div>`;
      if (s.includes(old3)) {
        s = s.replace(old3, neu3);
        log.fix3 = "ok";
      } else {
        log.fix3 = "NAO_ACHOU";
      }
    } else {
      log.fix2 = "NAO_TROCOU";
    }

    log.changed = s !== before;
    log.ts = new Date().toISOString();

    if (s !== before) {
      writeFileSync(FP + ".prefix_fix_r1", before, "utf8");
      writeFileSync(FP, s, "utf8");
    }
    writeFileSync(FLAG, JSON.stringify(log, null, 2));
    console.log("[fix_jpage]", log);
  }
} catch (e) {
  console.error("[fix_jpage] ERRO", e);
}
