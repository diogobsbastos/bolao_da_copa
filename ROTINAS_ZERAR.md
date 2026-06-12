---
titulo: ROTINAS DE ZERAR — Hub da Copa 26
versao: Beta 1.0
data: 2026-06-12
tags: [operacional, sql, reset, limpeza]
---

# Rotinas de Zerar — Hub da Copa 26

> **Quando usar:** durante o desenvolvimento (refazer login do zero) e principalmente **antes do Go Live oficial** pra começar o jogo limpo, sem contas de teste sujando o ranking, o pote e o histórico.
>
> **Regra de ouro:** **NUNCA apaga admin.** As duas funções abaixo recusam apagar qualquer usuário com `papel='admin'`.

---

## 1. Funções SQL (já instaladas no banco `bolao_copa26`)

### `apagar_jogador(email TEXT)`
Apaga **1 jogador** e tudo ligado a ele.

```sql
SELECT apagar_jogador('teste@gmail.com');
-- retorna: 'ok: usuario teste@gmail.com (id=123) apagado'
--      ou: 'recusado: usuario eh admin (...)'
--      ou: 'nao_existe'
```

**O que apaga em cascata:**
- `sessoes` (todas as sessões ativas — força logout)
- `transacoes_tokens` (ledger completo do usuário)
- `palpites_bolao` (todos os palpites de jogo)
- `palpites_longo` (campeão/vice/artilheiro)
- `inventario_figurinhas` (cartas que abriu)
- `depositos` (histórico PIX)
- `ranking` (entrada no quadro)
- `usuarios_carteiras` (saldo)
- `usuarios` (a conta em si)
- **Bônus:** se esse usuário tinha **indicado** alguém via convite FULL, os indicados ficam com `referido_por = NULL` (não são apagados — preservamos quem entrou pelo convite).

### `apagar_todos_jogadores()`
Apaga **TODOS os usuários não-admin**, em loop chamando `apagar_jogador` para cada.

```sql
SELECT apagar_todos_jogadores();
-- retorna: 'ok: 47 jogador(es) apagado(s). Admins preservados.'
```

---

## 2. Rotinas comuns

### Refazer login de UM usuário (durante testes)
```sql
SELECT apagar_jogador('filmesvipadm@gmail.com');
```
Depois é só cadastrar de novo no site — vai começar zerado (saldo 0, não-FULL, popup de onboarding ativo).

### Zerar TUDO antes do Go Live (1 comando)
```sql
SELECT apagar_todos_jogadores();
```
Recomendado rodar **no minuto antes** do lançamento público.

### Zerar só usuários de teste (filtro por padrão de email)
Útil quando você quer limpar `teste-*@gmail.com` sem afetar usuários reais que já entraram:
```sql
DO $$
DECLARE e text;
BEGIN
  FOR e IN SELECT email FROM usuarios
           WHERE email ILIKE 'teste%' OR email ILIKE '%test%' OR email ILIKE '%@bolaocopa26.test'
  LOOP
    PERFORM apagar_jogador(e);
  END LOOP;
END $$;
```

### Resetar UM usuário sem apagar (deixar como recém-cadastrado)
Quando você quer manter a conta mas só limpar o estado de jogo:
```sql
WITH u AS (SELECT id FROM usuarios WHERE email='alguem@gmail.com')
UPDATE usuarios SET pagou=false, acesso_full=false, onboarding_popup_visto=false,
                    nome_time=NULL, avatar=NULL, escalacao=NULL,
                    tipo_entrada=NULL
WHERE id IN (SELECT id FROM u);

WITH u AS (SELECT id FROM usuarios WHERE email='alguem@gmail.com')
UPDATE usuarios_carteiras SET saldo=0 WHERE usuario_id IN (SELECT id FROM u);

WITH u AS (SELECT id FROM usuarios WHERE email='alguem@gmail.com')
DELETE FROM transacoes_tokens WHERE usuario_id IN (SELECT id FROM u);

WITH u AS (SELECT id FROM usuarios WHERE email='alguem@gmail.com')
DELETE FROM palpites_bolao WHERE usuario_id IN (SELECT id FROM u);

WITH u AS (SELECT id FROM usuarios WHERE email='alguem@gmail.com')
DELETE FROM depositos WHERE usuario_id IN (SELECT id FROM u);

WITH u AS (SELECT id FROM usuarios WHERE email='alguem@gmail.com')
UPDATE ranking SET pontos_bolao=0, pontos_arena=0 WHERE usuario_id IN (SELECT id FROM u);
```

### Zerar APENAS pontuação (mantém contas e depósitos)
Útil pra resetar ranking sem perder histórico de quem pagou:
```sql
BEGIN;
-- devolve tokens premiados pra evitar inflação artificial
UPDATE usuarios_carteiras uc
SET saldo = saldo - x.total
FROM (SELECT usuario_id, SUM(valor) AS total
      FROM transacoes_tokens
      WHERE tipo='premio_bolao'
      GROUP BY usuario_id) x
WHERE uc.usuario_id = x.usuario_id;
DELETE FROM transacoes_tokens WHERE tipo='premio_bolao';
UPDATE palpites_bolao SET pontos=0, creditado=false;
UPDATE jogos SET apurado=false WHERE apurado=true;
UPDATE ranking SET pontos_bolao=0, pontos_arena=0, atualizado_em=now();
COMMIT;
```
*(Esta rotina foi executada na sessão de 12/jun noite — ver `HANDOFF_SESSAO_2026-06-12_NOITE.md` §1.8)*

---

## 3. Listar antes de apagar (auditoria)

Sempre vale uma olhada antes de rodar a função "todos":

```sql
-- Quem vai SOBRAR (admins) e quem vai SUMIR (jogadores)
SELECT papel, COUNT(*) FROM usuarios GROUP BY papel ORDER BY papel NULLS LAST;

-- Lista dos jogadores que serao apagados
SELECT id, email, nome, pagou, acesso_full, criado_em
FROM usuarios WHERE papel <> 'admin' OR papel IS NULL
ORDER BY criado_em DESC;
```

---

## 4. O que NÃO é apagado pelas funções

As rotinas focam em **dados do usuário**. Não tocam em:
- `jogos`, `jogadores`, `figurinhas`, `jogadores_365`, `jogadores_stats` — o calendário da Copa e os elencos importados continuam.
- `config` — todas as regras (pontuação, mata-mata, pote, pacotes, taxa, **bolao_trava_pontuacao**, **bolao_inicio_oficial**) continuam.
- `tarefas_agendadas` — o robô do Centro de Comando continua armado.
- `llm_provedores`, `precos_modelos`, `gastos_log`, `custos_meta` — biblioteca de IA/custos intocada.
- `dados365` — cache de chamadas externas mantido.
- `patrocinadores` — Vipworks e futuros patrocinadores ficam.

Resumo: o **jogo** continua, só os **jogadores** são zerados.

---

## 5. Como chamar do MCP (Claude)

Quando você pedir "apaga o usuário X" ou "zera tudo", eu vou rodar uma dessas linhas via `sql_local`:

```sql
SELECT apagar_jogador('email-do-usuario@x.com');
-- ou
SELECT apagar_todos_jogadores();
```

Pra atalhar: peça **"zera o filmesvip"** e eu rodo `apagar_jogador('filmesvipadm@gmail.com')` direto.

---

## 6. Roadmap (TODO)

- [ ] Botão na aba **Usuários** do admin com confirmação dupla (`/admin?pg=users`) chamando os endpoints abaixo. Hoje a rotina roda só por SQL.
- [ ] Endpoints `POST /admin/usuarios/apagar` (1 email) e `POST /admin/usuarios/zerar-todos` (proteção: header `x-confirma=ZERAR-TUDO`) — pra integrar com a UI acima.
- [ ] Tarefa opcional no Centro de Comando: `limpar_testes_diario` — apaga sozinho qualquer conta com email casando `*test*` mais antiga que 24h. Útil pra ambiente de stage.

Quando estiver pronto, este doc é atualizado com a forma de chamar pelo painel.
