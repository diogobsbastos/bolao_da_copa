# HANDOFF — Bolão da Copa 26 (continuação no chat novo)

## Contexto
App **bolao-copa26** rodando na **VPS Oracle** (escola-parque-v3), servido em `/bolao-copa26/`.
Stack: Node + Fastify + TypeScript via **tsx** sob systemd. Postgres dedicado **bolao_copa26** (user `innova_worker`).
Editar `.ts` na VPS via MCP → `servico restart bolao-copa26` (sem compilar). Sem sudo/shell; só MCP (arquivos/SQL/serviço).
Admin: `oracle-vipworks.duckdns.org/bolao-copa26/admin`. Menu lateral único e responsivo em `ui.ts`.

## O que JÁ está pronto (não refazer)
- **Figurinhas**: 48 times cortados (grade 4×4 do PDF) em `figurinhas/<TIME>/` com `_ocr5.json` + `_tipo.json`. Casamento OCR↔elenco. Tela `/admin/figurinhas`.
- **Configurações** (`/admin/config-hub`): abas APIs, LLMs (pool multi-provider: gemini + local), **Custos/LLM** (biblioteca de preços US$/1M e US$/imagem + dólar), Motor de Imagem, Cortes, Banco.
- **Tokenomics** (`/admin/tokenomics`): economia + log de gastos de IA. `registrarGasto` plugado.
- **Criador de Figurinhas** (`/admin/criador-fig`): base sem-foto Local (rembg, descartado por qualidade) e nano banana.
- **FÁBRICA** (`/admin/cartas`) — o foco atual:
  - Moldes por time: **Jogador** (ref foto 8) e **Goleiro** (ref = 1º tile de jogador). Gera pelo **nano banana** (prompt `prompt_fig_base`, editável) OU **sobe base externa** (PNG do flow). Salvas em `figurinhas/<TIME>/_base_jogador.png` e `_base_goleiro.png`.
  - Lista **jogadores SEM figurinha** (auto, do elenco) com checkboxes + marcar/desmarcar todos.
  - **Gerar selecionados** → escreve nome+posição NATIVO (Pillow, `compor_nome.py`, sem desenhar tarja) no molde certo (goleiro/jogador) → salva `_carta_<NOME>.png`.
  - Mapeamento pasta(PT)→seleção(EN) por dict ALIAS (ALEMANHA→Germany etc.).

## Decisões importantes
- Base = **nano banana** (1x por time, reusa). Texto = **nativo Pillow grátis** (LLM borra texto).
- Prompt vencedor da base está salvo em config `prompt_fig_base` (editável na Fábrica e no Criador).
- Avatar do jogador (foto real) usa nano com o prompt que ESCREVE o nome no próprio prompt (funcionou), foto 8 como template.

## PENDENTE (retomar aqui)
1. **Importar elencos** se a lista de jogadores sem figurinha vier vazia: POST `/admin/elencos/importar` (football-data /competitions/WC/teams). Tabelas `jogadores`/`figurinhas` no banco do app (sql_local NÃO alcança; só via `pool`).
2. Testar a **geração em lote** da Fábrica ponta a ponta (Argentina/África já têm base subida).
3. **Goleiros que não vieram** no álbum (sem tile) — tratar.
4. **Avatar do jogador** (criador com foto real do usuário) — montar tela de upload.
5. Esconder os 3 botões da toolbar de Figurinhas (Cortar/Preencher/OCR) num "…".
6. Onda 0 ainda: área do jogador (palpites/ranking), Crons 01-04, hub PIX.

## Arquivos-chave na VPS (/home/ubuntu/bolao-copa26/)
`cartas.ts` (Fábrica), `compor_nome.py`, `silhueta.py`, `criador_fig.ts`, `config_hub.ts`, `custos.ts`, `tokenomics.ts`, `ui.ts` (menu), `elencos.ts`, `figurinhas_admin.ts` (52KB, evitar reescrever), `server.ts`.

## Zips das figurinhas (pasta BOLAO DA COPA)
`figurinhas_copa48.zip` (48 times, tiles + jsons), `figurinhas_jogadores.zip`, `figurinhas_alta.zip`.
</content>
