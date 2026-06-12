# MAPA DO SISTEMA — Bolão da Copa 26

> **Documento central de orientação.** Onde está tudo, como mexer, o que existe e o que falta.
> Leia junto com [[CLAUDE.md]] (regras de produto/stack) e [[HANDOFF_FABRICA.md]] (detalhe da Fábrica).
> **Última atualização:** 10 de junho de 2026 (CSS extraído p/ `jogar_style.ts` — ver §20).

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

---

## 18. Ajustes 10/jun (tarde): coletor por horário, ranking e Copa em abas (commits 861cb90, 73e761b)

- **Coletor de resultados agora é POR HORÁRIO** (não mais poll de 20min). `scores365.agendarResultados()` arma um `setTimeout` por jogo em `inicio + 115min`; se não terminou (prorrogação/pênaltis) re-tenta a cada 5min até ~16x. Janela de 26h (evita overflow do setTimeout); re-armado no boot, de hora em hora e após o `refreshDiario`. Boot faz catch-up dos jogos já passados. (sem crontab do SO — o MCP não edita crontab.)
- **Ranking #1**: `.rkrow.top1` agora usa a cor da aba (`--rkc`, via `color-mix`) com borda+glow — antes era um amarelo fixo apagado. Vale p/ Geral(verde)/Bolão(amarelo)/Arena(vermelho).
- **Copa do Mundo em ABAS** (`#copa-tabs`, reusa `.tab/.tabs`): **Grupos** (tabelas **2 por linha**, `.gcols` grid), **Calendário** (todos os jogos de grupos por rodada, mostra placar real quando houver), **Artilheiros** e **Eliminatórias** = "em breve" (faltam feed de gols e a chave).
- **`/jogar/copa`**: classificação agora calculada a partir do **resultado real** (`resultado_casa/visitante` aliasado p/ placar_casa/visitante em `calcClassificacao`) e passa a devolver `calendario` (todos os jogos de grupos, com rodada e placar real). Isso corrige o quirk da §17 para a tela do jogador.

Pendências Copa: aba **Artilheiros** (usar stats/FC26 até ter gols reais) e **Eliminatórias** (montar/reusar a chave).


---

## 19. Longo prazo (palpite) + Calendário em cards — 10/jun (commits c25dfd2, d7aaf34)

- **Calendário (Copa)**: cards por jogo reusando `.jogo`+`.gtab` (faixa do grupo) + corpo enxuto (bandeira/nome/placar/horário), agrupado por DIA (cabeçalho `.diah`), **2 por linha** (`.gcols`). `/jogar/copa` agora também devolve `grupo` por jogo (via `mapaGrupos`).
- **Palpites de longo prazo**: botão dourado **"Cravar Campeões & Artilheiro"** no fim da barra de abas do Bolão → popup (`modal()`) com Campeão/Vice/3º/4º (selects de seleção) + Artilheiro (input com `datalist` dos jogadores). Tabela **`palpites_longo`** (usuario_id PK, campeao/vice/terceiro/quarto [EN], artilheiro_id/nome). Endpoints **`GET/POST /jogar/longo`**. Trava em `config.longo_trava` (default `2026-06-23T23:59:00-03:00` = fim R2); depois fica só-leitura. **FALTA Cron 04** de liquidação dos pontos (Campeão 200/Vice 150/3º 100/4º 75 + Artilheiro 100/60/40).

**Pendências de UX pedidas:** **Página de Regras** no front (aba Início + botão no menu do topo) — a fazer. Cache: a tela `/jogar` é `no-store`; se UI 
---

## 21. Correções UI + Aba REGRAS no admin — 10/jun (commits c62841d, 815dde8, b3be005)

- **Título "PALPITES CONCLUÍDOS"**: estava centralizado por COLISÃO de classe — `full` (título a 100%) batia com pill genérico `.full{display:inline-flex;padding;margin-left}`. Fix: renomeado pra `slfull`. LIÇÃO: classes genéricas (`full`/`done`) precisam de prefixo.
- **Selos "Em breve"/"Grátis" da sidebar**: `margin-left:auto` não bastava; solução = envolver rótulo em `<span class="lbl">` com `flex:1 1 auto`+ellipsis. "Marketplace" trunca p/ "Marketpl…".
- **Aba REGRAS (admin, `?pg=regras`)** — NOVA, separada de Integrações: `ui.ts` nav `regras`; `admin.ts` `GET/POST /admin/regras` (whitelist REGRA_KEYS, valida JSON, upsert no config); `admin_page.ts` seção `pg-regras` editável (pontos_regra, mata_mult, longo_prazo+trava, arena, pacotes, pote_split) via `loadRegras()`/`salvarRegra()`. Grava no config, vale na hora. OBS: "Tabela de pontos" read-only ainda duplicada em Integrações — remover depois.
- **CLAUDE.md §0.1:** arena `pts:[50,50,50]`+`pts_derrota:10` (era 25/15/8).

---

## 22. Fluxo de trabalho com o Claude — Chrome ao vivo, deploy, specs (10/jun)

### 22.1 Claude no Chrome (inspeção AO VIVO) — usar SEMPRE que for visual
- **O que é:** extensão "Claude in Chrome" no navegador do dono, logada na mesma conta. Conectada, aparece em `list_connected_browsers` como "Browser N". **Manter conectada entre sessões.**
- **O que o Claude faz com ela:** abre uma **aba própria** (não mexe nas suas), navega pra qualquer URL do app, lê o **DOM e o estilo COMPUTADO real**, mede posição de elementos em px, roda JS de inspeção. Resumo: vê exatamente o que o usuário vê.
- **REGRA:** qualquer bug visual/layout → **inspecionar no Chrome ANTES de teorizar/deployar**. Sem isso vira "chute → deploy → pedir print", que custou horas (ex.: alinhamento da sidebar). Com isso: minutos.
- **Sessão logada:** localStorage é compartilhado por origem no mesmo perfil. Se o dono está logado no admin (`localStorage.sessao`), a aba do Claude na mesma origem **já herda a sessão** e o `conectar()` roda sozinho → dá pra testar fluxo de salvar etc. (Claude pede OK antes de ação que grava/altera dados.)
- **Por que não há "navegador do servidor":** o sandbox do Claude **não baixa o Chromium** (rede bloqueada nos hosts de binário) e **não tem sudo/apt**. Por isso a inspeção visual depende da extensão no Chrome do dono. (Verificado em 10/jun.)
- **NÃO confiar só na leitura estática do CSS** pra bug visual: a cascata real tem colisões (ex.: classe `full`, `margin-left:auto` que não surte efeito). Medir no Chrome é a verdade.

### 22.2 Deploy (regra de ouro — processo zumbi)
clone sandbox (`$HOME/work`, não `/tmp` que vira `nobody`) → `python3` com `assert count==1` → `npx esbuild arquivo.ts --outfile=/dev/null` → `git push` → VPS `git pull` (confirmar "Updating X..Y") → `servico restart bolao-copa26` → `logs` e **CONFERIR PID NOVO** + "Server listening 8510". "ok" do restart não basta. Edit/Write corrompem `.ts` grandes nesses mounts.

### 22.3 Onde editar o quê
- **Estilo do app jogador** → `jogar_style.ts` (CSS extraído, arquivo pequeno).
- **Regras/economia** → aba **Regras** do admin (`?pg=regras`), grava em `config`, vale na hora (sem deploy).
- **Spec de tarefa** → `SPEC_TEMPLATE.md` (5 linhas por tarefa antes de começar).

### 22.4 O que ainda destrava mais (pendências de setup)
- [ ] **Manter Chrome conectado + dono logado no admin** → Claude testa fluxos completos ao vivo (abrir→editar→salvar→conferir), não só render.
- [ ] **Conta de teste do jogador** logada no Chrome → testar `/jogar` end-to-end.
- [ ] **Rotacionar o PAT do GitHub** (texto puro em `.git/config`) — higiene de segurança.
- [ ] **Crontab real**: hoje os crons são `setTimeout` no processo (re-armam no boot); MCP não edita crontab do SO. Avaliar se precisa de cron de verdade.

---

## 23. Aba RESULTADOS (reais) + Classificação real — 10/jun (commit 5c749b8)

- **Distinção que confundia:** `jogos.placar_*` (status `encerrado`) = **palpite-base do admin** (tela Jogos & Placar, alimenta o robô de palpite). `jogos.resultado_*` (status `final`) = **RESULTADO REAL** (coletor `scores365` no horário do jogo). A apuração compara `palpites_bolao` × `resultado_*`.
- **Nova aba `/admin/resultados`** (`resultados_page.ts`, nav `resultados` 🏁): lista todos os jogos com o resultado REAL + status + apurado, painel do coletor (apurados / aguardando) e botões **Coletar agora** (`POST /admin/bolao/coletar`) e **Re-apurar pendentes** (`/admin/bolao/apurar`). Correção manual por jogo → `POST /admin/bolao/resultado {jogo_id,rc,rv}` (grava resultado_*, status=final, re-apura). Endpoint de lista: `GET /admin/resultados/dados` (em `jogos_placar.ts`).
- **Classificação do admin** (`/admin/classificacao/dados`) agora calcula de **`resultado_*` real** (aliased p/ placar em `calcClassificacao`), não mais do palpite-base. Texto do cabeçalho atualizado.
- **Estado em 10/jun (pré-Copa):** 72 jogos de grupos, **0** resultados reais (1º jogo 11/jun 16:00 — normal). **GID 365 cobre só 46/72** → os outros 26 NÃO serão coletados automaticamente até mapear o gid (`mapearGameIdsSeFlag` em scores365). Pendência: completar o mapeamento de gid pros 72.

---

## 24. Resultados em 3 abas (Jogos/Classificação/Artilharia) — 10/jun (commit 80c72a5)

- `/admin/resultados` (`resultados_page.ts`) virou **3 abas** (tabs client-side, 1 página): **Jogos** · **Classificação** · **Artilharia**. Barra do coletor (apurados/pendentes + Coletar/Re-apurar) fica no topo, global.
- **Jogos:** chips de fase (Fase de grupos / Rodada de 32 / Oitavas / Quartas / Semi / 3º-4º / Final). Só **grupos** tem dados hoje; o mata-mata é 1 bucket `fase='mata-mata'` (32 jogos, times "A definir", excluídos do dados) → chips do mata-mata mostram placeholder até a chave existir. Cards 3 linhas (placar na linha do time, botão Editar libera). Lista por data = **mapa do coletor**.
- **Classificação:** trazida pra DENTRO desta tela (reusa `GET /admin/classificacao/dados`, que já usa resultado real). **Removido o item standalone "Classificacao" do menu** (`ui.ts`); a rota `/admin/classificacao` continua viva mas fora da nav.
- **Artilharia:** novo `GET /admin/resultados/artilharia` (em jogos_placar.ts) — top 50 de `jogadores_stats` (gols/assist/nota_fantasy) join `jogadores`. Hoje vazio (stats sem gols) → estado "popula com o feed de gols". É a tabela de consulta de quanto cada jogador pontuou.
- Pendências relacionadas: (a) mapear os **26 gids** faltantes (coletor cobre 46/72); (b) modelar **rodada do mata-mata** (`rodada_mm`) p/ as chips de fase funcionarem; (c) **feed de gols** p/ Artilharia.

---

## 25. Padronização visual (abas/botões/cores) — 10/jun (commits ff17a54, d45bcdf)

- **Abas (page tabs):** padrão único = `.tab{border-radius:11px 11px 0 0;border-bottom:0;background:#eef1f6}` + `.tab.on{background:var(--card);color:var(--pri);box-shadow:0 -2px 0 var(--pri) inset}` (estilo "folder" do Tokenomics). Já consistente em `tokenomics_page.ts`, `config_hub_page.ts` e agora `resultados_page.ts`. **Se criar tela com abas, usar esse `.tab`.**
- **Botões de rodada/fase:** padrão = **pílula colorida por rodada** (radius 10), ativo preenchido. Cores: grupos R1 `#14a06a`/R2 `#e0a008`/R3 `#e23744`; r32 `#2f6fed`; oitavas `#7a5cff`; quartas `#d4537e`; semi `#1d9e75`; 3º-4º `#b87333`; final `#caa63a`. (Mesma família do Jogos/Placar via `--rc`.) Resultados usa `.ch` com `style="--c:<cor>"`.
- **Resultados/mata-mata:** `/admin/resultados/dados` agora inclui os 32 jogos do mata-mata (antes excluídos por "A definir") e atribui `rodada_mm` por ordem de data (16 r32 / 8 oitavas / 4 quartas / 2 semi / 1 ter / 1 final) → chips filtram. Cards com borda esquerda na cor da rodada + cabeçalho de data colorido com o rótulo da rodada.
- Decisão: **não** reescrever o card do Jogos/Placar (tela pesada) — só alinhar abas/botões/cores. Verificado ao vivo no Chrome.

---

## 26. #1 Gids 365 — causa raiz + ferramentas (10/jun, commit 696112b)

- **Causa:** o 365 `/games/fixtures` só devolve o **horizonte próximo** (ex.: forcei e veio 12 jogos; antes 48). Por isso R3 (24-27/jun) e jogos distantes ainda não têm `gid` — **entram sozinhos no refresh diário** conforme a data chega. Os jogos de **11-14/jun já têm gid** (46/72) → coletor funciona no apito. NÃO é bug.
- `mapearGameIds()` (scores365.ts:369) já grava o gid **desacoplado das odds** (`odds || jsonb_build_object('gid',...)`), 4 janelas até 24-29/jun. Roda no boot via refreshDiario (trava 1x/dia `last_daily_refresh`) ou via flag `config.mapear_gids='go'`.
- **Adicionado:** aliases Cape Verde (`caboverde`/`capverde`→capeverdeislands); `mapearGameIds` agora registra `naoCasados` (nomes 365 que não casaram) em `config.gids_map_em`; **botão "Mapear gids 365"** na tela Resultados → `POST /admin/resultados/mapear-gids` (roda na hora, mostra jogos365/casados/naoCasados). Use isso pra auditar nomes conforme as rodadas entram no horizonte.

---

## 27. #2 Gols/Artilharia + #3 rodada mata-mata (armados p/ auto-completar) — 11/jun (commit c83332c)

- **Coluna nova:** `jogos.gols_evt jsonb` — lista de `{tipo:'gol'|'assist', athlete_id, nome, jogador_id}` por jogo.
- **#2 coletor de gols:** `coletarGolsDoJogo(g, jogoId)` no `scores365.ts`, chamado dentro do `processarResultadoJogo` logo após gravar o resultado real. Parser **defensivo** dos `g.events` (tenta vários nomes de campo), resolve o artilheiro via `jogadores_365.athlete_id`→`jogadores.jogador_id` (fallback por nome). **Captura crua:** grava os 6 primeiros eventos do 1º jogo em `config.eventos_probe` (pra validar a estrutura real). Se a estrutura não bater, é **no-op** (não quebra nada) — só ajustar o parser com o `eventos_probe`.
- **Artilharia** (`GET /admin/resultados/artilharia`): agora **agrega de `jogos.gols_evt`** (count gol/assist por jogador, JOIN jogadores) — idempotente, sem depender de `jogadores_stats`. Hoje vazio; popula sozinho quando os jogos terminarem.
- **#3 rodada_mm:** o endpoint `/admin/resultados/dados` agora lê `dados365->>'rodada'` (roundName do 365) e mapeia p/ r32/oitavas/quartas/semi/ter/final (`mapRound`), com **fallback** pro agrupamento por data. Auto-corrige quando o mata-mata ganhar gid+dados365 (após o sorteio).
- **VALIDAR após o 1º jogo (11/jun 16:00 → coletor ~17:55):** conferir aba Artilharia + `config.eventos_probe` (estrutura crua) e ajustar o parser de gols se preciso.

---

## 28. CENTRO DE COMANDO (Job Scheduler) — Fase 1 — 11/jun (commit c4613c3)

Arquitetura nova de automação **dirigida por banco** (substitui crons ad-hoc; um worker no próprio processo Node, sem crontab do SO).

- **Tabela `tarefas_agendadas`:** id, chave_unica (UNIQUE, p/ idempotência), categoria ('Jogos'/'Pontuacao'/'Diario'/'Arena'), acao, horario_gatilho, parametros jsonb, status ('pendente'/'rodando'/'concluido'/'erro'), tentativas, log.
- **`comando.ts`:**
  - `tickTarefas()` — **worker `setInterval(60s)`** (+ tick boot+15s): pega pendentes vencidas, roda a ação mapeada, grava status+log. Trava `tarefas_last_tick` (saúde do robô).
  - `gerarTarefasDosJogos()` — boot+8s e de hora em hora. Por jogo (próx. 40d): `atualizar_dados_jogo` + `auto_preencher` em **−30min** e `coletar_resultado` em **+120min**. Diárias: `atualizar_odds` 00/04/08/12/16/20, `gerar_noticias` 03:00, `injetar_tokens` 00:01. Upsert idempotente por `chave_unica` (só remarca horário se ainda 'pendente').
  - `iniciarComando()` chamado no `server.ts` (junto do `agendadorDiario()`).
  - **Ações REAIS (Fase 1):** `atualizar_dados_jogo`→`atualizarDadosJogo(jogoId)` (novo em scores365: dados365 + golsLideres + ultimas5 + escalação); `auto_preencher`→`autoPreencherTick()` (jogar.ts, preenche quem tem `usuarios.auto_preencher=true` e não palpitou); `coletar_resultado`→`coletarResultadoJogo(jogoId)` (novo: processarResultadoJogo → resultado+gols+apuração+token); `atualizar_odds`→`syncOdds()`.
  - **Placeholders (logam "a construir"):** `gerar_noticias`, `injetar_tokens`, `liquidar_bets`, `arena_resolver`, `regua_figurinhas`.
- **Dashboard `/admin/comando`** (`comando_page.ts`, nav 🤖): saúde do robô (verde se tick <120s), filtros [Todos/Jogos/Pontuacao/Diarios/Arenas], timeline por horário (cinza pendente / azul rodando / verde concluido / vermelho erro), botões "tentar de novo" (erro) e "rodar agora" (pendente) + "Gerar tarefas". Endpoints: `GET /admin/comando/tarefas?dia=&cat=`, `POST /admin/comando/{retry,rodar-agora,gerar}`.
- **OBS / consolidar depois:** o `agendarResultados()` (setTimeout por jogo, antigo) **continua rodando em paralelo** ao `coletar_resultado` do scheduler — sem conflito (apuração é idempotente/one-shot), mas dá pra aposentar o antigo depois. Próximas fases: ligar as ações placeholder (notícias IA, drip, Arena, régua) e migrar o resto pra cá.

---

## 29. Menu lateral — RESOLVIDO (causa raiz: zoom × 100vh) — 11/jun (commit 9073948)

**Sintoma:** sidebar não ia até o fundo na "Início" (conteúdo curto) e cortava itens embaixo (barra de scroll interna) sob zoom; no "Bolão" parecia ok (a página rola).

**Causa raiz (MEDIDA ao vivo no Chrome, não teorizada):** `.side` usava `height:calc(100vh - 52px)` + `overflow-y:auto`. Dois agravantes de zoom: (a) `body{zoom:.82/.9}` das medias de "encaixar em tela 15pol" encolhe tudo 10–18%, mas `100vh` continua a viewport cheia → header+side somam `zoom×100vh` e sobra vão embaixo; (b) zoom do NAVEGADOR (ex.: 125%) aumenta os itens → altura fixa fica menor que o conteúdo → scroll interno corta o "Regras". Além disso o processo estava ZUMBI servindo o CSS revertido (1b42442) — restart real (PID novo) foi necessário antes de medir.

**Correção:** `.side` passou de `height:calc(...)+overflow-y:auto` → **`min-height:calc(100vh - 52px)` sem overflow** (cresce e nunca corta; `position:sticky` mantido). Nas medias de zoom o vh é dividido pelo zoom: `min-height:calc(100vh / 0.82 - 52px)` e `/0.9` (idem `.layout`). Validado ao vivo: gap≈0 e `corta=false` em Início, Bolão e com zoom .82. Mobile `@media max-width:760` segue `position:fixed;bottom:0;overflow-y:auto` (drawer, intocado).

**Lição reforçada:** medir no Chrome (getComputedStyle + getBoundingClientRect) achou a causa em minutos; ler só o CSS no código manteria a teoria errada de "é só cache". Restart real + conferir PID + conferir CSS servido continua obrigatório.

---

## 30. Cor dos nomes (times/seleções) padronizada — 11/jun (commit 96fc8b3)

**Pedido do dono:** nome de time com a MESMA cor em TODAS as listas (Bolão, Copa grupos/calendário, Ranking, dashboard), inclusive no tema CLARO.

**Causa do cinza:** o conteúdo dinâmico é renderizado dentro de um `<div class="muted">` (anti-padrão) → tudo herda `color:var(--mut)` (cinza): grupos (`.gcols td`/`.gcols b`), jogos+calendário (`span.nm`), ranking (`.rkname b`). Medido ao vivo: regra direta no elemento de texto funciona; mexer só no container às vezes não pega — **o Ranking RE-RENDERIZA** (atualização ao vivo) e descarta o nó, por isso inline/`.rkrow{}` "não funcionavam" nos testes. A regra no stylesheet aplica a cada render.

**Correção:** regra única `.nm,.gcols td,.gcols b,.rkname b{color:var(--tx)}`. Usa `var(--tx)` (NÃO `#fff`) → adapta: escuro = branco `#fff`, claro = `#1b2230` (legível no fundo branco). Subtítulos (`.rkname small` = nome do time, `th` = cabeçalho) seguem `--mut` de propósito. Validado nos 2 temas ao vivo.

**Padrão p/ telas novas:** nome de time/seleção sempre `var(--tx)`, nunca `#fff` fixo nem deixar herdar de `.muted`.

**Menu lateral (mesma sessão, commits bc45f61 + 3a1e60c):** os itens clicáveis do `.side a` estavam em `--mut` (apagados) → mudados p/ `var(--tx)` (branco no escuro / escuro no claro). Os `.side a.soon` (Em breve) mantêm `--mut` + opacity .5 (deixados apagados de propósito); o `.on` segue `#fff` sobre o fundo verde. A bolinha de aviso de Regras (`.rnav .radar`, pulso laranja) é escondida no menu colapsado: `body.mcol .side .radar{display:none}` (ficava solta à direita dos ícones).

**Cabeçalhos padronizados (commit 44bec4f):** Início, Copa, Ranking e Conectar IA passaram a usar o mesmo `.pghead` do Bolão (barrinha verde = `border-left:3px solid var(--pri2)`), envolvendo o `h1` num `.pghl`. Markup em `jogar_page.ts`. Copa: o subtítulo (EUA·Canadá·México — datas) entra no `.pghead` e vai pra direita pelo flex do `.pghl` (flex:1). IA: `h1`+descrição (vira `p.pgsub`) sobem pro `.pghead`; as abas Conectar/Custo descem pra depois dele.

**Caixa branca nas barras de abas (aprovado, commits d07d56d + 0b20057):** as barras de abas de Copa (`#copa-tabs`), Ranking (`#rank-tabs`) e Conectar IA (`#s-ia .tabs`) ganharam o mesmo fundo do Bolão (`#bolao-tabs`): `background:var(--surface);border:1px solid var(--bd);border-radius:14px;padding:8px 10px` (branco no claro, surface no escuro). Antes usavam a pílula `.tabs` cinza (`--card2`), que apagava. Padrão p/ barras de abas novas: usar `var(--surface)`, não `--card2`.

---

## 31. Mobile UX — Blocos A/B/C FEITOS (12/jun)

Padrão de fix: scripts `_fix_mobile_*.ts` — idempotentes (flag `.done`), injetam CSS em `jogar_style.ts` na âncora `.ob-emoji{font-size:46px}}\n\`;` antes do fechamento do template literal. Importados em `server.ts`. Requerem **2 restarts** (1º aplica o patch em disco; 2º carrega o CSS novo).

**Atenção — nested media queries:** a âncora fica DENTRO de um bloco `@media(max-width:540px)` do CSS original. Logo os `@media(max-width:480px)` e `@media(max-width:600px)` inseridos ficam aninhados. Chrome suporta (`A and B` lógico); funciona nos breakpoints mobile alvo (390px).

### Bloco A — landing + tela do jogador
`_fix_mobile_jogar_style.ts` + `_fix_mobile_landing.ts`: padding geral, hero landing, nav menu, etc.

### Bloco B — bolão / palpites
`_fix_mobile_b.ts`: cards de jogo, bandeiras, inputs de placar, grid de palpites.

### Bloco C — ranking / abas / marketplace (12/jun, commits deb2eaa + 8df5ee8)

**`_fix_mobile_c.ts`** — P2.8 + P2.9 (`.tabs`) + P2.10:
- `@media(max-width:480px)`: `.rkrow` padding/gap, `.rkname` ellipsis, `.rkprize` font-size, `.rkcol small` font 9px
- `@media(max-width:600px)`: `.tabs` `overflow-x:auto` + `mask-image` fade + `scrollbar-width:none`
- `@media(max-width:480px)`: `.pack.base` `min-width:0;padding:14px 10px`, `.pksoon` `display:block`

**`_fix_mobile_c2.ts`** — P2.9 corretivo (specificity bug):
- Problema: `#bolao-tabs{overflow:hidden}` (ID, especificidade 1,0,0) sobrescrevia `.tabs{overflow-x:auto}` (classe, 0,1,0).
- Fix: target direto em `.tabL` (container flex interno das abas de rodada no Bolão) + seletores compostos `#copa-tabs.tabs` e `#rank-tabs.tabs` para ganhar especificidade.
- `@media(max-width:600px)`: `.tabL` overflow-x auto + fade + `.tabL .tab{flex-shrink:0}` · `#copa-tabs.tabs`, `#rank-tabs.tabs` idem.

**Verificado em Chrome harness 390px:**
- P2.8 ✅ — nomes truncam (ellipsis), colunas BOLÃO/ARENA/TOTAL visíveis
- P2.9 ✅ — `.tabL` scrollWidth 422 > clientWidth 324 (scrollável); `#copa-tabs` overflow-x:auto
- P2.10 ✅ — cards marketplace "EM BREVE" alinhados, layout limpo

**Git state (VPS):** VPS tem server.ts/fix scripts como modificações locais não commitadas (push feito via clone em /tmp/bolao_work). Para sincronizar: `git fetch origin && git reset --hard origin/main` na VPS.

**Próximo — Bloco D:** PWA installable — `manifest.json`, meta tags em `jogar_page.ts`/`landing.ts`, handler `fetch` pass-through em `/sw.js`. Ver `PLANO_MOBILE_UX.md` §Bloco D.
