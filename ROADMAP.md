# ROADMAP — Hub da Copa 2026 (Bolão Copa 26)

> Itens prioritários do que vem depois do Beta 1.0 já no ar.
> Última atualização: 2026-06-12.

---

## A IMPLEMENTAR (próximas ondas)

### 1. Tour inicial (onboarding interativo)
- Dispara na PRIMEIRA visita após cadastro/login.
- Walkthrough guiado pelas abas principais: Início → Bolão → Meu Time → Marketplace → Convidar.
- Highlight (spotlight) em cada item do menu lateral + tooltip explicando.
- Checklist "Primeiros Passos" persistente (até o usuário completar tudo): Cadastro / Pagamento ou Convite FULL / Primeiro Palpite / Time Escalado / Convidar 1 amigo.
- Flag `usuarios.onboarding_completo` no banco.

### 2. Área de Patrocinadores (público)
- Tela `/patrocinadores` na landing + dentro do app logado.
- Lista todos os patrocinadores `status='ativo'` com logo + nome + valor + link opcional.
- Pílula "Premiação patrocinada por:" no topo do ranking.
- Endpoint `GET /patrocinadores` público (sem auth).

### 3. Login de Patrocinador (self-service)
- Tela `/patrocinador/entrar` onde uma empresa entra com email + senha.
- Cadastro: razão social + email + telefone + valor de patrocínio desejado.
- Após confirmar valor, gera PIX QR Code (igual fluxo do jogador).
- Webhook MP credita na tabela `patrocinadores` (status passa de `pendente` → `ativo`).
- Painel próprio do patrocinador: ver pageviews da própria logo, editar logo/link.
- Nova tabela `patrocinador_contas` (id, patrocinador_id, email, senha_hash, criado_em).

### 4. Sistema de PVP (Arena) — DESIGN
- Pendente: definição fina das regras (a discutir com profundidade).
- Pontos confirmados (CLAUDE.md §0.1): vitória 50 / derrota 10 / máx 3 arenas/rodada.
- Stake 50 / rake 10 / pote 100 / vencedor leva 90.
- Faltam decisões: matchmaking real (qual heurística de força do elenco), teto de overall do XI titular, UX do "aceitar desafio", timeout pra retorno, histórico, anti-conluio (mesma família joga? mesmo IP?).
- Não entra no Beta 1.0 — será onda 2.

---

## REGRAS ESPECIAIS DO LANÇAMENTO

### Trava de pontuação até sábado 13/06
- A Copa começa **11/jun (quinta)**, mas o bolão **só começa a pontuar no jogo do Brasil x Marrocos = sábado 13/06 19h00 BRT**.
- Config `bolao_inicio_oficial = 2026-06-13T22:00:00.000Z`.
- Config `bolao_aviso_inicio = "A pontuação começa no sábado 13/06 às 19h00 — jogo do Brasil x Marrocos."`.
- Mecanismo: `pontuacao.ts/apurarJogo()` checa se `jogo.inicio < bolao_inicio_oficial` → não credita pontos nem tokens, marca como `apurado=true` mas com `pontos=0` em todos os palpites.
- Banner visível no topo do app logado e da landing até a data passar.

---

## JÁ ENTREGUE (Beta 1.0)

- Cadastro/login (e-mail+senha + Google OAuth).
- Bolão tradicional (palpite manual, robô auto-preencher, IA do usuário).
- Carteira única de tokens.
- Depósito PIX real (Mercado Pago em produção).
- Convite FULL one-shot.
- Bloqueio freemium nas abas pagas.
- Ranking com prêmio em R$ projetado (split 50/30/20).
- Centro de Comando com retry.
- og:image quadrada via UA-detection.
- Tabela `patrocinadores` + Vipworks como primeiro patrocinador (R$40).
- Endpoint `/pote` somando depósitos + patrocínios.
- Pílula do pote sincronizada na landing e no app logado.
