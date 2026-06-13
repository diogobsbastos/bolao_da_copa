# SPEC — Ajustes Mobile + Sistema de Login Completo
> Criado 13/jun/2026 (madrugada). Sucessor de `PLANO_MOBILE_UX.md` (que cobriu A/B/C/D + polish v1-v10).
> Princípio: execução em 2 blocos, cada bloco em **1 mensagem do dono → 1 edit → 1 commit**.

---

## ESTRATÉGIA DE EXECUÇÃO (custo)

| Bloco | Arquivos tocados | Tool calls aprox | Tokens estimados |
|---|---|---|---|
| 1. CSS Polish (6 telas) | `_fix_polish_running.ts` (edit) | 4 (escrever + 2x restart + commit) | ~3k |
| 2. Sistema de Login | `auth_extras.ts` (novo) + 1 linha em `server.ts` + SQL DDL | 7 (sql + write + edit + 2x restart + commit + verify) | ~6k |
| **TOTAL** | | **~11** | **~9k** |

Comparação: padrão antigo iterativo (1 fix por vez) custaria ~50-80k.

---

## BLOCO 1 — CSS POLISH (6 problemas, 1 patch)

> Tudo dentro do CSS_BLOCK do `_fix_polish_running.ts`. Nova VERSION = `2026-06-13-02`. Mobile only (`@media(max-width:600px)`).

### 1.1 Marketplace — vazamento + info empilhada
**Decisão:** layout 1 produto por linha. Imagem esquerda 90px, info direita flex.
```css
.market-grid,[class*=mgrid],[class*=market-list]{grid-template-columns:1fr!important;display:grid!important;gap:10px!important}
.pack,[class*=pack-card],[class*=card-pack]{display:grid!important;grid-template-columns:88px 1fr!important;gap:10px!important;width:100%!important;max-width:100%!important;min-width:0!important;padding:10px!important}
.pack img,.pack .pkimg,.pack [class*=img]{width:88px!important;max-width:88px!important;height:auto!important;object-fit:contain}
.pack .info,.pack .desc,.pack [class*=desc]{min-width:0!important;font-size:12px!important;line-height:1.3!important}
.pack h3,.pack [class*=title]{font-size:14px!important;margin:0 0 4px!important}
.pack .em-breve,.pack [class*=badge],.pack .pksoon{font-size:10px!important;padding:3px 8px!important}
.pack [class*=tag],.pack .pillchip{font-size:9px!important;padding:2px 5px!important}
```
**Classes incertas:** confirmar `.pack` vs `.pack-card` vs outro no momento da edição (1 fetch HTML).

### 1.2 Conectar IA — caixa "IA conectada" empilhada
**Decisão:** sobe pra topo, fora do grid de provedores.
```css
.ia-conectada,.iaconectada,[class*=ia-conec]{order:-1!important;margin:0 0 12px!important;width:100%!important}
.ia-config,.iaconfig{display:flex!important;flex-direction:column!important;gap:10px!important}
```

### 1.3 Conectar IA — clique no provedor sem feedback (área de chave embaixo)
**Decisão:** JS injeta `scrollIntoView` no campo de chave quando provedor é clicado.
```js
document.addEventListener('click',function(e){
  var p=e.target.closest('[class*=provedor],[class*=ia-card],.ia-prov');
  if(!p)return;
  setTimeout(function(){
    var k=document.querySelector('input[name=apikey],input[type=password],[class*=apikey]');
    if(k)k.scrollIntoView({behavior:'smooth',block:'center'});
    if(k)k.focus();
  },200);
},true);
```
*(Alternativa popup modal: adiar — mais complexo.)*

### 1.4 Meu Time — chip "4-4-2" redundante na esquerda
**Decisão:** esconder chip 4-4-2 da linha esquerda inferior + centralizar restantes.
```css
.tmleft .tmbadge:nth-child(1),[class*=tmleft] [class*=formacao]{display:none!important}
.tmleft,[class*=tmleft]{align-items:center!important;justify-content:center!important}
```
**Classes incertas:** confirmar como o "4-4-2" tá marcado (1 inspect).

### 1.5 Copa do Mundo — tabs vazando
**Decisão:** encurtar texto + reduzir padding (mais simples que 3 pontinhos).
```css
#copa-tabs .tab,.copa-tabs .tab{font-size:11px!important;padding:6px 9px!important;letter-spacing:-.2px!important}
```
JS pra encurtar texto:
```js
document.querySelectorAll('#copa-tabs .tab, .copa-tabs .tab').forEach(function(t){
  var s=(t.textContent||'').trim();
  if(s==='Eliminatórias')t.textContent='Mata-Mata';
  if(s==='Artilheiros')t.textContent='Artilheiro';
});
```

### 1.6 Login screen — tarja amarela empurrando logo
**Decisão:** tarja "Beta 1.0" inline à direita da logo.
```css
.brand-wrap,.logo-wrap,[class*=brand]{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;gap:10px!important;flex-wrap:wrap}
.beta-tag,.tarja-beta,[class*=beta]{display:inline-flex!important;font-size:10px!important;padding:2px 6px!important;border-radius:4px}
.blogo,.logo img,[class*=logo] img{max-height:64px!important;width:auto!important}
.login-card,.login-form,[class*=login]{width:100%!important;max-width:340px!important;margin:0 auto!important}
```
**Classes incertas:** confirmar `.brand-wrap` ou outro nome.

---

## BLOCO 2 — SISTEMA DE LOGIN (confirmação email + reset senha)

> Novo arquivo `auth_extras.ts` (não tocar em `auth.ts` que é grande). Registra 1 linha em `server.ts`. SQL DDL via `sql_local`.

### 2.1 Schema SQL
```sql
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_confirmado BOOLEAN DEFAULT false;
CREATE TABLE IF NOT EXISTS email_confirmacoes (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT now(),
  confirmado_em TIMESTAMPTZ,
  expira_em TIMESTAMPTZ DEFAULT (now() + interval '48 hours')
);
CREATE INDEX IF NOT EXISTS idx_email_conf_token ON email_confirmacoes(token);
CREATE TABLE IF NOT EXISTS senha_reset (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT now(),
  expira_em TIMESTAMPTZ DEFAULT (now() + interval '1 hour'),
  usado_em TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_senha_reset_token ON senha_reset(token);
```

### 2.2 Rotas (em `auth_extras.ts`)

**Confirmação de email:**
- `POST /auth/email/reenviar` body `{email}` → gera token, INSERT, dispara `enviarEmail(usuario, link)`. Idempotente: se já tem token não-expirado, reusa.
- `GET /bolao-copa26/auth/email/confirm?token=XXX` (rota pública sem auth) → valida token, marca `email_confirmado=true` + `confirmado_em=now()`, redireciona pra `/jogar` com query `?confirmed=1`.

**Reset de senha:**
- `POST /auth/senha/esqueci` body `{email}` → busca usuario, gera token (32 bytes hex), INSERT em `senha_reset`, dispara `enviarEmail(usuario, linkReset)`. **Sempre retorna OK** (não revela se email existe).
- `GET /bolao-copa26/auth/senha/reset?token=XXX` → página HTML simples com form (input nova senha + confirmar) + JS que POSTa em `/auth/senha/reset`.
- `POST /auth/senha/reset` body `{token, novaSenha}` → valida token (não expirado, não usado), atualiza `usuarios.senha_hash` (bcrypt), marca `usado_em=now()`. Retorna `{ok:true}` ou erro.

### 2.3 Email sender
**Beta 1.0:** placeholder simples — `console.log("[EMAIL]", para, assunto, link)` + GRAVAR em tabela `notif_envios` com canal='email' (já existe). Admin manda manual via /admin/notificacoes.

**Produção (próxima onda):** integrar Resend (free tier 100/dia, 3k/mês) via API HTTP. Chave em `config.resend_key`. Função `sendResend(to, subject, html)` usa `fetch('https://api.resend.com/emails', ...)`.

### 2.4 Frontend (na tela de login)
**Mínimo:** adicionar 1 link "Esqueci a senha" abaixo do botão Entrar. JS abre prompt nativo simples:
```js
function esqueciSenha(){
  var email=prompt('Email pra recuperar a senha:');
  if(!email)return;
  fetch(BASE+'/auth/senha/esqueci',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:email})})
    .then(r=>r.json()).then(d=>alert(d.ok?'Verifique seu email!':'Erro'));
}
```
Adicionar no `landing.ts` head via fix script (anchor: manifest link).

### 2.5 Bloqueio freemium se email não confirmado
**Decisão:** WARN no header in-app (banner amarelo "Confirme seu email pra desbloquear: [link reenviar]"), mas NÃO bloqueia gameplay. Hard-block só pagas (PIX/Marketplace) — opcional, decide no momento.

---

## NÃO-FAZER (fora de escopo desta spec)
- Mexer em jogar_page.ts diretamente (sempre via `_fix_polish_running.ts`)
- Adicionar mais arquivos polish vN.ts (consolidar no running)
- Integrar Resend agora (deixa pra próxima onda)
- Mudar UI do `/admin` (cabe a outra spec)

## CHECKLIST DE PRONTO
- [ ] Bloco 1 commit pushed (1 commit hash anotado aqui)
- [ ] Bloco 2 commit pushed
- [ ] Usuário testou: cadastro → email recebido → confirma → entra
- [ ] Usuário testou: esqueci senha → email recebido → reset → entra
- [ ] Atualizar `ROADMAP.md` marcando "Confirmação de email + Reset senha" como entregue
- [ ] Atualizar `MAPA_SISTEMA.md` §33 (auth_extras) e §34 (mobile polish acumulador)
