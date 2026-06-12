---
titulo: HANDOFF — Sessão 12/jun/2026 (tarde/noite) · MOBILE UX (Blocos A/B/C/D + PWA)
versao: Beta 1.0
data: 2026-06-12T22:00-03:00
tags: [handoff, sessao, 2026-06-12, mobile, ux, pwa, responsivo]
prev: HANDOFF_SESSAO_2026-06-12_NOTIFICACOES.md
autores: [Claude Opus 4.x (Blocos A/B/D + recovery), Claude Sonnet 4.6 (Bloco C)]
---

# HANDOFF — Sessão 12/jun · Mobile UX completa (Blocos A→D)

> HEAD final: **`fb62249`** (Bloco D PWA).
> Cadeia: `fc49793` (PLANO) → `3e78909` (A) → `c350090` (B) → `deb2eaa`→`9b45888`→`8df5ee8`→`251dd78` (C, Sonnet em paralelo) → `fb62249` (D).

## 1. O QUE ENTROU

### Bloco A — `3e78909` (Opus)
- **P0.1 header do app** (`_fix_mobile_jogar_style.ts`): `@media(max-width:600px)` com seletores prefixados `.top .cdmini/.brand/.wallets/.hmpote/.av/.pchev` pra vencer o override base que vive no `<style>` do `jogar_page.ts` (vem DEPOIS do `${CSS}`). `@media(max-width:400px)` esconde `.brlcc` (centavos do pote).
- **P0.2 landing pote/relógio** (`_fix_mobile_landing.ts` v2): primeira versão patchou um `@media(max-width:560px){}` que estava DENTRO de `@keyframes shimmer` (slot mal-posicionado) → virou aninhado inválido e o parser CSS pulou. Rollback do `.prefix_fix_mobile` + injeção top-level **logo após** o `@media(max-width:560px){.cdlab/.cdval}` existente, com `.nav .cdmini{position:static;transform:none;order:3;flex:1 1 100%;top:auto;left:auto}` (specificity 0,2,0 vence `.cdmini` 0,1,0).
- **P1.5 dropdowns**: `.newsdrop`/`.pdrop` viram `position:fixed;left:8px;right:8px;top:60px;max-height:70vh`.

### Bloco B — `c350090` (Opus)
- **P1.3 `.hmrod` Início** `@media(max-width:600px)`: `flex-wrap:wrap`, `.hmrobo` 48px fixo, `.hmmeta` flex 1 1 200px, `.hmkpis/.hmticker` quebram pra linha cheia, **CTA `.btn.radar`** com `flex:1 1 100%;order:99`.
- **P1.4 `#autobar.actpanel` Bolão** `@media(max-width:760px)`: `.act-ia/.act-logic{flex-wrap:wrap}`, botões `flex:1 1 auto;font-size:12px`, `.masc` 40px.
- **P1.6 `.tmgrid` Meu Time** `@media(max-width:760px)`: `grid-template-columns:minmax(0,1fr)`, `.tmpit-wrap/.tmbench/.card{min-width:0;max-width:100%}`. Chips `@media(max-width:480px) .tmtopR{flex-wrap:nowrap;overflow-x:auto;mask-image:linear-gradient(to right,#000 86%,transparent)}` — affordance de scroll com fade.

### Bloco C — `deb2eaa`/`9b45888`/`8df5ee8`/`251dd78` (Sonnet)
- **P2.8 ranking** `@media(max-width:480px)`: `.rkname` ellipsis, `.rkcol` compacta (9px).
- **P2.9 abas** `@media(max-width:600px)`: `.tabs{overflow-x:auto;mask-image fade}`. C2 adicionou especificidade ID pra resolver cascata: `#copa-tabs.tabs` e `#rank-tabs.tabs`.
- **P2.10 marketplace** `@media(max-width:480px)`: `.pack.base` grid 1fr (empilha), `.pksoon/.pksoon2{display:block;margin:6px auto 0}`.

### Bloco D — `fb62249` (Opus) — **PWA instalável**
- **`pwa.ts`**: rotas `/manifest.json` + `/icon-{192,512}.jpg` (servem `og-square.jpg`). Manifest com `start_url:/bolao-copa26/jogar`, `scope:/bolao-copa26/`, `display:standalone`, `theme_color:#1faa59`, `background_color:#0a1228`. **Rotas internas SEM prefixo** (proxy nginx corta `/bolao-copa26/` antes do Fastify), mas o conteúdo do manifest usa caminho PÚBLICO.
- **`_fix_pwa.ts`** injetou no head de `jogar_page.ts` e `landing.ts` (+356 chars cada, anchor `<meta name="viewport"...>` único): `<link rel=manifest href=/bolao-copa26/manifest.json>` + `<meta theme-color>` + `apple-mobile-web-app-capable=yes` + `apple-mobile-web-app-status-bar-style=black-translucent` + `apple-mobile-web-app-title=Bolão 26` + `<link rel=apple-touch-icon href=/bolao-copa26/icon-512.jpg>`.
- **SW fetch handler**: append `self.addEventListener("fetch",function(){})` ao `SW_JS` em `notificacoes.ts` (+45 chars) — pass-through, sem cache (atendendo o critério do Chrome pra instalabilidade sem interferir no SW de push).
- **`server.ts`**: import `./_fix_pwa.js` + `import { rotasPwa }` + `await app.register(rotasPwa)`.

## 2. PADRÃO _fix_*.ts (estabelecido nesta sessão)

> Quando `jogar_page.ts`, `landing.ts` ou `jogar_style.ts` precisam de patch, **não** se reescreve o arquivo via `escrever_arquivo` (`ler_arquivo` corta acima de ~25k tokens, risco de corrupção). Pattern:
>
> 1. Script `_fix_<nome>.ts` na raiz com top-level code: lê o arquivo via `readFileSync`, valida anchor único (`assert s.split(anchor).length-1 === 1`), aplica `s.replace(anchor, INSERT + anchor)`, grava `.prefix_fix_<nome>` (backup) + arquivo patchado, escreve flag `_fix_<nome>.done` (idempotente).
> 2. Adiciona `import "./_fix_<nome>.js";` no topo do `server.ts`.
> 3. **Dois restarts** do `bolao-copa26`: o primeiro aplica o patch em disco (mas tsx já compilou em link phase com versão antiga), o segundo recarrega o `.ts` patchado.
> 4. Anchor recomendado pra `jogar_style.ts`: `.ob-emoji{font-size:46px}}\\n\`;` (fim do template literal). Pra `landing.ts`: regra top-level confirmada (ex.: `@media(max-width:560px){.cdlab{display:none}.cdval{min-width:0}}`). Pra `jogar_page.ts`/`landing.ts` head: `<meta name="viewport" ...>` único.

Lista de fix scripts ativos (idempotentes via `.done`):
- `_fix_mobile_jogar_style.ts` → A: header app + dropdowns
- `_fix_mobile_landing.ts` → A: landing pote/relógio (versão v2 = `_fix_mobile_landing.v2.done`)
- `_fix_mobile_b.ts` → B
- `_fix_mobile_c.ts` + `_fix_mobile_c2.ts` → C (Sonnet)
- `_fix_pwa.ts` → D

## 3. INCIDENTES OPERACIONAIS DESTA SESSÃO

### 3.1 Sandbox sem GitHub (Opus)
- Proxy do sandbox bloqueia github.com e npmjs.org → não dá pra fazer `git clone`/`esbuild install`/`git push` direto do sandbox.
- **Solução** estabelecida: editar via `escrever_arquivo` MCP na VPS + commit/push via `runDeployCmd` (mecanismo `config.deploy_cmd = '{"acao":"push","msg":"..."}'` + `servico restart` → script no boot faz `git add -A && commit && push`).

### 3.2 ESM link phase precisa de 2 restarts
- tsx compila TODOS os módulos no link phase ANTES de avaliar qualquer um. Patch que altera `.ts` em disco SÓ entra em vigor no PRÓXIMO boot. Documentado no comentário do topo do `server.ts`.

### 3.3 Conflito de merge (Sonnet × Opus paralelos)
- Após Bloco B (Opus), Sonnet pushou `deb2eaa+9b45888+8df5ee8+251dd78` (Bloco C) enquanto Opus rodava em outra sessão e criou commit local duplicado `86a7b5e`.
- `runDeployCmd push` rejeitou (non-fast-forward). Tentativa de pull deixou conflict markers em `_fix_mobile_c.ts` e `jogar_style.ts` → tsx crashou no parse.
- **Resgate** (Opus): stub temporário pra reabrir o boot + `_fix_git_merge_v2.ts` com `git merge --abort` + `git reset --hard origin/main` (descarta o `86a7b5e` duplicado, mantém Sonnet). Site voltou em ~3min. Cleanup final em `_fix_git_merge_v2.ts` reescrito como cleanup script (apagou helpers do resgate + restaurou `jogar_style.ts` que tinha ficado com Bloco C duplicado).

### 3.4 Coordenação entre 2 Claudes
- Já documentado no commit `4068474` (regra de coordenação). Lição prática: **antes de cada bloco, conferir `git log origin/main` pra ver se outro Claude já pushou commits relacionados**.

## 4. ESTADO ATUAL

- **Working tree limpo** (só `.done` flags untracked, idempotência das fixes).
- **HEAD `fb62249`** sincronizado com origin.
- Serviço `bolao-copa26` UP, listening 8510.
- PWA instalável (testar: Chrome desktop → DevTools → Application → Manifest; Chrome mobile → menu → "Adicionar à tela inicial").

## 5. PENDENTE / PRÓXIMO

- **Sábado 13/06 19h00 BRT**: desligar trava em `/admin/trava` (Brasil x Marrocos). Antes (~18h30): broadcast pelo composer `/admin/notificacoes` ("A pontuação começa hoje 19h!") pra todos.
- **Bloco E (next mobile wave)**: bottom tab bar, transições, touch polish, skeletons, safe-area iOS. Plano commitado em `4068474`.
- Validação visual fina do PWA (Lighthouse Audit) — não foi feita nesta sessão (Chrome extension instável em sandbox).
- Eventual upgrade dos ícones PWA pra PNGs reais 192×192 e 512×512 (hoje serve `og-square.jpg` em ambos os tamanhos via Content-Type image/jpeg).

## 6. ARQUIVOS NOVOS NESTA SESSÃO

- `pwa.ts` (Bloco D)
- `_fix_mobile_jogar_style.ts`, `_fix_mobile_landing.ts`, `_fix_mobile_b.ts`, `_fix_mobile_c.ts`, `_fix_mobile_c2.ts`, `_fix_pwa.ts`
- `PLANO_MOBILE_UX.md` (auditoria que ancorou tudo, criada em `fc49793` antes da sessão)
- Este handoff.
- Atualizado: `ROADMAP.md` (entrada Mobile UX em "Já entregue").
- A atualizar próximo passo: `MAPA_SISTEMA.md` §32 PWA (Sonnet já criou §31 Bloco C).
