# CLAUDE.md — Instruções do Projeto "Hub da Copa 2026" (Beta 1)

> Fonte da verdade do projeto. Toda decisão de código, design e produto respeita o que está aqui. Atualize sempre que algo mudar.
>
> **Status:** Beta 1 em desenvolvimento. **Estratégia de lançamento:** MVP no ar até 11/jun para pegar a Rodada 1; demais módulos entram em paralelo durante a Copa.

---

## 0. PROTOCOLO DE INÍCIO (Claude lê SEMPRE primeiro)

Antes de qualquer tarefa neste projeto, na ordem:

1. **Ler `MAPA_SISTEMA.md`** (nosso "obsidian") — é a fonte da verdade técnica: infra da VPS, as 15 tabelas do banco, arquivos e responsabilidades, endpoints, regras aprendidas (ex.: `real = Boolean(jogadores.figurinha)`, filtro de recortes, subpasta `_fab`), estado e roadmap. **NÃO redescobrir o que já está mapeado lá.**
2. **Ler `HANDOFF_FABRICA.md`** — contexto da Fábrica de Figurinhas.
3. Este `CLAUDE.md` — regras de produto/stack.

**Regra de ouro:** sempre que tomar uma decisão nova, descobrir como algo funciona, ou mexer num módulo → **atualizar o `MAPA_SISTEMA.md` na hora**. Pesquisar nele ANTES de garimpar código.

**Arquivos-fonte de orientação:** `MAPA_SISTEMA.md` (mapa técnico) · `HANDOFF_FABRICA.md` (Fábrica) · `CLAUDE.md` (este).

**Limitações de ferramenta (importante p/ não perder tempp):** a VPS só tem *substituir arquivo inteiro* (sem editar trecho) e *leitura* falha acima de ~25k tokens. Por isso o padrão é **arquivos pequenos** (página separada da lógica, ex.: `cartas.ts` + `cartas_page.ts`) e **ajustáveis no banco** (`config`), não no código.

---

## 0.1 TOKENOMIA & PONTUAÇÃO — BETA 1.0 (FECHADO em 10/jun/2026)

> Regras oficiais do Beta 1.0, **aprovadas pelo dono**. Tudo tunável via tabela `config`. Esta seção **tem precedência** sobre qualquer menção antiga de economia/pontuação espalhada neste doc (carteiras, Bet, etc.).

### Moeda
- **Token único.** Acabou a divisão em 3 carteiras (Colecionador/Apostas/Arena) → **1 saldo só**. Saldo inicial **500**.
- **Bet (apostas com odds reais) está FORA do Beta 1.0** — não entra nesta Copa.
- Motivo de colapsar pra 1: sem Bet, o split perde sentido; e "bridge" entre carteiras seria atrito. 1 moeda = zero bridge.

### Faucets (entra) / Sinks (sai ou circula)
- **Entra:** 500 inicial · gotejamento **+50/rodada** (só fase de grupos) · **Bolão** (por acerto) · venda de "bagre" (5 tokens/carta duplicada).
- **Sai/circula:** **Marketplace** (saquinhos) · **Arena** (aposta soma-zero + rake).

### Bolão — vale PONTO e TOKEN (fase de grupos, 72 jogos)
Mesmos valores contam como ponto de ranking **e** como token ganho:
- Placar **exato 10** · Vencedor **+ saldo 7** · **Vencedor 5** · acertou os **gols de um time 1**.
- Trava no apito (Cron 02). Não preencheu → **robô auto-preenche** (lógica odds/ranking).
- `config.pontos_regra = {"exato":10,"vencedor_saldo":7,"vencedor":5,"gol_time":1}` (já existe).

### Bolão — mata-mata (POR FASE, multiplicador sobre 10/7/5/1)
Confronto só abre quando a fase anterior acaba → palpite **por fase**, trava **1h antes de cada jogo**, robô preenche se vazio.
- Rodada de 32 **×1** · Oitavas **×2** · Quartas **×4** · Semi **×8** · 3º lugar **×5** · **Final ×10**.
- `config.mata_mult = {"r32":1,"oitavas":2,"quartas":4,"semi":8,"terceiro":5,"final":10}`.

### Palpites de longo prazo (uma vez; trava no FIM da Rodada 2 = 23/jun)
- Campeão **200** · Vice **150** · 3º **100** · 4º **75** · Artilheiro **100** (só o campeão de gols; top-3 descontinuado em 11/jun).
- Não preencheu até a trava → **robô preenche** pela lógica (ranking FIFA/odds/stats).
- Liquidação no fim do torneio (**Cron 04**).
- `config.longo_prazo = {"campeao":200,"vice":150,"terceiro":100,"quarto":75,"artilheiro":100}`.

### Arena (PvP por soma das notas do XI)
- Aposta fixa **50** cada → pote **100** → vencedor leva **90** (rake **10** = ralo anti-inflação).
- **1 arena garantida por rodada** — os 50 saem do drip (o +50/rodada paga exatamente a arena). Extras: +50 cada.
- Pontos de **ranking**: **vitória 50** (cada, **até 3 batalhas/rodada**) · **derrota 10** (ponto de experiência por ter jogado). Estimula jogar tanto quanto o Bolão.
- **Teto de overall no XI** (anti-monstro): o titular tem que caber num orçamento de nota — não dá pra escalar 11 craques. (calibrar junto do Marketplace.)
- **Matchmaking por força de elenco** (forte pega forte; não esmaga novato).
- `config.arena = {"stake":50,"rake":10,"pts":[50,50,50],"pts_derrota":10,"max_rodada":3,"teto_xi":null}`. (pts = 50 por vitória até 3x; pts_derrota = experiência ao perdedor.)

### Marketplace (saquinhos) — FECHA no fim da fase de grupos
- **Normal 50** (5 cartas, chance base) · **Especial 120** (7 cartas, chance turbinada) · **Lendário 250** (garante 1 top).
- Escassez real = **raridade da carta** (RNG), não o token. Token pode fluir; craque é raro.
- `config.pacotes = {"normal":{"preco":50,"cartas":5},"especial":{"preco":120,"cartas":7},"lendario":{"preco":250,"cartas":1,"garante_top":true}}`.

### Ranking & Pote em dinheiro
- **Geral = Bolão + Arena + Mata-mata + Longo prazo** → define o **Pote de Ouro**.
- Top 3 do Geral dividem o pote: **50% / 30% / 20%** (`config.pote_split = [50,30,20]`).
- Equilíbrio: os 3 blocos têm teto ~500 cada (grupos ~500 / mata-mata ~500 / longo prazo ~525) — ninguém ganha o pote só por uma perna.

### Durações reais (confirmadas no banco)
- R1 **11–17/jun (7d)** · R2 **18–23/jun (6d)** · R3 **24–27/jun (4d, jogos simultâneos)** · Mata-mata **28/jun–19/jul (32 jogos)**.

### Estado de implementação (o que falta construir desta seção)
- [x] Colapsar 3 carteiras → 1 token (banco + UI do header). **FEITO 10/jun** (coluna `usuarios_carteiras.saldo`, header/perfil 1 saldo). Ver MAPA §16.
- [x] Bolão **creditar token** no acerto. **FEITO 10/jun**: motor `pontuacao.ts` (calcPontos 10/7/5/1, testado) + coletor de resultados `scores365.coletarResultados`/`agendarResultados` (por horário do jogo) → credita token (`tipo='premio_bolao'`) + ranking. Ver MAPA §17 e §18.
- [ ] **Marketplace** + saquinhos (Normal/Especial/Lendário) + abrir/fechar por fase. *(próximo — passo 3)*
- [ ] **Arena**: stake/rake, arena garantida, pontos 25/15/8, teto de XI, matchmaking.
- [~] **Mata-mata**: abas previstas no front (Oitavas→Final, travadas). FALTA palpite por fase + multiplicador (Cron por fase).
- [~] **Longo prazo**: **tela/popup de palpite FEITA 10/jun** (botão "Cravar Campeões & Artilheiro", tabela `palpites_longo`, `/jogar/longo`, trava `config.longo_trava`=fim R2). FALTA **Cron 04** de liquidação (200/150/100/75 + 100).
- [ ] **Pote**: cálculo do Geral final + split 50/30/20.

---

## 1. Quem somos e o que estamos construindo

Somos uma dupla de **criadores e programadores de jogos online de última geração**. Construímos um **Hub digital de futebol 100% online**, multiplataforma (navegador, mobile e desktop com a mesma base), em ambiente fechado com **moeda virtual própria (Tokens)**.

O Hub combina quatro vertentes sobre o mesmo ecossistema econômico:

1. **Bolão Tradicional** — palpites obrigatórios, sem risco de perder tokens.
2. **Módulo Bet (opcional)** — apostas com odds reais espelhadas, com risco.
3. **Marketplace & Álbum** — pacotes e figurinhas colecionáveis por posição.
4. **Batalha de Times** — PvP por soma de notas (fase de grupos) que vira o **motor Soccer Infinity** no mata-mata.

**Contexto de mercado:** Copa do Mundo 2026 (EUA, Canadá, México), de **11/jun a 19/jul/2026**. Fase de grupos: **11–28/jun** (12 grupos, 72 jogos, 3 rodadas). Mata-mata (rodada de 32 → final): **28/jun–19/jul**. Existe um produto irmão na pasta (`ALBUM COMPLETO DA COPA`) — o jogo conversa com essa identidade e público.

---

## 2. Plano de lançamento em ondas (o relógio manda)

A fase de grupos começa em 3 dias. Não há tempo de subir o Hub inteiro antes do apito. Construímos em ondas; a Rodada 1 não volta.

| Onda | Prazo | Escopo |
|---|---|---|
| **Onda 0 — MVP** | **até 11/jun** | Cadastro/login, 3 carteiras com saldo inicial, **Bolão tradicional (Etapa 1)**, Cron 02 (trava no apito), Cron 03 (pontuação pós-jogo), ranking básico. |
| **Onda 1** | até Rodada 2 (~17/jun) | Módulo Bet (Etapa 2), Marketplace + unboxing, régua de notas fantasy, pop-up `[ℹ️ Resumo]` com IA (Cron 01). |
| **Onda 2** | até fim dos grupos (~28/jun) | Batalha de Arena (PvP por notas), Referral viral, notificações WhatsApp/Web Push, Cron 04 (palpites de longo prazo). |
| **Onda 3** | mata-mata (28/jun→) | Motor **Soccer Infinity**, chaves eliminatórias, Pote de Ouro final. |

---

## 3. Tokenomics (economia de utilidade coberta)

Saldo inicial de **500 Tokens** no cadastro, fragmentado em três carteiras de permissões isoladas para evitar "falência" no dia 1:

| Carteira | Saldo inicial | Uso exclusivo |
|---|---|---|
| **Colecionador** | 200 | Compra de pacotes de figurinhas no Marketplace |
| **Apostas** | 200 | Alocação de palpites no módulo Bet |
| **Arena** | 100 | Desafiar usuários em batalhas PvP |

**Recarga por rodada (gotejamento, só na fase de grupos — 3 rodadas):** +50 tokens/rodada → `+20 Colecionador`, `+20 Apostas`, `+10 Arena`.

**Antiautofalência:** se Arena ou Apostas zerar, o usuário vende figurinhas repetidas/baixo nível ("bagres") de volta ao sistema por **5 tokens cada**, escolhendo a carteira de destino. *Regra de proteção: só duplicadas, com limite/cooldown a definir para evitar exploit.*

**Congelamento:** ao fim do último jogo da fase de grupos, o Marketplace fecha permanentemente e o saldo congela. O mata-mata roda sobre os elencos já montados.

---

## 4. Stack tecnológica (Web moderna JS/TS) + VPS própria

| Camada | Tecnologia | Por quê |
|---|---|---|
| Linguagem | **TypeScript** (front e back) | Tipagem forte, contrato único |
| Frontend / UI | **React** + **Vite** | Rápido, multiplataforma via web |
| Animações (unboxing, efeitos) | **PixiJS** / CSS+Canvas | Performático no navegador |
| Mobile/Desktop | **PWA** primeiro; Capacitor/Tauri se preciso | Mesma base |
| Backend / API | **Node.js** + **Fastify** | TS ponta a ponta |
| Tempo real | **Socket.IO** (ranking ao vivo, Arena) | — |
| **Banco de dados** | **PostgreSQL self-hosted na VPS** | Tudo na nossa infra, via MCP (`sql_local`) |
| Motor de batalha | **Python** (Soccer Infinity, microserviço) | Cálculo isolado, determinístico, testável |
| Agendamento | **Cron** na VPS (scripts Python) | Custo zero de infra |
| IA (resumos/arte) | LLM via API (resumo 3 linhas) + **Nano Banana Pro** (molduras) | Cacheado no banco; custo só no batch |

> **Mudança vs. versão anterior:** abandonamos Supabase. Tudo é criado e operado **diretamente na VPS** (banco, arquivos, serviços, cron) via MCP. Acesso a arquivos, git, SQL local e gestão de serviços disponível por ferramentas MCP.

**Fontes de dados externas:** **API-Football** (estatísticas/placares/escalações) e **The-Odds-API** (odds). Chaves só em variável de ambiente — **nunca** no código/git. *Validar cotas do free tier contra ~72 jogos antes de prometer custo zero.*

---

## 5. Arquitetura

```
[ Cliente Web/PWA (React + PixiJS) ]
            │  HTTPS / WebSocket
            ▼
[ API Node.js/TS (Fastify) ]  ── auth, carteiras, bolão, bet, marketplace, ranking, arena
            │                  │
            ▼                  ▼
   [ PostgreSQL (VPS) ]   [ Microserviço Python — Soccer Infinity (mata-mata) ]
            ▲
            │  (cron na VPS)
[ Scripts Python agendados ] ── API-Football + The-Odds-API + LLM → grava no banco local
            │
            ▼
[ Motor de notificações (WhatsApp Business API + Web Push) ]
```

---

## 6. Cron Jobs (núcleo de custo zero)

| Job | Quando | O que faz |
|---|---|---|
| **Cron 01** | Madrugada (diário) | Lê estatísticas frias dos jogos do dia seguinte → manda JSON ao LLM → salva resumo de 3 linhas (PT) no banco. Pop-ups `[ℹ️ Resumo]` leem do banco (zero token de IA em tempo real). |
| **Cron 02** | 30 min antes | Pux