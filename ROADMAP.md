# ROADMAP — Hub da Copa 2026 (Bolão Copa 26)

> Itens prioritários do que vem depois do Beta 1.0 já no ar.
> Última atualização: 2026-06-12.

---

## ⭐ TOP PRIORIDADE

### 1. Sistema de Notificações (MUITO IMPORTANTE)
> Toda novidade, lançamento, evento da Copa, atualização de regra ou alerta operacional precisa chegar nos jogadores. **Sem isso o engajamento morre.**

**Canais a implementar:**
- **Web Push** (Service Worker + VAPID) — funciona com o PWA, sem custo. Notificações nativas do navegador/celular mesmo com a aba fechada.
- **WhatsApp Business API** (Meta Cloud API) — alto engajamento; precisa de número aprovado + templates HSM aprovados pra mensagens proativas.
- **E-mail** (transactional, ex.: Resend / SendGrid / SES) — fallback universal e para confirmações.
- **In-app banner/toast** — quando jogador está logado, badge no sino do header (já tem o sino, plugar).

**Casos de uso (gatilhos):**
- Onboarding: confirmação de cadastro, instruções pra fechar a entrada.
- Pagamento: PIX caiu, tokens creditados, convite FULL gerado.
- Convite usado por amigo → "fulano entrou pelo seu convite".
- Bolão: 1h antes do apito do próximo jogo do usuário (com palpite pendente), trava chegando, jogo apurado, "você acertou X pontos".
- Arena: desafio recebido, resultado da batalha.
- Mata-mata: confronto novo aberto, palpite por fase trava em 1h, longo prazo travando.
- Marketplace: pacote disponível, fim da janela.
- **Broadcast/admin:** painel pra disparar mensagem manual pra todos OU segmento (ex.: "todos os jogadores não-FULL", "top 50 ranking", "jogadores inativos há 3 dias").
- Operacionais: webhook MP falhou, scheduler atrasado.

**Modelo de dados sugerido:**
```sql
CREATE TABLE notif_canais (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
  canal TEXT CHECK (canal IN ('webpush','whatsapp','email','inapp')),
  destino TEXT,             -- endpoint webpush, whatsapp E.164, email
  webpush_p256dh TEXT,
  webpush_auth TEXT,
  consentimento BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE notif_mensagens (
  id BIGSERIAL PRIMARY KEY,
  tipo TEXT,                -- 'broadcast' | 'gatilho:bolao_apito' | 'gatilho:convite_usado' ...
  segmento TEXT,            -- 'todos' | 'full' | 'nao-full' | 'top50' | 'inativos'
  template TEXT,            -- texto/html com placeholders {{nome}}, {{pontos}}
  agendado_para TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT now(),
  criado_por BIGINT REFERENCES usuarios(id)
);
CREATE TABLE notif_envios (
  id BIGSERIAL PRIMARY KEY,
  mensagem_id BIGINT REFERENCES notif_mensagens(id) ON DELETE CASCADE,
  canal_id BIGINT REFERENCES notif_canais(id),
  status TEXT,              -- 'pendente' | 'enviado' | 'falhou' | 'lido'
  resposta TEXT,
  enviado_em TIMESTAMPTZ,
  lido_em TIMESTAMPTZ
);
```

**Painel admin** `/admin/notificacoes` — composer + segmento + canal(is) + agendamento + preview + histórico de aberturas.

**Ondas:**
- **Onda A (essencial):** in-app + web push + admin composer básico.
- **Onda B (alto impacto):** WhatsApp Business com 2-3 templates HSM aprovados.
- **Onda C:** e-mail transactional + segmentação avançada + A/B test.

---

## A IMPLEMENTAR (próximas ondas)

### 2. Tour inicial (onboarding interativo)
- Dispara na PRIMEIRA visita após cadastro/login.
- Walkthrough guiado pelas abas principais: Início → Bolão → Meu Time → Marketplace → Convidar.
- Highlight (spotlight) em cada item do menu lateral + tooltip explicando.
- Checklist "Primeiros Passos" persistente (até o usuário completar tudo): Cadastro / Pagamento ou Convite FULL / Primeiro Palpite / Time Escalado / Convidar 1 amigo.
- Flag `usuarios.onboarding_completo` no banco.

### 3. Área de Patrocinadores (público)
- Tela `/patrocinadores` na landing + dentro do app logado.
- Lista todos os patrocinadores `status='ativo'` com logo + nome + valor + link opcional.
- Pílula "Premiação patrocinada por:" no topo do ranking.
- Endpoint `GET /patrocinadores` público (sem auth).

### 4. Login de Patrocinador (self-service)
- Tela `/patrocinador/entrar` onde uma empresa entra com email + senha.
- Cadastro: razão social + email + telefone + valor de patrocínio desejado.
- Após confirmar valor, gera PIX QR Code (igual fluxo do jogador).
- Webhook MP credita na tabela `patrocinadores` (status passa de `pendente` → `ativo`).
- Painel próprio do patrocinador: ver pageviews da própria logo, editar logo/link.
- Nova tabela `patrocinador_contas` (id, patrocinador_id, email, senha_hash, criado_em).

### 5. Sistema de PVP (Arena) — DESIGN
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
- Config `bolao_trava_pontuacao = 'on' | 'off'` — toggle no admin (`/admin/trava`) com calendário animado.
- Config `bolao_aviso_inicio` — texto amigável pra UI.
- Mecanismo: `pontuacao.ts/apurarJogo()` checa a trava. Quando ligada, jogos antes do inicio oficial NÃO são apurados (retorna cedo sem mutar banco).
- **Não corrompe estado** — pode ligar/desligar a qualquer momento e o coletor processa naturalmente.
- Relógio regressivo `.cdmini` no header (landing + app logado) puxando do mesmo config.

---

## JÁ ENTREGUE (Beta 1.0 — 12/jun)

- Cadastro/login (e-mail+senha + Google OAuth).
- Bolão tradicional (palpite manual, robô auto-preencher, IA do usuário Gemini/Anthropic/OpenAI/Ollama).
- Carteira única de tokens (colapso 3 → 1).
- Depósito PIX real em produção (Mercado Pago).
- Webhook MP idempotente.
- Convite FULL one-shot ponta-a-ponta.
- Bloqueio freemium nas abas pagas.
- Ranking com prêmio em R$ projetado (split 50/30/20).
- Centro de Comando com retry automático.
- og:image quadrada via UA-detection.
- **Tabela `patrocinadores`** + Vipworks como primeiro (R$40).
- **Endpoint `/pote`** somando depósitos + patrocínios.
- Pílula do pote sincronizada na landing e no app logado.
- **Logo padrão "BOLÃO COPA 26 + Beta 1.0 + Manager"** idêntico em landing e app.
- **Relógio regressivo `.cdmini`** no header (landing centralizado + app entre menu e foto), tickando em `/inicio`.
- **Trava de pontuação ligável/desligável** (`/admin/trava`) com calendário animado completo.
- **Sidebar admin compacta** (212px, padding 6/10, scroll fino).
- Funções SQL `apagar_jogador()` / `apagar_todos_jogadores()` pra reset.
- **Reset zero de pontos** executado (ranking/palpites/jogos.apurado/transacoes_premio_bolao).
