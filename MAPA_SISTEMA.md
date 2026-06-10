# MAPA DO SISTEMA — Bolão da Copa 26

> **Documento central de orientação.** Onde está tudo, como mexer, o que existe e o que falta.
> Leia junto com [[CLAUDE.md]] (regras de produto/stack) e [[HANDOFF_FABRICA.md]] (detalhe da Fábrica).
> **Última atualização:** 9 de junho de 2026.

---

## 0. TL;DR — como retomar em 30 segundos

1. App **`bolao-copa26`** roda na **VPS Oracle** (`escola-parque-v3`), sob **systemd**, Node+Fastify+TypeScript via **tsx** (sem build).
2. Editar `.ts`/`.py` **na VPS via MCP** (`ler_arquivo` / `escrever_arquivo`) → `servico restart bolao-copa26`.
3. Banco dedicado **`bolao_copa26`** (Postgres local da VPS). Consultas via `sql_local` com `banco=bolao_copa26`.
4. Admin no navegador: `oracle-vipworks.duckdns.org/bolao-copa26/admin`.
5. **NÃO reescrever** `figurinhas_admin.ts` (52KB). Os demais `.ts` são pequenos e seguros de reescrever.

---

## 1. Infraestrutura e acesso

| Item | Valor |
|---|---|
| Servidor | VPS Oracle, hostname `escola-parque-v3` (ARM64) |
| Pasta do app | `/home/ubuntu/bolao-copa26/` |
| Runtime | Node + **tsx** (roda `.ts` direto, sem compilar) |
| Processo | systemd `bolao-copa26.service` (enabled, auto-restart) |
| Porta / host | `PORT=8510`, `HOST=127.0.0.1` (atrás de proxy em `/bolao-copa26/`) |
| URL pública | `oracle-vipworks.duckdns.org/bolao-copa26/` |
| Admin | `…/bolao-copa26/admin` |
| Banco | Postgres local, base **`bolao_copa26`**, user `innova_worker` |
| Acesso do Claude | **só via MCP** — sem sudo, sem shell. Ferramentas: `ler_arquivo`, `escrever_arquivo` (faz `.bak`), `sql_local`, `servico`, `logs`, `recursos`, `git`, `listar_pastas` |

**Ciclo de edição padrão:** `ler_arquivo` → `escrever_arquivo` (gera `.bak` automático) → `servico restart bolao-copa26` → `logs` para conferir.

**Segredos:** chaves de API ficam só em `.env`/banco (`llm_provedores.api_key`), nunca no código/git.

---

## 2. Banco de dados `bolao_copa26` (15 tabelas)

| Tabela | Colunas | Uso |
|---|---|---|
| `usuarios` | id, email, senha_hash, nome, telefone, codigo_referral, referido_por, consent_whatsapp, criado_em, **papel** | Contas. `papel='admin'` libera o /admin. |
| `usuarios_carteiras` | usuario_id, saldo_colecionador, saldo_apostas, saldo_arena, atualizado_em | 3 carteiras isoladas (200/200/100). |
| `transacoes_tokens` | id, usuario_id, carteira, valor, saldo_apos, tipo, referencia, criado_em | Ledger auditável de tokens. |
| `sessoes` | token, usuario_id, expira, criado_em | Sessões de login (Bearer). |
| `palpites_bolao` | id, usuario_id, jogo_id, placar_casa, placar_visitante, pontos, criado_em, atualizado_em | Palpites do bolão tradicional. |
| `jogos` | id, api_fixture_id, fase, rodada, selecao_casa, selecao_visitante, inicio, status, placar_casa, placar_visitante, **odds (jsonb)**, **resumo_ia**, criado_em | Partidas, odds e resumo do Cron 01. |
| `jogadores` | id, fd_id, nome, posicao, selecao, nascimento, raridade, criado_em, altura_m, peso_kg, clube, **figurinha** | Elencos (1249 linhas, 48 seleções ×26). |
| `figurinhas` | id, tipo, selecao, nome, raridade, **jogador_id**, imagem, orientacao, criado_em, origem | Cartas (712 linhas). Liga ao jogador por `jogador_id`. |
| `jogadores_stats` | jogador_id, jogos, gols, assistencias, nota_fantasy, atualizado_em | Régua de notas (Cron 03). |
| `ranking` | usuario_id, pontos_bolao, pontos_arena, atualizado_em | Ranking acumulado. |
| `llm_provedores` | id, provedor, modelo, api_key, base_url, **papel**, **em_uso**, ultimo_teste, criado_em | Pool de LLM/imagem. `papel='imagem'` + `em_uso=true` = motor da Fábrica. |
| `precos_modelos` | id, modelo, provedor, preco_in, preco_out, preco_cache, arquivado, atualizado, preco_imagem | Biblioteca de preços US$/1M e US$/imagem. |
| `gastos_log` | id, ts, origem, modelo, processo, tokens_in/out/cache, custo_usd, custo_brl, tempo, imagens | Log de gastos de IA (`registrarGasto`). |
| `custos_meta` | chave, valor | Metadados de custo (ex.: cotação do dólar). |
| `config` | chave, valor, atualizado_em | **Chave-valor geral.** Ex.: `prompt_fig_base`, `estilo_carta`. |

> Dado-chave para a Fábrica: `jogadores.selecao` está em **inglês** (Argentina, Germany, South Africa…). As pastas de figurinhas estão em **português** (ARGENTINA, ALEMANHA, AFRICA). O dict `ALIAS` em `cartas.ts` faz a ponte.

---

## 3. Arquivos na VPS (`/home/ubuntu/bolao-copa26/`)

### Backend TS (registrados no `server.ts`, nesta ordem)

| Arquivo | Responsabilidade |
|---|---|
| `server.ts` | Entry point. Fastify, CORS, parser JSON, hook que injeta menu + botão "FIGURA DEFAULT" na tela legada `/admin/figurinhas`. Rotas globais: `GET /health`, `GET /ranking`. Registra todos os módulos abaixo. |
| `db.ts` | `pool` do Postgres + `pingDb`. |
| `auth.ts` | Sessões/login, `usuarioDaReq`, checagem de admin. |
| `usuarios.ts` | Cadastro/conta/carteiras do jogador. |
| `landing.ts` | Página pública / landing. |
| `admin.ts` | Hub admin (entrada do painel). |
| `elencos.ts` | Importação de elencos (football-data `/competitions/WC/teams`) → `jogadores`. **POST de importação fica aqui.** |
| `imagens.ts` | Serviço/rotas de imagens (figurinhas cruas etc., ex.: `/fig/raw/...`). |
| `figurinhas_admin.ts` | **52KB — NÃO reescrever.** Tela `/admin/figurinhas`: corte da grade 4×4 do PDF, OCR, casamento OCR↔elenco. |
| `llm.ts` | Pool de provedores LLM (CRUD `llm_provedores`). |
| `config_hub.ts` | `/admin/config-hub`: abas APIs, LLMs, Custos, Motor de Imagem, Cortes, Banco. |
| `custos.ts` | `registrarGasto`, biblioteca de preços, cotação do dólar, log de gastos. |
| `tokenomics.ts` | `/admin/tokenomics`: economia + logs de IA. |
| `criador_fig.ts` | `/admin/criador-fig`: base sem-foto (Local rembg descartado + nano banana). |
| `cartas.ts` | **FÁBRICA `/admin/cartas`** (detalhe na seção 5). |
| `ui.ts` | Menu lateral único (`sideHtml`, `NAV_CSS`, `NAV_JS`, `injetarMenu`). |

### Scripts Python (chamados via `pexec` pelo TS)

| Arquivo | Função |
|---|---|
| `compor_nome.py` | Escreve nome (faixa de cima) + posição (faixa de baixo) na base, **nativo Pillow**. Estilo configurável: caps/bold/cor por campo. |
| `silhueta.py` | Geração de silhueta (base sem-foto local). |
| `cortar_pdf.py` | Corte da grade 4×4 do PDF do álbum. |
| `gerar_figurinhas.py` | Pipeline de figurinhas. |
| `ocr_folder.py` / `prep_folder.py` | OCR e preparo das pastas de tiles. |

### Dados / pastas
- `figurinhas/<TIME>/` — tiles `NN.png`, `_ocr5.json`, `_tipo.json`, e os moldes `_base_jogador.png` / `_base_goleiro.png` + cartas finais `_carta_<NOME>.png`.
- Zips de backup (no folder local **BOLAO DA COPA**): `figurinhas_copa48.zip`, `figurinhas_jogadores.zip`, `figurinhas_alta.zip`.

---

## 4. Endpoints conhecidos

**Globais (`server.ts`):** `GET /health`, `GET /ranking`.

**Fábrica (`cartas.ts`) — documentados 100%:**

| Método | Rota | O que faz |
|---|---|---|
| GET | `/admin/cartas` | Página da Fábrica (HTML). |
| GET/POST | `/admin/cartas/prompt` | Lê/salva `prompt_fig_base` (config). |
| GET | `/admin/cartas/times` | Lista pastas de `figurinhas/`. |
| GET | `/admin/cartas/estado?time=&selecao=` | Tiles, se tem base jogador/goleiro, seleção detectada e **lista de jogadores SEM figurinha**. |
| POST | `/admin/cartas/subir` | Sobe base externa PNG (`_base_<tipo>.png`). |
| POST | `/admin/cartas/nano` | Gera base via nano banana (Gemini image) usando `prompt_fig_base` + tile-ref. |
| POST | `/admin/cartas/lote` | Gera as cartas selecionadas (chama `compor_nome.py` por jogador). |
| GET | `/fig/cartabase/:time/:tipo` | Serve a base. |
| GET | `/fig/cartafinal/:time/:arq` | Serve a carta final. |

> Endpoints dos outros módulos (auth, usuarios, elencos, config_hub, etc.) **ainda não inventariados** — ler o arquivo correspondente quando precisar. Não inventar caminhos.

---

## 5. Fábrica de Figurinhas (`/admin/cartas`) — fluxo

1. **Escolhe a pasta (seleção)** no dropdown. O back detecta o elenco (EN) via `ALIAS` + match na lista real de `jogadores.selecao`.
2. **Moldes do time:** Jogador (ref = tile `08.png`) e Goleiro (ref = 1º tile de jogador). Gera pelo **nano banana** (prompt editável) OU **sobe PNG** do flow. Salva `_base_jogador.png` / `_base_goleiro.png` por pasta.
3. **Lista "jogadores SEM figurinha"** (checkboxes, marcar/desmarcar todos). Query: `jogadores LEFT JOIN figurinhas` onde `figurinha IS NULL OR raridade='gerada'`.
4. **"Gerar selecionados"** → `compor_nome.py` escreve nome+posição **nativo** no molde certo (goleiro/jogador) → salva `_carta_<NOME>.png`.

**Decisões fixas:** base = nano banana (1× por time, reusa); texto = **Pillow grátis** (LLM borra texto). Prompt vencedor salvo em `config.prompt_fig_base`.

---

## 6. Estado atual (em andamento) ⚠️

Sessão de 09/jun parou aqui (pivot para documentação):

- ✅ **Elencos importados** — 1249 jogadores, 712 figurinhas. Lista "sem figurinha" enche (ex.: Argentina 10, South Africa 12). Mapeamento `ALIAS` OK.
- ✅ **`compor_nome.py` atualizado** — agora aceita por campo: `nome_caps`, `nome_bold`, `nome_cor`, `pos_caps`, `pos_bold`, `pos_cor` (cor `#rrggbb` ou `[r,g,b]`; escolhe fonte bold/regular). **Defaults:** nome = branco/CAPS/Bold; posição = branco/CAPS/sem Bold.
- ⏳ **`cartas.ts` PENDENTE** (não aplicado ainda) — falta:
  1. **Painel "Padrão do texto" editável** (lado direito): Nome → cor + CAPSLOCK + Bold; Posição → cor + CAPSLOCK + Bold. Salvar em `config.estilo_carta`; `lote` lê e passa pra cada `compor_nome.py`. Endpoints `GET/POST /admin/cartas/estilo`.
  2. **Botão X sobre o molde** para **apagar a base** e gerar outra. Endpoint `POST /admin/cartas/apagar-base` (`unlink` do `_base_<tipo>.png`).

> Próxima sessão começa aplicando esses 2 itens no `cartas.ts` (reescrita limpa do arquivo — ele é pequeno, ~9KB) e `servico restart`.

---

## 7. Roadmap (ondas) — pendências macro

Da estratégia em [[CLAUDE.md]] §2:

- **Onda 0 (MVP, até 11/jun):** cadastro/login ✅(base), 3 carteiras ✅(schema), **Bolão tradicional** (palpites/ranking) ⏳, Cron 02 (trava no apito) ❌, Cron 03 (pontuação pós-jogo) ❌, ranking básico ⏳. **Hub PIX / área do jogador** ❌.
- **Figurinhas / Fábrica:** núcleo pronto; faltam avatar com foto real do jogador, goleiros sem tile, esconder botões legados da toolbar (Cortar/Preencher/OCR num "…").
- **Onda 1+:** módulo Bet, Marketplace+unboxing, Arena PvP, referral, notificações, Soccer Infinity. (ver CLAUDE.md)

---

## 8. Glossário ALIAS (pasta PT → seleção EN)

`AFRICA→south africa, ALEMANHA→germany, ARABIA→saudi, ARGELIA→algeria, BELGICA→belgium, BOSNIA→bosnia, BRASIL→brazil, CROACIA→croatia, EGITO→egypt, EQUADOR→ecuador, ESCOCIA→scotland, ESPANHA→spain, HOLANDA→netherlands, INGLATERRA→england, MARFIM→ivoir, MARROCOS→morocco, MEXICO→mexico, NORUEGA→norway, PARAGUAI→paraguay, SUECIA→sweden, SUICA→switz, TCHEQUIA→czech, TURQUIA→turk, URUGUAI→uruguay, USA→united stat, …`
(lista completa no topo de `cartas.ts`.)

---

## 9. Modelo Figurinhas / Escalação (figurinhas_admin.ts) — APRENDIDO

> `figurinhas_admin.ts` tem 52KB numa linha só → **não dá pra reler/reescrever** pelo MCP. Documentar tudo aqui é obrigatório.

**Como a Escalação decide REAL × silhueta:**

    real = Boolean(jogadores.figurinha)   // coluna jogadores.figurinha preenchida = REAL (verde)

A imagem mostrada é `jogadores.figurinha` (ex.: `cards/158.png`), servida em `/fig/cards/<id>.png` (`imagens.ts`, só aceita `\d+\.png`).

**Atribuir uma figurinha a um jogador (o que o "atribuir"/"Preencher automatico" faz):**

    DELETE FROM figurinhas WHERE jogador_id=$id AND tipo='jogador';
    UPDATE jogadores SET figurinha='cards/<id>.png' WHERE id=$id;
    INSERT INTO figurinhas (tipo,selecao,nome,jogador_id,imagem,raridade,origem)
      SELECT 'jogador',selecao,nome,id,'cards/<id>.png','comum',<origem> FROM jogadores WHERE id=$id;

Convenção da imagem: **`cards/<jogador_id>.png`** (arquivo em `figurinhas/cards/`).

**Lista de recortes ("Figurinhas recortadas"):** `readdir(figurinhas/<TIME>/).filter(f => /\.png$/i.test(f))` — pega **TODO .png da raiz da pasta do time**. Por isso `_base_*.png` e `_carta_*.png` da Fábrica **vazavam** pra essa lista. (`_carta` nem é tratado lá; `_base` não aparece no arquivo.)

**Endpoint de import de elenco:** `POST /admin/elencos/importar` (em `elencos.ts`, football-data WC/teams). `/admin/jogadores` lista jogadores+status.

## 10. "Enviar pro plantel" (Fábrica) — estado atual

`POST /admin/cartas/enviar-escalacao {time,selecao}`: por jogador da seleção **sem `figurinha`**, se existe `_carta_<slug>.png`, copia pra `cards/<id>.png`, faz `UPDATE jogadores SET figurinha` + insere figurinha `raridade='evento'`. Atribuição completa = aparece REAL na hora, sem ajustar um a um. Não sobrescreve quem já tem figurinha.

Limpeza feita à mão p/ times já enviados antes do fix:
`UPDATE jogadores j SET figurinha=f.imagem FROM figurinhas f WHERE f.jogador_id=j.id AND f.raridade='evento' AND (j.figurinha IS NULL OR j.figurinha='');`

## 11. PENDÊNCIA ATUAL — subpasta `_fab` (bases não devem aparecer nos recortes)

**Decisão:** Fábrica passa a salvar `_base_*` e `_carta_*` em **`figurinhas/<TIME>/_fab/`** (subpasta). O `readdir` de recortes do figurinhas_admin só lista `.png` da raiz → não enxerga subpasta → modelos somem da tela de figurinhas e seguem reusáveis. Migração automática dos arquivos antigos (mover raiz→`_fab`) ao abrir o time no `estado`. Editar só `cartas.ts` (paths + serving + migrarFab); `figurinhas_admin.ts` fica intocado.

---

## 13. MAPA COMPLETO DE MÓDULOS E ENDPOINTS (lido em 09/jun)

Cada tela = arquivo único (lógica + página HTML), registrado na ordem em `server.ts`. Auth admin (`admOk`) repetida em vários: `x-admin-token === ADMIN_TOKEN` **OU** usuário logado `papel='admin'` (Bearer em `authorization`).

**Públicos / auth**
- `db.ts` — `pool` Postgres + `pingDb()`. Sem rotas. Env `PG*`, db `bolao_copa26`, user `innova_worker`.
- `auth.ts` — login senha (scrypt) + Google OAuth. `usuarioDaReq(req)`. Rotas: `POST /login`, `POST /logout`, `GET /me`, `GET /auth/google/clientid`, `POST /auth/google`. Sessão = token hex 24b, 7 dias, tabela `sessoes`. Cria jogador (carteiras 200/200/100 + ledger `cadastro` + ranking).
- `usuarios.ts` — `POST /usuarios` (cadastro, transação), `GET /usuarios/:id/carteiras`. Suporta referral.
- `landing.ts` — `GET /` (landing HTML pública, login/cadastro/Google).

**Admin core**
- `admin.ts` — painel + APIs base. `GET /admin` `/admin/` (HTML), `GET/POST /admin/config`, `GET /admin/status`, `GET /admin/ping?alvo=db|jogos|odds`, `GET /admin/usuarios`, `GET /admin/ranking`, `GET /admin/jogos`, `POST /admin/jogos/importar` (football-data WC/matches → upsert `jogos`). Config secreta retorna só `<chave>_set`. Chaves: `api_football_*`, `odds_api_key`, `football_data_token`, `google_client_id`, `llm_*`, `corte_grade`.
- `ui.ts` — menu lateral (`NAV_CSS`, `sideHtml`, `NAV_JS`, `injetarMenu`). `_b()` deriva prefixo base. Sem rotas.

**LLM / Custos / Economia**
- `llm.ts` — pool de provedores. `chamarLLM(prompt,papel,ctx)`. `GET /admin/llm?papel=`, `POST /admin/llm/{modelos,testar_params,del,usar,testar}`, `POST /admin/llm`. Tabela `llm_provedores`. Gemini + OpenAI-compat.
- `custos.ts` — preços + ledger IA + dólar. `GET /admin/custos/dados`, `POST /admin/precos/{salvar,arquivar,del,catalogo,dolar}`, `POST /admin/custos/zerar`. Tabelas `precos_modelos`, `gastos_log`, `custos_meta`. `registrarGasto`/`garantirPreco`/`dolarAtual`. Auto-migra no bo
---

## 16. Token único (Beta 1.0) — PASSO 1 FEITO (10/jun, commits 97eba2e + 8805e0f)

Colapso das 3 carteiras → 1 saldo. Regra fechada em CLAUDE.md §0.1.

**Banco `bolao_copa26`:**
- `usuarios_carteiras`: nova coluna **`saldo integer NOT NULL DEFAULT 500`** (fonte da verdade). Migração: `saldo = saldo_colecionador+saldo_apostas+saldo_arena`. As 3 colunas antigas **ficam dormentes** (não são mais lidas; mantidas por segurança/histórico).
- `transacoes_tokens`: ledger passa a usar **`carteira='token'`**. Dois CHECKs precisaram de ajuste (achados por teste antes de quebrar usuário):
  - `transacoes_tokens_carteira_check` → agora aceita `{token,colecionador,apostas,arena}`.
  - `transacoes_tokens_tipo_check` (já existia) só aceita `{cadastro,recarga_rodada,referral,gasto_pacote,aposta,premio_aposta,venda_bagre,arena,ajuste}` → usar **`referral`** (NÃO `indicacao`) no crédito de indicação. (O código antigo usava 'indicacao' e o insert falhava silencioso no try/catch.)

**Código (arquivos pequenos, deploy clone→push→VPS pull+restart):**
- `auth.ts`/`usuarios.ts` cadastro: 1 saldo (default 500) + ledger `('token',500,500,'cadastro')`. Retorno `carteiras:{saldo:500}`.
- `jogar.ts` `/jogar/dados`: lê `SELECT saldo`; retorna `carteiras:{saldo}` (mantida a chave `carteiras` p/ `setProfile(me,c,full)` usar `c.saldo`).
- `jogar_page.ts`: header e perfil mostram 1 saldo (ids **`w-saldo`** / **`p-saldo`**); dash `d-saldo` = `c.saldo`.
- `indicacao.ts`: `creditarTokens(uid, valor, tipo)` → `UPDATE ... saldo=saldo+$2`, ledger 1 linha `'token'`. Recompensa de indicação = **+50** tipo `referral`.
- `tokenomics.ts`/`_page.ts`: total = `sum(saldo)`; removido o breakdown col/apo/are.
- `pagamento.ts`: no-op de "touch" trocado p/ `SET saldo=saldo`.

**PENDENTE / próximos:** drip **+50/rodada** (somar no `saldo`, tipo `recarga_rodada`) ainda não existe no código. Passo 2 (Bolão creditar token no acerto) vai precisar de um **tipo novo no CHECK** (ex.: adicionar `premio_bolao`) antes de inserir no ledger.

---

## 17. Pontuação do Bolão + Coletor de resultados — PASSO 2 FEITO (10/jun, commit 343f570)

Bolão agora paga **ponto E token** no acerto (regra CLAUDE §0.1). Motor + coletor automático.

**`pontuacao.ts` (novo):**
- `calcPontos(pc,pv,rc,rv,regra)` — PURA, testada (11/11). Camadas (vale a MAIOR): exato 10 · vencedor+saldo 7 (só quando NÃO é empate) · vencedor/empate 5 · acertou gols de 1 time 1 · senão 0. Regra vem de `config.pontos_regra`. (Empate com placar diferente = 5, não 7.)
- `apurarJogo(id)` / `apurarPendentes()` — **idempotentes**: `jogos.apurado` trava re-apuração; `palpites_bolao.creditado` trava re-crédito de token. Credita token = pontos no ledger (`tipo='premio_bolao'`, `referencia='jogo:<id>'`) e recalcula `ranking.pontos_bolao = sum(pontos)`.

**`scores365.ts` — `coletarResultados(force)`:** por jogo com `odds->>'gid'` e `resultado_casa IS NULL`, lê placar final no 365 (`game.homeCompetitor.score`), define orientação pelo nome (`al`/`casaLado`), grava **`jogos.resultado_casa/visitante` + `status='final'`** e dispara `apurarJogo`. "Terminou" = `statusFinal365` (statusText/statusGroup) OU `inicio < now-150min`, sempre com placar presente. Engatado no **`agendadorDiario`** (boot +12s e a cada 20min). Rotas admin: `POST /admin/bolao/{coletar,apurar,resultado}`, `GET /admin/bolao/status`.

**Banco:** CHECK `transacoes_tokens.tipo` += `premio_bolao`; CHECK `jogos.status` += `final`; novas cols `jogos.apurado`/`jogos.resultado_em`/`palpites_bolao.creditado`.

**DISTINÇÃO DE COLUNAS (importante):**
- `jogos.placar_casa/visitante` = **PALPITE/preview do admin** (tela `/admin/jogos-placar`, `status='encerrado'`). NÃO é resultado real.
- `jogos.resultado_casa/visitante` = **RESULTADO REAL** (coletor, `status='final'`). A apuração compara `palpites_bolao` × `resultado_*`.

**Quirks / pendências:**
- `calcClassificacao` (aba Copa) ainda usa `placar_*` (palpite), não `resultado_*` → a classificação dos grupos ainda não reflete o resultado real. (corrigir depois)
- A tela do jogador ainda não mostra "quantos pontos fiz por jogo" — só **saldo (header) e ranking** atualizam após a apuração.
- Correção manual de resultado (`/admin/bolao/resultado`) re-apura, mas token é **one-shot por palpite** (`creditado`): não estorna/reajusta crédito antigo.
- Drip **+50/rodada** ainda não existe no código.
