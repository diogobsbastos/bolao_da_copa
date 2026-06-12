---
titulo: HANDOFF — Sessão 12/jun/2026 (sexta manhã) · NOTIFICAÇÕES
versao: Beta 1.0
data: 2026-06-12T11:30-03:00
tags: [handoff, sessao, 2026-06-12, notificacoes, webpush]
prev: HANDOFF_SESSAO_2026-06-12_NOITE.md
---

# HANDOFF — Sessão 12/jun (sexta manhã) · Sistema de Notificações Onda A

> HEAD inicial `8c444d5` → HEAD final **`ee5db5d`** (commits `de076db` feat + `ee5db5d` fix).
> Entrega: **ROADMAP §1 Onda A completa + Web Push**, tudo testado ponta-a-ponta em produção.

## 1. O QUE ENTROU

- **3 tabelas** `notif_canais` / `notif_mensagens` / `notif_envios` (+ col `referencia` com UNIQUE parcial p/ dedup de gatilhos; UNIQUE canal+destino nas subscriptions).
- **`notificacoes.ts` (NOVO):** `notificar()` / `notificarSegmento()` / `notifsDoUsuario()` / sender webpush 60s / `lembretePalpites` 10min / rotas player+admin / Service Worker `/sw.js` / página `/admin/notificacoes`.
- **Web Push sem lib:** VAPID ES256 + aes128gcm (RFC 8291) em node:crypto puro. Chaves geradas no boot → `config.webpush_vapid_pub/priv`. Validado com round-trip crypto local + push real (FCM **201**).
- **Sino in-app:** `/jogar/news` mescla notifs do usuário; abrir o sino marca como lido (`POST /jogar/notifs/lidas`); link "ativar alertas" no dropdown (askPush/initPush injetados no `jogar_page.ts`).
- **Gatilhos:** pontos creditados (em `apurarJogo`, só webpush, dispara sozinho quando a trava cair sábado) · PIX confirmado (`creditarDeposito`) · palpite pendente 60–180min (só FULL, **respeita a trava** — fix `ee5db5d`).
- **Composer admin** com segmentos (todos/full/nao-full/top50/inativos), checkbox push, "Testar comigo", histórico com taxa de leitura. Item 🔔 no menu lateral.
- **Docs atualizados:** ROADMAP (Onda A ✅), SPEC (§3/§5/§13), MAPA (§20 novo), INDEX.

## 2. TESTES FEITOS (produção)

1. Teste in-app → linha em `notif_envios`, badge "1" no sino, item no dropdown, abrir → status `lido`. ✓
2. Permissão de push concedida pelo dono → subscription FCM gravada em `notif_canais`. ✓
3. Push real → `status=enviado`, resposta FCM `201`. ✓
4. Restart com PID novo + "Server listening 8510" + "[notif] modulo iniciado". ✓

## 3. COMO USAR AMANHÃ (sábado 13/06)

1. **19h00 BRT:** `/admin/trava` → Desligar a trava (inalterado).
2. Antes do jogo: `/admin/notificacoes` → mensagem "A pontuação começa hoje!" pra **todos** (sino + push).
3. Quando o coletor apurar Brasil x Marrocos, quem pontuou recebe push "⭐ Voce pontuou!" automaticamente.

## 4. PENDENTE (próximas sessões)

- Onda B: WhatsApp Business (número + templates HSM na Meta — burocracia externa).
- Onda C: e-mail transacional + A/B.
- Jogadores precisam clicar "ativar alertas" no sino pra receber push (consentimento por usuário) — vale broadcast in-app ensinando.
- Restante do ROADMAP: Tour inicial, /patrocinadores, login patrocinador, Arena design.
