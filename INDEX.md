---
titulo: INDEX — Hub da Copa 2026
versao: Beta 1.0
data: 2026-06-12
tags: [index, obsidian, rag, navegacao]
---

# 📚 INDEX — Documentação do Hub da Copa 2026

> **Ponto de entrada único.** Cada doc tem propósito específico — abra na ordem indicada quando precisar retomar contexto.

---

## 🚀 Ordem de leitura recomendada (chat novo)

1. **[[INDEX.md]]** (este arquivo) — mapa da documentação
2. **[[SPEC_COMPLETO.md]]** — visão consolidada do sistema (15 seções RAG-friendly)
3. **[[CLAUDE.md]]** — regras de produto/stack + tokenomia oficial + ferramentas
4. **[[MAPA_SISTEMA.md]]** — fonte da verdade técnica (infra/tabelas/arquivos)
5. **[[ROADMAP.md]]** — próximas ondas (Notificações = TOP prioridade)
6. **[[HANDOFF_SESSAO_2026-06-12_NOITE.md]]** — última sessão (mais recente)
7. **[[ROTINAS_ZERAR.md]]** — funções SQL pra reset/limpeza
8. **[[HANDOFF_FABRICA.md]]** — Fábrica de Figurinhas (módulo separado)

---

## 📂 Mapa dos documentos

### 🎯 Documentos vivos (atualize sempre)
| Doc | Propósito | Quando atualizar |
|---|---|---|
| `SPEC_COMPLETO.md` | Visão geral consolidada | A cada feature/mudança estrutural |
| `CLAUDE.md` | Regras de produto + tokenomia | Quando regra/economia mudar |
| `MAPA_SISTEMA.md` | Mapa técnico (infra/tabelas/arquivos) | A cada arquivo novo / tabela nova |
| `ROADMAP.md` | Próximas ondas + prioridades | A cada conclusão / nova prioridade |
| `INDEX.md` | Este arquivo | Quando adicionar/remover docs |

### 📜 Documentos de história (não mexer)
| Doc | Período coberto |
|---|---|
| `HANDOFF_CHAT.md` | Sessões antigas (1ª fase do projeto) |
| `HANDOFF_FABRICA.md` | Construção da Fábrica de Figurinhas |
| `HANDOFF_SESSAO_2026-06-11.md` | Sessão de 11/jun (madrugada do lançamento) |
| `HANDOFF_SESSAO_2026-06-12.md` | Sessão de 12/jun manhã/tarde |
| `HANDOFF_SESSAO_2026-06-12_NOITE.md` | Sessão de 12/jun noite (mais recente) |

### 🛠️ Documentos operacionais
| Doc | Quando consultar |
|---|---|
| `ROTINAS_ZERAR.md` | Reset de jogadores, limpeza pré Go Live, debug |
| `README.md` | Entrada do repo no GitHub |

---

## 🗺️ Mapa mental por assunto

### Quero entender o **produto**
→ `SPEC_COMPLETO.md` §1 (Visão de produto) + `CLAUDE.md` §1

### Quero entender a **infra/stack**
→ `SPEC_COMPLETO.md` §2 (Infraestrutura) + `MAPA_SISTEMA.md` §1

### Quero entender **tokens/pontuação**
→ `CLAUDE.md` §0.1 (Tokenomia oficial) + `SPEC_COMPLETO.md` §4

### Quero entender o **schema do banco**
→ `SPEC_COMPLETO.md` §3 + `MAPA_SISTEMA.md` §2

### Quero entender **endpoints**
→ `SPEC_COMPLETO.md` §5

### Quero entender a **trava de pontuação**
→ `SPEC_COMPLETO.md` §7 + `HANDOFF_SESSAO_2026-06-12_NOITE.md` (implementação)

### Quero entender **deploy/edição**
→ `SPEC_COMPLETO.md` §12 + `CLAUDE.md` §0.2 + `MAPA_SISTEMA.md` §22

### Quero saber o **que falta**
→ `ROADMAP.md` (Notificações = TOP)

### Quero saber a **última sessão**
→ `HANDOFF_SESSAO_2026-06-12_NOITE.md`

---

## 🎨 Convenções da documentação

### Tags Obsidian
Use `#tag` para indexar por tópico. Tags principais:
- `#produto` `#infra` `#schema` `#endpoints` `#cron`
- `#tokenomics` `#pontuacao` `#bolao` `#arena` `#marketplace`
- `#trava-sabado` `#patrocinadores` `#pix` `#auth`
- `#notificacoes` `#frontend` `#design` `#brand`
- `#deploy` `#git` `#mcp`

### Wiki-links Obsidian
`[[outro-doc.md]]` cria backlink automático. Use pra cross-referenciar.

### Status emojis
- ✅ Entregue / funcionando
- 🚧 Em construção
- ⏳ Planejado / no roadmap
- ⚠️ Atenção / pendência operacional
- 🔥 Crítico / TOP prioridade
- 📌 Decisão registrada

---

## 🔐 Segredos (NÃO COMMITAR)

Tudo no banco `config` table:
- `mp_access_token` (Mercado Pago produção)
- `mp_webhook_secret`
- `llm_provedores.api_key` (LLMs)
- `api_football_key`, `odds_api_key`, `football_data_token`

**Nunca colocar no código nem no Git.**

---

## 🚦 Estado atual (12/jun/2026 noite)

✅ Beta 1.0 no ar · PIX produção real · Pote R$50 · Trava on/off com calendário · Relógio regressivo · Sidebar compacta · Reset zero executado · Tudo commitado no Git (HEAD `27dd5fc`+).

⏳ **Próxima ação:** desligar trava em `/admin/trava` no sábado 13/06 19h (jogo Brasil x Marrocos).

✅ **12/jun (sexta):** Sistema de Notificações **Onda A NO AR** — sino in-app + Web Push + composer admin (`MAPA_SISTEMA.md` §20).

🔥 **Próxima prioridade dev:** Onda B (WhatsApp Business) ou Tour inicial / Patrocinadores (`ROADMAP.md` §2-4).
