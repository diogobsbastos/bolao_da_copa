// ===== Motor de e-mail (Beta 1.0) — envia pelo Gmail via SMTP sobre TLS (porta 465) =====
// SEM dependencia externa: usa node:tls puro. Credenciais em config (gmail_user / gmail_app_pass).
// Usado por: recuperacao de senha, confirmacao de cadastro, canal 'email' das Notificacoes.
import tls from "node:tls";
import { pool } from "./db.js";

async function cfg(k: string): Promise<string> {
  try { const { rows } = await pool.query("SELECT valor FROM config WHERE chave=$1", [k]); return (rows as any[])[0]?.valor ?? ""; } catch { return ""; }
}

export async function emailConfigurado(): Promise<boolean> {
  return !!((await cfg("gmail_user")) && (await cfg("gmail_app_pass")));
}

function b64(s: string): string { return Buffer.from(s, "utf8").toString("base64"); }
function encHeader(s: string): string { return "=?UTF-8?B?" + b64(String(s || "")) + "?="; }

function montarMensagem(from: string, fromNome: string, to: string, assunto: string, html: string): string {
  const lines = [
    "From: " + encHeader(fromNome) + " <" + from + ">",
    "To: <" + to + ">",
    "Subject: " + encHeader(assunto),
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64(html).replace(/(.{76})/g, "$1\r\n"),
  ];
  return lines.join("\r\n");
}

// Envia 1 e-mail. Resolve {ok} ou {ok:false, erro}. Nunca lanca.
export function enviarEmail(to: string, assunto: string, html: string): Promise<{ ok: boolean; erro?: string }> {
  return new Promise(async (resolve) => {
    let user = "", pass = "";
    try { user = await cfg("gmail_user"); pass = (await cfg("gmail_app_pass")).replace(/\s+/g, ""); } catch {}
    if (!user || !pass) return resolve({ ok: false, erro: "gmail nao configurado" });

    const stages = [
      { expect: "220", cmd: "EHLO bolaocopa26\r\n" },
      { expect: "250", cmd: "AUTH LOGIN\r\n" },
      { expect: "334", cmd: b64(user) + "\r\n" },
      { expect: "334", cmd: b64(pass) + "\r\n" },
      { expect: "235", cmd: "MAIL FROM:<" + user + ">\r\n" },
      { expect: "250", cmd: "RCPT TO:<" + to + ">\r\n" },
      { expect: "250", cmd: "DATA\r\n" },
      { expect: "354", cmd: montarMensagem(user, "Bolão Copa 26", to, assunto, html).replace(/\r\n\./g, "\r\n..") + "\r\n.\r\n" },
      { expect: "250", cmd: null as any }, // mensagem aceita -> sucesso
    ];
    let i = 0, buf = "", done = false;
    const sock = tls.connect(465, "smtp.gmail.com", { servername: "smtp.gmail.com" });
    const fim = (ok: boolean, erro?: string) => { if (done) return; done = true; try { sock.write("QUIT\r\n"); } catch {} try { sock.end(); sock.destroy(); } catch {} resolve(erro ? { ok, erro } : { ok }); };
    sock.setEncoding("utf8");
    sock.setTimeout(20000, () => fim(false, "timeout (porta 465 pode estar bloqueada na VPS)"));
    sock.on("error", (e: any) => fim(false, "conexao: " + String(e?.code || e?.message || e)));
    sock.on("data", (d: string) => {
      buf += d;
      const linhas = buf.split("\r\n").filter(Boolean);
      const ultima = linhas[linhas.length - 1] || "";
      if (!/^\d{3} /.test(ultima)) return; // aguarda linha final (codigo seguido de espaco)
      const code = ultima.slice(0, 3); buf = "";
      const st = stages[i];
      if (code !== st.expect) return fim(false, "SMTP " + code + ": " + ultima.slice(4, 120));
      if (st.cmd === null) return fim(true); // ultimo estagio (250 apos DATA)
      try { sock.write(st.cmd); } catch (e: any) { return fim(false, "write: " + String(e?.message || e)); }
      i++;
    });
  });
}

// monta um HTML simples e bonitinho a partir de titulo + texto
export function htmlEmail(titulo: string, texto: string, linkTxt?: string, linkUrl?: string): string {
  const esc = (x: string) => String(x || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const botao = (linkTxt && linkUrl)
    ? `<tr><td style="padding:10px 0 2px"><a href="${linkUrl}" style="display:inline-block;background:#1faa59;color:#fff;text-decoration:none;font-weight:800;padding:13px 26px;border-radius:12px;font-size:15px">${esc(linkTxt)}</a></td></tr>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#0a1228;padding:22px 12px;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" align="center" width="100%" style="max-width:540px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.4)">
<tr><td style="background:linear-gradient(135deg,#1faa59,#0f7a45);padding:16px 22px"><span style="color:#fff;font-weight:900;font-size:18px;letter-spacing:.4px">&#9917; BOL&Atilde;O <span style="color:#ffe07a">COPA 26</span></span></td></tr>
<tr><td style="padding:24px 24px 8px;color:#1f2430">
<table role="presentation" width="100%"><tr><td style="font-size:20px;font-weight:800;padding-bottom:10px;color:#0f7a45">${esc(titulo)}</td></tr>
<tr><td style="font-size:15px;line-height:1.6;color:#3a4151">${esc(texto).replace(/\n/g, "<br>")}</td></tr>
${botao}
</table></td></tr>
<tr><td style="padding:16px 24px;background:#f3f4f8;color:#7a8194;font-size:12px;line-height:1.5">Bol&atilde;o Copa 26 &middot; voc&ecirc; recebeu este e-mail porque participa do bol&atilde;o.</td></tr>
</table></body></html>`;
}

// E-mail rico de lancamento/atualizacao (hero + pote + regras + auto-preenchimento + roadmap + assinatura)
export function htmlLancamento(base: string, pote: number, regra: any, pacotes: any): string {
  const og = base + "/og-square.jpg";
  const app = base + "/";
  const brl = (n: number) => "R$ " + Number(n || 0).toLocaleString("pt-BR");
  const sec = (icone: string, titulo: string, corpo: string) =>
    `<tr><td style="padding:14px 0 4px"><table role="presentation" width="100%"><tr>
      <td valign="top" style="width:34px;font-size:22px;line-height:1">${icone}</td>
      <td style="color:#1f2430"><div style="font-weight:800;font-size:16px;margin-bottom:3px">${titulo}</div>
      <div style="font-size:14px;line-height:1.6;color:#3a4151">${corpo}</div></td>
    </tr></table></td></tr>`;
  const regras = `Placar <b>exato</b> = <b>${regra.exato}</b> pts &middot; acertou o <b>vencedor + saldo de gols</b> = <b>${regra.vencedor_saldo}</b> &middot; só o <b>vencedor</b> = <b>${regra.vencedor}</b> &middot; acertou os <b>gols de um time</b> = <b>${regra.gol_time}</b>.<br>E o melhor: <b>cada ponto vira token</b> tamb&eacute;m. Errar n&atilde;o tira nada &mdash; <b>risco zero</b>.`;
  return `<!doctype html><html><body style="margin:0;background:#0a1228;padding:20px 10px;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" align="center" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 22px 64px rgba(0,0,0,.45)">
<tr><td style="background:linear-gradient(135deg,#1faa59,#0f7a45);padding:14px 20px">
  <span style="color:#fff;font-weight:900;font-size:17px;letter-spacing:.4px">&#9917; BOL&Atilde;O <span style="color:#ffe07a">COPA 26</span></span>
</td></tr>
<tr><td style="padding:0"><img src="${og}" alt="Bol&atilde;o Copa 26" width="560" style="width:100%;max-width:560px;display:block"></td></tr>
<tr><td style="padding:22px 24px 6px;color:#1f2430">
  <div style="font-size:23px;font-weight:900;line-height:1.2;color:#0a1228">A Copa come&ccedil;ou &mdash; e o Bol&atilde;o est&aacute; <span style="color:#1faa59">VALENDO!</span></div>
  <div style="font-size:15px;line-height:1.6;color:#3a4151;margin-top:8px">Os jogos j&aacute; pontuam. Bora garantir seus palpites e subir no ranking. Te explico tudo, rapidinho:</div>
</td></tr>
<tr><td style="padding:14px 24px 0">
  <table role="presentation" width="100%" style="background:linear-gradient(135deg,#fff4cc,#ffe07a);border-radius:14px"><tr><td style="padding:16px 18px;text-align:center">
    <div style="font-size:12px;font-weight:800;letter-spacing:1px;color:#8a5e12">POTE EM DINHEIRO AGORA</div>
    <div style="font-size:34px;font-weight:900;color:#0a1228;line-height:1.1;margin:2px 0">${brl(pote)}</div>
    <div style="font-size:13px;color:#6b4e0e;font-weight:600">Top 3 do ranking dividem: <b>50% / 30% / 20%</b> &middot; e o pote s&oacute; cresce!</div>
  </td></tr></table>
</td></tr>
<tr><td style="padding:6px 24px 4px">
  ${sec("&#127919;", "Como funciona", regras)}
  ${sec("&#129302;", "Esqueceu de palpitar? A gente te cobre", "Se voc&ecirc; n&atilde;o preencher um jogo at&eacute; o apito, nosso <b>rob&ocirc; preenche automaticamente por voc&ecirc;</b> (pela l&oacute;gica das odds e do ranking). Voc&ecirc; <b>nunca fica zerado</b> &mdash; mas palpite voc&ecirc; mesmo pra mandar no que acredita!")}
  ${sec("&#128302;", "Vem muito mais por a&iacute; (roadmap)", "&#127183; <b>Novos pacotes de figurinhas colecion&aacute;veis</b> chegando.<br>&#127937; No <b>fim da 1&ordf; rodada</b>: lan&ccedil;amento da <b>Batalha de Times</b> (PvP) &mdash; que passa a <b>valer ponto no ranking</b>!")}
</td></tr>
<tr><td style="padding:14px 24px 4px;text-align:center">
  <a href="${app}" style="display:inline-block;background:#1faa59;color:#fff;text-decoration:none;font-weight:900;padding:15px 34px;border-radius:12px;font-size:16px">&#9917; CRAVAR MEUS PALPITES</a>
</td></tr>
<tr><td style="padding:18px 24px 6px;color:#1f2430">
  <div style="font-size:14px;color:#3a4151;line-height:1.6">Qualquer d&uacute;vida, &eacute; s&oacute; responder este e-mail. Bom jogo e boa sorte! &#127463;&#127479;</div>
  <div style="margin-top:14px;padding-top:12px;border-top:1px solid #e6e8f0;font-size:14px;color:#1f2430">ATT,<br><b>Diogo Brand&atilde;o</b> &mdash; Vipworks</div>
</td></tr>
<tr><td style="padding:14px 24px;background:#f3f4f8;color:#7a8194;font-size:12px;line-height:1.5">Bol&atilde;o Copa 26 &middot; voc&ecirc; recebeu este e-mail porque participa do bol&atilde;o.</td></tr>
</table></body></html>`;
}
