---
titulo: SPEC Completo — Hub da Copa 2026
versao: Beta 1.0
data: 2026-06-12
tags: [bolao, copa, fastify, postgres, vps, beta-1.0]
---

# SPEC Completo — Hub da Copa 2026 ("Bolão Copa 26")

> Documento RAG-friendly (Obsidian-style com `[[wiki-links]]`). Cada seção é unidade de busca independente.
> Para retomar contexto: **leia esta SPEC inteira primeiro**, depois `[[CLAUDE.md]]`, `[[MAPA_SISTEMA.md]]`, `[[ROADMAP.md]]`, `[[ROTINAS_ZERAR.md]]`, `[[HANDOFF_FABRICA.md]]`.

---

## 1. Visão de produto

- **O que é:** Hub digital de futebol multiplayer com 4 vertentes (Bolão Tradicional + Bet + Marketplace de figurinhas + Arena PvP), construído sobre **moeda virtual única (Tokens)** em ambiente fechado.
- **Janela de mercado:** Copa do Mundo 2026 (EUA, Canadá, México) — **11/jun a 19/jul/2026**.
- **Fase de grupos:** 11–28/jun. Mata-mata: 28/jun→19/jul.
- **Estratégia de lançamento:** MVP no ar em 11/jun pegando a Rodada 1. Demais módulos em ondas durante a Copa.
- **Stack:** TypeScript + Fastify + tsx (runtime, sem build), Postgres self-hosted, VPS Oracle.

Tags: `#produto` `#beta-1.0` `#stack`

---

## 2. Infraestrutura

| Item | Valor |
|---|---|
| Servidor | VPS Oracle (ARM64), hostname `escola-parque-v3` |
| Pasta | `/home/ubuntu/bolao-copa26/` |
| Runtime | Node 22 + **tsx** (loader direto de `.ts`) |
| Processo | systemd `bolao-copa26.service` (auto-restart) |
| Porta | `PORT=8510`, `HOST=127.0.0.1` (proxy em `/bolao-copa26/`) |
| URL pública | `https://oracle-vipworks.duckdns.org/bolao-copa26/` |
| Banco | Postgres local, base `bolao_copa26`, user `innova_worker` |
| Acesso Claude | **só MCP** — `ler_arquivo`, `escrever_arquivo` (faz `.bak`), `sql_local`, `servico`, `logs`, `git`, `listar_pastas` |

Tags: `#infra` `#vps` `#systemd` `#mcp`

---

## 3. Modelo de dados (15 tabelas + novas Beta 1.0)

### Núcleo (já existia antes do Beta 1.0)
- `usuarios` (id, email, senha_hash, nome, telefone, codigo_referral, referido_por, papel, **pagou**, **acesso_full**, **tipo_entrada**, **full_code**, **full_usado**, **nome_time**, **avatar**, **escalacao**)
- `usuarios_carteiras` (usuario_id, **saldo** — colapso de 3 carteiras p/ 1) — `DEFAULT 0`
- `transacoes_tokens` (ledger auditável: tipo `premio_bolao`, `referral`, `compra_pacote`, `deposito_pix`, etc.)
- `sessoes` (Bearer auth)
- `palpites_bolao` (id, usuario_id, jogo_id, placar_casa, placar_visitante, pontos, **creditado**)
- `palpites_longo` (campeao, vice, terceiro, quarto, artilheiro)
- `jogos` (api_fixture_id, fase, rodada, selecao_casa, selecao_visitante, inicio, status, placar_casa, placar_visitante, **resultado_casa**, **resultado_visitante**, **apurado**, odds, resumo_ia)
- `jogadores`, `jogadores_365`, `jogadores_stats`
- `figurinhas`, `inventario_figurinhas`
- `ranking` (usuario_id, pontos_bolao, pontos_arena)
- `indicacoes` (referrer_id, indicado_id, tipo, status, recompensa_dada)
- `depositos` (usuario_id, mp_payment_id, valor, status, creditado, tokens_creditados, criado_em, pago_em)
- `llm_provedores`, `precos_modelos`, `gastos_log`, `custos_meta`
- `config` (kv geral)
- `tarefas_agendadas` (centro de comando)

### Novas (Beta 1.0)
- **`patrocinadores`** — sponsors que somam no Pote.
  ```sql
  CREATE TABLE patrocinadores (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    slug TEXT UNIQUE,
    valor NUMERIC NOT NULL DEFAULT 0,
    logo_url TEXT,
    link_url TEXT,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo','inativo','pendente')),
    observacao TEXT,
    criado_em TIMESTAMPTZ DEFAULT now()
  );
  ```
  Primeiro registro: **Vipworks · R$40 · ativo**.

### Notificações (criadas 12/jun — Onda A no ar)
- `notif_canais` — subscriptions Web Push por usuário (destino=endpoint FCM, p256dh, auth, consentimento, ativo). UNIQUE (canal,destino).
- `notif_mensagens` — broadcasts do composer admin (titulo, template, segmento, criado_por).
- `notif_envios` — inbox/fila: usuario_id, canal (inapp|webpush), titulo/texto renderizados, status (pendente|enviado|falhou|lido), `referencia` p/ dedup (UNIQUE parcial usuario+canal+referencia).

### Planejadas (ver [[ROADMAP.md]])
- `patrocinador_contas` — login self-service de patrocinadores.

Tags: `#schema` `#postgres` `#patrocinadores` `#notificacoes`

---

## 4. Tokenomia & Pontuação (Beta 1.0 — FECHADO 10/jun)

- **Moeda única.** 1 saldo. Saldo inicial **0** (era 500; mudou em 12/jun — só ganha 500 pagando R$10 PIX **OU** convite FULL).
- **Bet com odds reais: FORA do Beta 1.0.**

### Bolão (fase de grupos)
- placar exato = **10** pts (e tokens) | vencedor + saldo = **7** | vencedor = **5** | gol de 1 time = **1**.
- Trava no apito (Cron 02). Vazio → robô preenche (lógica odds/ranking).
- `config.pontos_regra` ajustável.

### Mata-mata (multiplicador sobre 10/7/5/1)
- R32 ×1 · Oitavas ×2 · Quartas ×4 · Semi ×8 · 3º ×5 · **Final ×10**.
- Palpite por fase, trava 1h antes de cada jogo.

### Palpites de longo prazo (trava fim R2 = 23/jun)
- Campeão **200** · Vice **150** · 3º **100** · 4º **75** · Artilheiro **100**.
- Robô preenche se vazio.

### Arena PvP (50/100/90 com rake 10)
- Stake fixa 50 → pote 100 → vencedor leva 90 (rake 10 = sink anti-inflação).
- 1 arena garantida/rodada (o drip +50/rodada paga exatamente uma).
- Pts: vit 50 / der 10 / máx 3 arenas/rod. Teto de overall do XI a calibrar.

### Marketplace (fecha no fim dos grupos)
- Normal R$50/5 cartas · Especial R$120/7 turbinadas · Lendário R$250/1 garante top.

### Pote em dinheiro
- Soma: `depositos status='approved' AND creditado=true` **+** `patrocinadores status='ativo'`.
- Split 50/30/20 (`config.pote_split`).

Tags: `#tokenomics` `#pontuacao` `#bolao` `#arena` `#marketplace`

---

## 5. Endpoints (mapa)

### Públicos (sem auth)
- `GET /` — landing HTML.
- `GET /og.png` — Open Graph (UA-detection: scrapers sociais pegam `og-square.jpg`).
- `GET /og-square.jpg` — imagem quadrada.
- `GET /pote` — `{ pote, jogadores, split, premios }` (depósitos + patrocinadores).
- `GET /inicio` — `{ ok, iso }` com `bolao_inicio_oficial` do config (alimenta relógio regressivo).
- `GET /health` — healthcheck.
- `GET /ranking` — top 50 raw.

### Player (Bearer)
- `/jogar` (HTML SPA), `/jogar/dados`, `/jogar/perfil`, `/jogar/news`, `/jogar/ticker`, `/jogar/copa`, `/jogar/time`, `/jogar/palpitar`, `/jogar/ia`, `/jogar/ranking`, `/jogar/longo`, `/jogar/regras`, `/jogar/onboarding/popup`, `/jogar/pacote/abrir`, `/jogar/perfil/avatar`.

### Depósito PIX
- `POST /jogar/deposito/criar` — gera QR Code MP.
- `GET /jogar/deposito/status` — polling.
- `GET /jogar/deposito/pacotes` — lista.
- `GET /jogar/deposito/historico`.
- `POST /pagamento/webhook` — MP idempotente (`mp_payment_id` UNIQUE).

### Convite FULL
- `GET /jogar/convidar` — link + status.
- `POST /jogar/resgatar-full` — aplica convite.

### Notificações (`notificacoes.ts`)
- `GET /jogar/push/vapid` · `POST /jogar/push/subscribe` · `POST /jogar/push/unsubscribe` — Web Push do jogador.
- `POST /jogar/notifs/lidas` — sino chama ao abrir; marca inbox in-app como lida.
- `GET /sw.js` — Service Worker (escopo `/bolao-copa26/`).
- `GET /admin/notificacoes` (página) · `GET /admin/notificacoes/dados` · `POST /admin/notificacoes/enviar` (segmentos: todos/full/nao-full/top50/inativos) · `POST /admin/notificacoes/teste`.

### Admin (papel='admin' OU `x-admin-token`)
- `/admin`, `/admin/figurinhas`, `/admin/cartas`, `/admin/config-hub`, `/admin/tokenomics`, `/admin/criador-fig`, `/admin/comando`, `/admin/deploy`, `/admin/trava`.
- **Trava de pontuação:**
  - `GET /admin/trava/status` → `{ ativa, inicio_oficial, aviso }`
  - `POST /admin/trava/toggle` body `{ ativa }`
  - `POST /admin/trava/inicio` body `{ iso }`
- **Deploy git:** `POST /admin/deploy/run` `{acao:"push"|"pull"|"status", msg}`.

Tags: `#endpoints` `#api` `#fastify` `#admin`

---

## 6. Cron jobs (núcleo de custo zero)

| Cron | Quando | O que faz |
|---|---|---|
| **01** | Madrugada | Lê estatísticas frias do dia seguinte → LLM → salva resumo PT em `jogos.resumo_ia`. |
| **02** | 30min antes do jogo | Trava palpites + auto-preenche faltantes pela lógica de odds/IA. |
| **03** | Pós-jogo | Coletor 365 → `jogos.resultado_*` → `apurarJogo()` → credita pontos + tokens (`tipo='premio_bolao'`). |
| **04** | Fim do torneio | Liquida palpites longos (campeão/vice/3º/4º/artilheiro). |
| **agendador_diario** | 02:00 | `agendarResultados()` por horário de cada jogo. |
| **autoPreencherTick** | A cada 15min | Preenche faltantes 1h antes do jogo. |

Tags: `#cron` `#automacao` `#pontuacao`

---

## 7. Trava de pontuação (toggle no admin)

> Beta 1.0 entra em produção 11/jun mas **só pontua a partir do jogo do Brasil x Marrocos = sábado 13/06 19h00 BRT**.

- `config.bolao_trava_pontuacao` = `'on'` (default) | `'off'`.
- `config.bolao_inicio_oficial = "2026-06-13T22:00:00.000Z"` (UTC).
- `config.bolao_aviso_inicio` — mensagem amigável pra UI.

### Funcionamento (zero corrupção)
- `pontuacao.ts/apurarJogo()` quando trava=`on` e `jogo.inicio < bolao_inicio_oficial` → **retorna cedo sem mutar o banco**. `apurado` fica `false`.
- Quando admin desliga a trava, o coletor processa naturalmente os jogos pendentes — nada foi perdido.
- Jogos APÓS o `inicio_oficial` apuram normalmente mesmo com a trava ligada.

### UI admin
- Página `/admin/trava` no menu lateral (item "🔒 Trava de Pontuação").
- Estado visual: dot verde TRAVADO / dot vermelho DESTRAVADO.
- Botão único ligar/desligar (verde/vermelho).
- **Calendário popup animado** pra editar a data ISO (mês/ano/dia + hora/minuto).
- Endpoint `GET /inicio` (público) alimenta o relógio regressivo `.cdmini` (landing + app logado).

Tags: `#trava-sabado` `#bolao-inicio-oficial` `#pontuacao` `#admin`

---

## 8. Auth & Convites

- E-mail + senha (`auth.ts`) + Google OAuth.
- `usuarios.tipo_entrada`: `pago` | `full_gift` | NULL.
- **Convite FULL one-shot:** quem paga R$10 ganha 1 `full_code`. 2ª pessoa com mesmo link vê "convite já usado por X".
- Bloqueio freemium (visitante navega Início/Copa/Ranking/Regras/Depósito; bloqueado em Bolão/Time/Arena/Marketplace/IA/Convidar).
- Audit em `indicacoes` (referrer_id, indicado_id, tipo, status).

Tags: `#auth` `#convite` `#freemium`

---

## 9. Pagamento PIX (Mercado Pago)

- Token PRODUÇÃO: `APP_USR-...82010094` em `config.mp_access_token`.
- Webhook secret `config.mp_webhook_secret` — **validação de assinatura pendente** (gravado, não verificado ainda).
- Pacote único ativo: **R$10 → 500 tokens + acesso_full + full_code**.
- Cronômetro 10:00 → 00:00 no QR Code.
- Polling `/jogar/deposito/status`.

Tags: `#pix` `#mercadopago` `#pagamento`

---

## 10. Frontend (estrutura)

### Landing (`landing.ts`)
- HTML monolítico (template literal `const LANDING`).
- Header: brand pill (escudo + "BOLÃO COPA 26" CAPS + Beta 1.0 + Manager chip) + relógio `.cdmini` centralizado absoluto + pílula dourada do Pote.
- Hero, login (e-mail/senha + Google), explicação do produto.
- OG image quadrada via User-Agent detection.

### App logado (`jogar_page.ts` + `jogar_style.ts`)
- SPA single-file. CSS extraído em `jogar_style.ts`.
- Top bar: burger + brand + `.cdmini` centralizado entre brand e wallets (margin auto) + wallets/avatar.
- Seções: Início, Bolão, Meu Time, Copa, Ranking, Marketplace, IA, Regras, Convidar, Depósito.
- Bloqueio freemium via `reqFull()` helper.
- `loadCd()` injetado puxa `/inicio` e tica de 1 em 1 segundo.

### Admin
- Sidebar compacta (`ui.ts`): 212px, padding 6/10, scroll fino, 15 itens incluindo **Trava de Pontuação**.
- Hub central `/admin`. Telas: Tokenomics, Centro de Comando, Cartas, Config Hub, Custos, LLM, Figurinhas, **Trava** (com calendário popup).

Tags: `#frontend` `#html-template` `#pwa` `#sidebar`

---

## 11. Logo & Brand (Beta 1.0 final)

```css
.brand{display:inline-flex;align-items:center;gap:9px;font-weight:800;font-size:15px;white-space:nowrap;background:transparent;border:0;padding:0}
.brand b{color:#1faa59}
.brand span{text-transform:uppercase;color:#fff}
.brand .bbeta{font-size:10px;font-weight:700;letter-spacing:.3px;color:#fff;text-transform:none;margin-left:6px;opacity:.95}
.brand .bmgr{font-size:10px;font-weight:800;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.22);border-radius:8px;padding:3px 9px}
.brand .blogo{height:32px;width:auto;filter:drop-shadow(0 3px 8px rgba(0,0,0,.4))}
.w.hmpote,.hmpote{border-radius:999px !important;padding:6px 14px !important;background:linear-gradient(135deg,#f8d873,#e0a008);border:1px solid #e6ad12}
.cdmini{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:800;background:linear-gradient(135deg,rgba(31,170,89,.25),rgba(20,121,74,.35));border:1px solid rgba(31,170,89,.55);border-radius:999px;padding:6px 14px;box-shadow:0 4px 14px rgba(31,170,89,.25)}
/* landing: position:absolute;left:50%;top:14px;transform:translateX(-50%) */
/* app logado: margin:0 auto (centralizado no flex entre brand e wallets) */
.cdmini b{color:#f5c451;font-weight:900;font-size:14px}
.cdmini .cdlbl{font-size:10px;font-weight:800;text-transform:uppercase}
```

HTML brand (landing — sem clock dentro):
```html
<div class="brand">
  <img class="blogo" src="data:image/png;base64,..." alt="">
  <span>Bolão <b>Copa 26</b> <small class="bbeta">Beta 1.0</small></span>
  <small class="bmgr">Manager</small>
</div>
<span class="cdmini" id="cdmini"><span class="cdlbl">começa em</span> <b id="cdminival">--</b></span>
```

Tags: `#design` `#brand` `#css` `#relogio`

---

## 12. Deploy & ciclo de edição

**Regra de ouro** (`CLAUDE.md §0.2`):
1. Clone sandbox em `~/work/bolao` (não `/tmp`)
2. `python3` com `assert s.count(old)==1`
3. `npx esbuild arquivo.ts --outfile=/dev/null` + `node --check` no JS extraído
4. `git push` → VPS `git pull` (confirmar "Updating X..Y")
5. `servico restart bolao-copa26` → `logs` → **PID NOVO** + "Server listening 8510"

**Limites do MCP:**
- `ler_arquivo` corta acima de ~25k tokens.
- `escrever_arquivo` só substitui arquivo inteiro (sem patch).
- Edit/Write corrompem `.ts` grandes nos mounts → usar `python/sed` ou padrão "fix script" (`_fix_*.ts` importado uma vez do server.ts, faz a edição, escreve `.done`, e remove o import depois).
- Padrão **arquivos pequenos** (separar página vs lógica).
- Sandbox **não alcança** VPS host público.

**Git automático via Node** (`deploy.ts`):
- SQL: `INSERT INTO config(chave,valor) VALUES('deploy_cmd','{"acao":"push","msg":"..."}') ON CONFLICT DO UPDATE` → restart → roda + grava em `config.deploy_out`.

Tags: `#deploy` `#git` `#sandbox` `#tsx`

---

## 13. Estado atual (12/jun/2026 noite)

### ✅ No ar e funcionando
- Cadastro/login (e-mail/senha + Google).
- Bolão tradicional (palpite manual, robô, IA do usuário).
- Depósito PIX **produção real** (R$10 já caiu).
- Webhook MP idempotente.
- Convite FULL ponta-a-ponta + bloqueio freemium.
- Ranking Geral com prêmio R$ projetado.
- og:image quadrada via UA-detection.
- Pílula dourada do Pote (landing + app logado) — depositos + patrocinadores.
- Patrocinadores: tabela + Vipworks R$40 (Pote total R$50).
- Centro de Comando com retry (+10min, máx 3).
- Logo final + relógio regressivo `.cdmini` tickando.
- Trava de pontuação toggle (`/admin/trava`) com calendário popup animado.
- Sidebar admin compacta (212px).
- Reset zero (ranking/palpites/jogos.apurado/transações_premio_bolao) executado.
- **Notificações Onda A (12/jun):** sino in-app (badge + lidas) + Web Push (VAPID/aes128gcm node:crypto puro, sem lib) + composer `/admin/notificacoes` com segmentos + gatilhos pontos/PIX/palpite pendente + `/sw.js`. Testado ponta-a-ponta (FCM 201).

### 🚧 Pendentes (ver [[ROADMAP.md]])
- Notificações Onda B/C: WhatsApp Business (HSM) + e-mail transacional + A/B.
- Tour inicial (onboarding interativo + checklist Primeiros Passos).
- Tela pública de patrocinadores (`/patrocinadores`).
- Login self-service de patrocinador (pagamento PIX próprio).
- Sistema de Arena PvP — design fino (matchmaking, teto XI, anti-conluio).
- Validação de assinatura do webhook MP.
- Tarefa `reconciliar_pix` no Centro de Comando.
- Aposentar coletor legacy paralelo ao scheduler.
- Material de propaganda.

Tags: `#estado` `#pendencias` `#roadmap`

---

## 14. Convenções de código

- **TypeScript ESM** (`.js` em imports, tsx resolve).
- **Sem build.** tsx roda direto.
- **Arquivos pequenos** preferidos.
- **Regras** editáveis no `config` table (não no código).
- **Idempotência** em `apurarJogo`, webhook MP, `INSERT ... ON CONFLICT`.
- **Logs estruturados** Pino (JSON).
- **PWA** — Service Worker cacheia agressivo: `Ctrl+Shift+R` ou Clear site data.
- **Fix scripts** (`_fix_*.ts`) — quando precisa editar `.ts` grande sem corromper: write um TS importado uma vez via server.ts.

Tags: `#convencoes` `#typescript` `#esm`

---

## 15. Links Obsidian (mapa mental)

- [[CLAUDE.md]] — regras de produto/stack + tokenomia oficial
- [[MAPA_SISTEMA.md]] — fonte da verdade técnica (infra/tabelas/arquivos)
- [[ROADMAP.md]] — próximas ondas (com Notificações no TOP)
- [[ROTINAS_ZERAR.md]] — funções SQL `apagar_jogador()` / `apagar_todos_jogadores()`
- [[HANDOFF_FABRICA.md]] — Fábrica de Figurinhas
- [[HANDOFF_SESSAO_2026-06-12.md]] — última sessão
- [[SPEC_TEMPLATE.md]] — modelo para novas tarefas

Tags: `#index` `#obsidian` `#rag`
