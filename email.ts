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
  const esc = (s: string) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const botao = (linkTxt && linkUrl)
    ? `<tr><td style="padding:8px 0 4px"><a href="${linkUrl}" style="display:inline-block;background:#1faa59;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px">${esc(linkTxt)}</a></td></tr>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#0a1228;padding:24px;font-family:Arial,Helvetica,sans-serif">
<table align="center" width="100%" style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:linear-gradient(135deg,#1faa59,#14794a);padding:20px 24px"><div style="color:#fff;font-weight:800;font-size:18px;letter-spacing:.3px">⚽ BOLÃO COPA 26</div></td></tr>
<tr><td style="padding:22px 24px;color:#1f2430">
<table width="100%"><tr><td style="font-size:18px;font-weight:800;padding-bottom:8px">${esc(titulo)}</td></tr>
<tr><td style="font-size:15px;line-height:1.55;color:#3a4151">${esc(texto).replace(/\n/g, "<br>")}</td></tr>
${botao}
</table></td></tr>
<tr><td style="padding:14px 24px;background:#f3f4f8;color:#7a8194;font-size:12px">Bolão Copa 26 · você recebeu este e-mail porque participa do bolão.</td></tr>
</table></body></html>`;
}
