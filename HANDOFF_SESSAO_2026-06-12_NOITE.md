---
titulo: HANDOFF — Sessão 12/jun/2026 NOITE
versao: Beta 1.0
data: 2026-06-12T22:00-03:00
tags: [handoff, sessao, 2026-06-12, noite]
prev: HANDOFF_SESSAO_2026-06-12.md
---

# HANDOFF — Sessão 12/jun/2026 NOITE · Hub da Copa 2026

> Sessão de quinta à noite (~21h–~1h). Foco: refinar visual do Beta 1.0 + criar trava operacional pra controlar lançamento de sábado. HEAD final: **`27dd5fc`** (após +2 commits desta noite: `fe4b361`, `d79dc74`, `27dd5fc`).

---

## 0. CONTEXTO RÁPIDO

Sessão anterior (manhã) entregou: depósito PIX, convite FULL, freemium, og:image quadrada, popup translúcido, ranking com prêmio em R$.

Esta sessão NOITE polui visual + funcional + documental, deixando tudo pronto pra **desligar a trava no sábado 13/06 19h** (jogo do Brasil) e começar a pontuação real.

---

## 1. O QUE ENTROU NESTA SESSÃO

### 1.1 Logo BOLÃO COPA 26 (padronizado landing ↔ app)
- Removida pílula preta de fundo (`background:transparent;border:0`).
- "BOLÃO COPA 26" em CAPS (`text-transform:uppercase`).
- "Beta 1.0" branco puro `#fff`, inline com espaço de 6px.
- Chip "Manager" mantido com glassmorphism (`rgba(255,255,255,.10)`).
- `.blogo` altura 32px com drop-shadow verde.
- `.brand b{color:#1faa59}` no "Copa 26".

### 1.2 Pílula dourada do Pote (sincronizada)
- Tabela `patrocinadores` criada: `id, nome, slug UNIQUE, valor, logo_url, link_url, status, observacao, criado_em`.
- Primeiro patrocinador: **Vipworks · R$40 · ativo**.
- Endpoint `/pote` (landing.ts) e `loadDados` (jogar.ts) agora somam `depositos approved AND creditado=true` + `patrocinadores ativo`.
- 2 ocorrências de `poteTot` no `jogar.ts` corrigidas.
- Resultado: **Pote = R$50** (R$10 depósito real `filmesvipadm@gmail.com` id=27 + R$40 Vipworks).
- `.hmpote` forçado redondo: `border-radius:999px !important`.
- Premiação top 3: R$25 / R$15 / R$10.

### 1.3 Histórico de depósitos saneado
- Eu havia apagado 3 deposito teste por engano. Restaurado id=27 (R$10 real do filmesvipadm) com `mp_payment_id=163716523248`, `criado_em=2026-06-11 23:01:40`.
- Sequence `depositos_id_seq` ajustada via `setval`.

### 1.4 Relógio regressivo `.cdmini`
- **Endpoint público** `GET /inicio` → `{ ok:true, iso:"2026-06-13T22:00:00.000Z" }` (puxa `config.bolao_inicio_oficial`).
- **Landing**: `.cdmini` `position:absolute; left:50%; transform:translateX(-50%); top:14px` — centralizado horizontalmente no topo.
- **App logado** (`jogar_page.ts`): `.cdmini` removido de dentro do `.brand`, agora elemento próprio entre brand e wallets com `margin:0 auto`.
- JS `loadCd()` injetado em ambos: fetch `/inicio`, tica a cada 1s (`Xd HH:MM:SS`).
- Cor adapta tema (`var(--tx)`, `var(--mut)`) no app logado.
- Pílula verde com gradient + glow + label "COMEÇA EM".

### 1.5 Trava de pontuação (ligavel/desligavel)
- **Reescrita `pontuacao.ts`** — quando travado, retorna cedo **SEM MUTAR O BANCO**. Permite ligar/desligar a qualquer momento sem corromper estado.
- 3 configs novas:
  - `bolao_trava_pontuacao` (`on` default | `off`)
  - `bolao_inicio_oficial` (`2026-06-13T22:00:00.000Z` UTC = sáb 19h BRT)
  - `bolao_aviso_inicio` (mensagem amigável)
- Novo arquivo **`trava.ts`** registrado em `server.ts` (`rotasTrava`).
- Página `/admin/trava` com:
  - Estado visual (dot verde TRAVADO / vermelho DESTRAVADO + label).
  - Botão único ligar/desligar (verde/vermelho).
  - **Calendário popup animado** completo (mês/ano navegável + dia + hora/minuto) ao clicar no chip "📅 Clique pra escolher".
  - Card "Como funciona" explicando.
- Endpoints:
  - `GET /admin/trava/status` → `{ ativa, inicio_oficial, aviso }`
  - `POST /admin/trava/toggle` body `{ ativa: boolean }`
  - `POST /admin/trava/inicio` body `{ iso: string }`
- Item "🔒 Trava de Pontuacao" adicionado ao menu lateral admin (entre Regras e Centro de Comando).

### 1.6 Sidebar admin compacta
- Largura: 236px → **212px**.
- Padding sidebar: 18/12 → 10/8.
- Padding item: 10/12 → 6/10.
- Gap entre itens: 2px → 1px.
- Fonte: 14px → 13px.
- Scrollbar custom (6px estilizado).
- `overflow-y:auto` + flex column gap.
- 15 itens cabem em ~640px de altura sem scroll na maioria das telas.

### 1.7 Modal Auto-preencher (espaço corrigido)
- 4 `<br>` consecutivos → `margin-top:12px` na caixa azul.
- `<br>` entre caixa azul e parágrafo final → wrapper `<div style="margin-top:12px">`.
- `</div>` extra adicionada pra fechar.

### 1.8 Reset zero (ranking + palpites + tokens)
- Em transação ACID:
  - Devolvidos tokens `premio_bolao` das carteiras (`saldo = saldo - SUM(valor)`).
  - DELETE `transacoes_tokens WHERE tipo='premio_bolao'`.
  - UPDATE `palpites_bolao SET pontos=0, creditado=false`.
  - UPDATE `jogos SET apurado=false WHERE apurado=true`.
  - UPDATE `ranking SET pontos_bolao=0, pontos_arena=0`.
- Estado final: tudo zerado, carteiras ajustadas:
  - `diogobsbastos@gmail.com` → 700 tokens
  - `filmesvipadm@gmail.com` → 200 tokens

### 1.9 Sistema de Notificações no TOP do ROADMAP
- Documentação completa em `ROADMAP.md`:
  - 4 canais: Web Push (PWA, custo zero), WhatsApp Business API (HSM), e-mail transacional, in-app banner.
  - 3 tabelas planejadas: `notif_canais`, `notif_mensagens`, `notif_envios` (DDL no doc).
  - Gatilhos completos (onboarding, PIX, convite usado, 1h antes do jogo, "você acertou X pts", trava chegando, Arena, mata-mata, Marketplace, broadcast admin).
  - Segmentação: todos / FULL / não-FULL / top 50 / inativos.
  - 3 ondas (A: in-app+webpush / B: WhatsApp / C: email+segmentação).

### 1.10 Documentação consolidada
- `SPEC_COMPLETO.md` (v2) reescrito com 15 seções RAG-friendly + `[[wiki-links]]`.
- `ROADMAP.md` reorganizado com TOP prioridade explícita.
- `INDEX.md` novo — mapa central de toda documentação.
- `HANDOFF_SESSAO_2026-06-12_NOITE.md` (este arquivo).
- `ROTINAS_ZERAR.md` copiado pra VPS.

---

## 2. ESTADO ATUAL — O QUE ESTÁ NO AR

### Funcionando 100%
- Tudo do Beta 1.0 da sessão anterior (PIX produção, convite FULL, freemium, ranking R$, Centro de Comando).
- **Pote R$50** sincronizado landing + app logado.
- **Logo final** padronizado.
- **Relógio regressivo** tickando em `/inicio`.
- **Trava de pontuação on/off** em `/admin/trava` com calendário popup.
- **Sidebar admin compacta**.
- **Reset zero** executado.

### Próxima ação operacional
**SÁBADO 13/06 19h00 BRT:** abrir `/admin/trava` → clicar "Desligar a trava" (botão vermelho aparece). A partir desse momento, o coletor de resultados começa a apurar jogos e creditar pontos/tokens automaticamente.

---

## 3. O QUE ESTÁ PENDENTE (ver ROADMAP.md)

### 🔥 TOP PRIORIDADE
1. **Sistema de Notificações** (4 canais, 3 tabelas, composer admin, gatilhos completos).

### Importantes
2. Tour inicial + checklist Primeiros Passos.
3. Tela pública `/patrocinadores`.
4. Login self-service de patrocinador (PIX próprio).
5. Sistema PvP (Arena) — design fino.

### Operacionais
6. Validação de assinatura do webhook MP.
7. Tarefa `reconciliar_pix` no Centro de Comando.
8. Aposentar coletor legacy paralelo.
9. Material de propaganda.

---

## 4. ARQUIVOS-CHAVE TOCADOS NESTA SESSÃO

| Arquivo | Mudanças |
|---|---|
| `landing.ts` | CSS .brand transparente, CSS+HTML .cdmini centralizado, endpoint /inicio, query /pote com patrocinadores |
| `jogar_page.ts` | brand sem fundo preto, .cdmini centralizado entre brand e wallets, loadCd() injetado, modal Auto-preencher corrigido |
| `jogar.ts` | 2x poteTot incluindo patrocinadores ativos |
| `jogar_style.ts` | CSS .cdmini do app (color via var(--tx)) |
| `pontuacao.ts` | Reescrito do zero: trava sem mutar banco quando ativa |
| `trava.ts` | **NOVO** — endpoints + página `/admin/trava` com calendário popup |
| `server.ts` | Registrado rotasTrava |
| `ui.ts` | Sidebar compacta (212px) + item "Trava de Pontuacao" no menu |
| `SPEC_COMPLETO.md` | v2 com 15 seções RAG |
| `ROADMAP.md` | Notificações no TOP |
| `INDEX.md` | **NOVO** — mapa de documentação |
| `HANDOFF_SESSAO_2026-06-12_NOITE.md` | **NOVO** — este arquivo |
| `ROTINAS_ZERAR.md` | Copiado pra VPS |

Backups com sufixo `.prefix_fix_*` ficaram pra rollback se precisar.

---

## 5. CONFIGURAÇÕES IMPORTANTES (config table)

| chave | valor | observação |
|---|---|---|
| `bolao_trava_pontuacao` | `on` | TOGGLE — desligar sábado 19h |
| `bolao_inicio_oficial` | `2026-06-13T22:00:00.000Z` | UTC = sáb 19h BRT |
| `bolao_aviso_inicio` | "A pontuação começa..." | texto amigável |
| `mp_access_token` | `APP_USR-...82010094` | PRODUÇÃO |
| `mp_webhook_secret` | `eeb1c7a4...` | salvo, NÃO validado |
| `pote_split` | `[50,30,20]` | top 3 |
| `pontos_regra`, `mata_mult`, `longo_prazo`, `arena` | populadas | regras Beta 1.0 |

---

## 6. PATROCINADORES

| nome | slug | valor | status | observação |
|---|---|---|---|---|
| Vipworks | vipworks | 40 | ativo | Patrocinio inicial — lancamento Beta 1.0 |

---

## 7. COMMITS DESTA SESSÃO

```
27dd5fc docs+feat: SISTEMA DE NOTIFICACOES no TOP do ROADMAP + SPEC_COMPLETO v2 + trava com calendario popup + sidebar admin compacta + reset zero de pontos
d79dc74 feat: trava de pontuacao ligavel/desligavel em /admin/trava + pontuacao.ts sem mutacao quando travado + relogio centralizado na landing e no app logado com JS tickando
fe4b361 feat(beta1.0): logo final identico ao app + pote sincronizado + patrocinadores (Vipworks R$40) + relogio regressivo .cdmini + trava de pontuacao ate 13/06 19h + SPEC + ROADMAP
```

**HEAD anterior:** `399ee44` (sessão da manhã)
**HEAD atual:** `27dd5fc` (após +3 commits desta noite)

---

## 8. PROMPT PARA O PRÓXIMO CHAT

Cole no início do próximo chat (já está no final do `INDEX.md` também):

```
Projeto: Hub da Copa 2026 (Bolão Copa 26). App web na VPS Oracle, serviço bolao-copa26 (tsx/Fastify :8510, Postgres bolao_copa26, repo /home/ubuntu/bolao-copa26). HEAD atual: 27dd5fc.

LEIA NESTA ORDEM:
1. INDEX.md (mapa de toda a documentacao)
2. SPEC_COMPLETO.md (visao consolidada, 15 secoes RAG)
3. CLAUDE.md (regras de produto/stack)
4. MAPA_SISTEMA.md (tecnico)
5. ROADMAP.md (Notificacoes = TOP)
6. HANDOFF_SESSAO_2026-06-12_NOITE.md (sessao mais recente)
7. ROTINAS_ZERAR.md (funcoes SQL)

DEPLOY: clone ~/work/bolao -> python assert count==1 -> npx esbuild --outfile=/dev/null -> git push -> VPS pull via MCP -> servico restart -> PID novo + "Server listening 8510". Edit/Write corrompem .ts grandes -> usar fix scripts (_fix_*.ts importado uma vez do server.ts).

ESTADO (12/jun noite):
- Beta 1.0 no ar. PIX producao (R$10 real ja caiu).
- Pote R$50 = R$10 deposito real + R$40 Vipworks (tabela patrocinadores criada).
- Logo BOLAO COPA 26 identico landing/app + relogio regressivo .cdmini centralizado tickando em /inicio.
- Trava de pontuacao on/off em /admin/trava com calendario popup animado (configs: bolao_trava_pontuacao + bolao_inicio_oficial=2026-06-13T22:00:00.000Z).
- pontuacao.ts NAO muta banco quando travado.
- Sidebar admin compacta (212px).
- Reset zero executado (ranking/palpites/jogos.apurado/transacoes premio_bolao).

PROXIMA ACAO: SABADO 13/06 19h00 BRT -> /admin/trava -> Desligar a trava (botao vermelho).

PROXIMA PRIORIDADE DEV: Sistema de Notificacoes multicanal (ROADMAP.md secao 1).
```
