# HANDOFF — Sessão 11/jun/2026 (tarde) · Hub da Copa 2026

> Continuação do dia de lançamento. Tudo deployado na VPS (serviço `bolao-copa26`). Branch `main`, HEAD = **a64d3c7**.

## 1. O que foi feito nesta sessão (em ordem)

### 1.1 Início — Próximos Jogos virou carrossel (FEITO)
- Era 1 jogo / depois lista de 4 + botão verde "Ir pro Bolão" (feio). Agora: **carrossel paginado de 5 em 5 jogos**, **altura travada** (sempre 5 linhas — completa com linhas vazias `.hmgempty`), **data + hora** por linha, **times centralizados**, **setas verdes** (‹ ›) no topo direito, **dots**, **rótulo de intervalo de datas**, **auto-rotação 6s**. Sem botão.
- Backend: `/jogar/copa` proximos LIMIT 8 → **20**.
- Frontend (jogar_page.ts): `loadHomeProx`/`renderHomePage`/`hmDayNav`/`hmAuto`; globais `HM_PX,HM_PG,HM_PGS,HM_TMR`. CSS `.hmgrow{min-height:38px}`+`.hmgempty`, `.hmpx-arw` verde, `.hmpx-nav`, `.hmpx-daylbl`.
- Card **Arena PvP — Em Breve** ao lado, esticando até a altura do campo (`.pvpcard{flex:1}`+`.hmcols{align-items:stretch}`).

### 1.2 BUG CRÍTICO resolvido — Meu Perfil vazio em TODAS as contas (commit 1f9ab0a)
- **Sintoma:** Perfil "jogador"/avatar "?"/form vazio/R$0/0 tokens em todas as contas; header carregava normal. Parecia perda de dados — NÃO era, banco intacto.
- **Causa:** removi `id="d-prox"` do HTML, mas `loadDados()` continuava `getElementById("d-prox").innerHTML=...`. Sempre há jogo futuro → a linha estourava e abortava o loadDados ANTES de `setProfile()` (última coisa). Header carrega no começo (ok), Perfil no fim (quebrava).
- **Fix:** `getElementById("d-prox")||{}`.
- **Lição:** `loadDados` é uma sequência longa de getElementById SEM guard; ao remover/renomear elemento, `grep getElementById("<id>")` antes de deployar.

### 1.3 Regras — Rodada de 32 (×1) + Regras 100% dinâmicas do config (commit 7fc30d9)
- Faltava **Rodada de 32 (×1)** antes das Oitavas; estava hardcoded em 2 lugares (bloco estático do menu + `regrasRank()` do Ranking).
- **Refatorado p/ fonte única = config do Admin:**
  - Backend `GET /jogar/regras` lê config (`pontos_regra`,`mata_mult`,`longo_prazo`,`arena`) com defaults.
  - Frontend: builders `rgBolao/rgMata/rgLongo/rgArena(c)` + `rrow` + `ensureRegras()` (cache `REGRAS_CFG`) + `loadRegras()` (preenche `#rg-bolao/#rg-mata/#rg-longo/#rg-arena`) + `regrasRank()` dinâmico. `nav('regras')`→`loadRegras()`. Tabelas estáticas viraram `<div id="rg-*">`.
- **Resultado:** mexer na aba Regras do Admin (`?pg=regras`, grava em config) muda menu Regras E modal do Ranking, sem deploy.
- **Banco alinhado ao CLAUDE.md:** `mata_mult.terceiro` 4→**5**; `longo_prazo.artilheiro` `[100,60,40]`→**100**.

### 1.4 Logo — "Beta 1.0" (commit a64d3c7)
- "Beta 1.0" pequeno (8px bold), sob o "Copa 26" (`.bcol` align-flex-end), **fonte preta** (`var(--tx)`).

### 1.5 Sino de Novidades — ordem dos próximos jogos (commit dc6793e)
- `/jogar/news`: futuros primeiro (mais cedo→mais tarde), resultados depois (recente→antigo).

## 2. Deploy (regra de ouro)
1. Editar em `~/work` com python `assert s.count(old)==1`. 2. `npx esbuild ... --outfile=/dev/null` + render + `node --check`. 3. `git push`. 4. **Autodeploy só faz pull, NÃO reinicia** → `git pull` (confirmar `Updating X..Y`) + `servico restart bolao-copa26` + conferir **PID novo** + "Server listening 8510". 5. Edit/Write corrompem `.ts` grandes → usar python/sed.

## 3. Infra
- VPS sem sudo. Repo `/home/ubuntu/bolao-copa26`. systemd `bolao-copa26` (tsx/Fastify :8510), nginx `/bolao-copa26/`. Postgres banco **bolao_copa26**. Bug visual → Claude in Chrome ANTES de teorizar.

## 4. PRÓXIMOS PASSOS (próximo chat)
1. **Terminar a página de Pagamento** (Depósito do jogador) — UI completa.
2. **Ligar pagamento real** — Mercado Pago PIX (já há `pagamento.ts`, depositos/inventario, token config `TEST-`; sem saque, lei 14.790). Credenciais de produção, webhook de confirmação, creditar tokens/saldo.
3. **Fluxo de início completo** — cadastro/login → Início → 1º palpite.
4. **Primeiros Passos** — onboarding/tutorial (checklist: perfil, 1º palpite, 1º pacote, montar time).
5. **Material de propaganda** — peças p/ convidar 1ºs jogadores (referral `indicacao.ts`).
6. **Notificações** — WhatsApp Business API + Web Push (trava da rodada, resultado, pontuou).

## 5. Estado (Beta 1.0)
- ✅ MVP: cadastro/login, saldo único, Bolão (`pontuacao.ts`+coletor 365), ranking, crons trava/resultado. Meu Time, Pacote inicial, Sino, Home Manager, Regras dinâmicas.
- 🔜 Pagamento real, onboarding, propaganda, notificações.
- ⏳ Marketplace (5 pacotes+garantias+unboxing), Arena PvP, Mata-mata (palpite/fase+Cron mult), Longo prazo (Cron 04), Pote final.
