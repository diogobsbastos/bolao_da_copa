# PLANO DE AÇÃO — Mobile UX do Bolão Copa 26
> Auditoria feita em 12/jun/2026 (Claude + Chrome, viewport 390px real). HEAD na época: `3e79572`.
> Entregar este arquivo ao próximo Claude. Ele deve ler também: `INDEX.md` → `SPEC_COMPLETO.md` → `CLAUDE.md` §0.2 (deploy) → `MAPA_SISTEMA.md`.

## 0. Contexto e método (NÃO PULAR)

- App: VPS Oracle, serviço `bolao-copa26` (tsx/Fastify :8510), repo `/home/ubuntu/bolao-copa26` = GitHub `diogobsbastos/bolao_da_copa` (PAT embutido em `.git/config` da VPS, em `branch.main.remote`).
- **Deploy:** clonar o repo no sandbox (`git clone` com a URL+PAT do `.git/config`) → editar com `python3` + `assert s.count(old)==1` → `npx esbuild arquivo.ts --outfile=/dev/null` → `git push` → na VPS o **autodeploy puxa sozinho** (conferir `git log` via MCP) → `servico restart bolao-copa26` (SEMPRE manual) → logs com PID novo + "Server listening 8510".
- **Como testar mobile sem celular:** o resize de janela do Chrome NÃO funciona (Windows trava em ~1134px). Usar **harness de iframe**: navegar a aba pra qualquer página do app e rodar JS:
  `document.documentElement.innerHTML='<body style="margin:0;background:#222;display:flex;justify-content:center;padding:8px 0"><iframe id="fone" src="/bolao-copa26/jogar" style="width:390px;height:590px;border:3px solid #555;border-radius:18px"></iframe></body>'`
  Mesma origem = mesma sessão logada; media queries respondem à largura do iframe. Navegar seções: `fone.contentWindow.nav('bolao'|'time'|'copa'|'rank'|'market'|'deposito')`. Medir overflow: percorrer `querySelectorAll('*')` e listar `getBoundingClientRect().right > 392`.
- **Regra de ouro:** todo fix em media query (desktop está aprovado, NÃO pode mudar). CSS do app em `jogar_style.ts` (export `CSS`); landing em `landing.ts` (CSS inline). `jogar_page.ts` é template gigante — editar só por python/anchor, JS inline sem backtick/`${}`.
- Atenção ao gotcha documentado: zoom × 100vh no sidebar (`MAPA` / memória "menu-zoom-fix") — não regredir.

## 1. CATÁLOGO DA AUDITORIA (390px, medido)

### 🔴 P0.1 — Header do app: pote/sino/saldo FORA da tela
- Medido: `#hm-pote x=404 y=-47`, `#hmsino x=407`, `#w-saldo x=412` (viewport 390). Jogador não vê saldo, pote nem o sino de notificações.
- Estrutura (jogar_page.ts ~linha 10-16): `.top` = `.burger` + `.brand` + `.cdmini`(margin:0 auto) + `.wallets`(margin-left:auto, flex-wrap) contendo `.w.hmpote`, `.w` saldo, `.newswrap`(sino), `.pwrap`(avatar+`.pchev`).
- CSS atual: `.top{display:flex;height:52px;...}` — altura fixa + itens não cabem → wrap pra fora.
- **Fix proposto** (append no fim de `jogar_style.ts`, antes do backtick final) — header de 1 linha compacto:
```css
@media(max-width:600px){
 .top{gap:6px;padding:6px 8px}
 .brand{gap:4px}.brand>span{display:none}.brand .blogo{height:28px}
 .cdmini{font-size:11px;padding:4px 8px;gap:4px}.cdmini .cdlbl{display:none}.cdmini b{font-size:12px}
 .wallets{gap:4px;flex-wrap:nowrap}.w{padding:3px 6px;font-size:11px}
 .hmpote{font-size:10px;padding:3px 7px!important}
 .av{width:27px;height:27px;font-size:12px}.pchev{display:none}
}
@media(max-width:400px){ .brlcc{display:none} .cdmini{padding:3px 6px} .w{padding:3px 5px} }
```
- Conta de largura alvo: burger 34 + escudo 34 + relógio ~92 + pote ~72 + saldo ~58 + sino 28 + avatar 27 + gaps ≈ 360-380. **MEDIR no harness em 390 e 360**; se não couber, plano B = header 2 linhas usando `.wallets{display:contents}` + `order` (linha 1: burger/escudo/sino/avatar; linha 2: relógio+pote+saldo) — nesse caso ajustar `top` do `.side`, `.newsdrop`, `.pdrop`.

### 🔴 P0.2 — Landing: relógio EM CIMA do logo
- `.cdmini` na landing é `position:absolute;left:50%;top:14px;transform:translateX(-50%)` → colide com o brand em telas estreitas. Pote desalinha.
- Existe um `@media(max-width:560px){}` **VAZIO** no fim do CSS da landing (slot pronto).
- **Fix:** em ≤640px tirar o absolute: `.cdmini{position:static;transform:none;order:3;flex:1 1 100%;justify-content:center;margin:2px 0 0}` (o `.nav` já é flex-wrap) + `.nav{padding:10px 14px;gap:8px}` + `.brand .blogo{height:26px}`. Conferir tb a pílula do pote (classe `.hmpote` dentro do `.nav`).

### 🟠 P1.3 — Card do robô na Início (`.hmrod`)
- Texto "Faltam 70 jogo…" cortado; botão "Palpitar agora" sobrepõe a barra de progresso.
- `.hmrod{display:flex;gap:14px;padding:22px 16px 14px}` (robô `.hmrobo` 50px + texto/barra + CTA).
- **Fix:** `@media(max-width:600px){.hmrod{flex-wrap:wrap}.hmrod>*{min-width:0}}` + CTA com `flex:1 1 100%` (descobrir a classe do botão no HTML, perto de "Palpitar agora" no jogar_page.ts) pra ele descer pra linha própria largura cheia.

### 🟠 P1.4 — Barra do robô no Bolão (`.actpanel#autobar`)
- Botões "Palpitar"/"Preencher pela"/toggle amontoados e cortados. Já existe `@media(max-width:760px){.actpanel{grid-template-columns:1fr}}` mas os blocos internos (`.act-ia`, `.act-logic`) continuam estourando.
- **Fix:** em ≤600px `.act-ia,.act-logic{flex-wrap:wrap;min-width:0}` e botões com `flex:1` / fonte menor; o mascote `.masc` pode encolher (`width~40px`). Inspecionar no harness depois de aplicar — tem elemento com largura intrínseca grande.

### 🟠 P1.5 — Dropdown do sino estoura (e o do perfil idem)
- Medido: `.newsdrop` right=442 (52px fora). `.newsdrop{position:absolute;top:46px;right:0;width:300px}`; `.pdrop` idem `width:236px`.
- **Fix:** `@media(max-width:600px){.newsdrop{position:fixed;left:8px;right:8px;top:60px;width:auto;max-height:70vh}.pdrop{position:fixed;right:8px;left:auto;top:60px}}` (se header virar 2 linhas, top:~96px).

### 🟠 P1.6 — Meu Time: grid blowout (13px) + chips
- Medido: `.tmpit-wrap right=403`, `.card right=403` (w=389 dentro de viewport 390; `.main` tem padding 14).
- Causa: grid item não encolhe (min-width:auto). **Fix:** `@media(max-width:760px){.tmgrid{grid-template-columns:minmax(0,1fr)}.tmpit-wrap,.tmbench{min-width:0;max-width:100%}}`.
- Chips "EM BREVE" (4-4-2/Titulares/Reservas/Posição) quebram em 3 linhas → esconder em ≤480 ou virar linha com overflow-x:auto.

### 🟡 P2.8 — Ranking
- Nomes truncados cedo ("Diogo Bran…"), colunas 0/0/0 BOLÃO-ARENA-TOTAL coladas na borda. Fix: reduzir paddings/gaps do `.rkrow` em ≤480, `min-width:0` + ellipsis no nome, fonte 11px nas colunas.

### 🟡 P2.9 — Abas cortadas sem affordance (Bolão "El…", Copa "Elim…")
- `.tabs` precisa `overflow-x:auto` com `-webkit-overflow-scrolling:touch`, `scrollbar-width:none` e um fade na borda direita (mask-image ou pseudo-elemento gradient) indicando que rola.

### 🟡 P2.10 — Marketplace
- Card "Pacote Normal": título quebrando, "EM BREVE" desalinhado. Fix leve: fonte/grid em ≤480. Baixa prioridade.

### ✅ O que JÁ ESTÁ BOM (não tocar)
Cards de palpite do Bolão, tabelas de grupos da Copa, tela Depósito, menu burger lateral, carrossel de jogos da Início, campo da Início.

## 2. PWA INSTALÁVEL (depois do CSS)

1. `manifest.json` servido por rota nova (pode ir no `notificacoes.ts` ou arquivo novo `pwa.ts` registrado no server.ts): name "Bolão Copa 26", short_name "Bolão 26", `start_url: "/bolao-copa26/jogar"`, `scope: "/bolao-copa26/"`, `display: "standalone"`, `background_color: "#0a1228"`, `theme_color: "#1faa59"`, icons 192/512 (gerar do escudo já em base64 no jogar_page, ou usar `/bolao-copa26/og.png` redimensionado com Pillow na VPS).
2. No `<head>` do `jogar_page.ts` e `landing.ts`: `<link rel="manifest" href="...">` + `<meta name="theme-color" content="#1faa59">` + `apple-touch-icon` + `apple-mobile-web-app-capable`.
3. O Service Worker `/sw.js` JÁ EXISTE (push). Pra instalabilidade no Chrome precisa de um handler `fetch` (pode ser pass-through: `self.addEventListener('fetch',()=>{})`). **Cuidado:** não adicionar cache agressivo — o time já sofreu com cache de SW (Ctrl+Shift+R documentado).
4. Testar: DevTools Application → Manifest; e prompt "Adicionar à tela inicial" no Android.

## 3. ORDEM DE EXECUÇÃO E TESTE

1. Bloco A: P0.1 + P0.2 + P1.5 (headers + dropdowns) → deploy → harness: screenshot Início/landing em 390 E 360 → medir de novo `#hm-pote/#hmsino/#w-saldo` (têm que estar `right<=390`).
2. Bloco B: P1.3 + P1.4 + P1.6 → deploy → screenshots Início/Bolão/Meu Time.
3. Bloco C: P2 (ranking/abas/market) → deploy → screenshots.
4. Bloco D: PWA (manifest+meta+fetch handler) → deploy → teste de instalação.
5. Desktop regression: conferir `/jogar` e landing em janela cheia (nada deve mudar).
6. Atualizar docs: `MAPA_SISTEMA.md` (nova seção Mobile/PWA), `ROADMAP.md`, handoff da sessão. Commitar.

## 4. LEMBRETES OPERACIONAIS

- **SÁBADO 13/06 19h00 BRT:** desligar a trava em `/admin/trava` (não esquecer!). Sugestão: antes do jogo, broadcast pelo composer `/admin/notificacoes` ("A pontuação começa hoje!") — sino + push.
- Jogadores só recebem push se clicarem "🔕 ativar alertas" no sino (consentimento individual).
- Carteiras atuais: diogobsbastos=700, filmesvipadm=200. Pote R$70.
