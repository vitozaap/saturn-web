# Task: M3 — Histórico read-only

**Status:** ⬜ não iniciada
**Criada:** 2026-07-15
**Depende de:** M2.
**Escopo:** só `web/` — usa `GET /compressor` existente.
**Referência:** `../plano-frontend.md`.

## Objetivo

Página `/history` com a tabela de compressões do usuário, stats agregadas e download por linha. Funciona também pra sessão anônima.

## Mudanças

### `app/history/page.tsx`
- Client component; `GET /api/compressor` no mount. Sem guard de rota — deslogado/sem itens cai no empty state.
- Header da página: título "Suas compressões" + subtítulo + nota de retenção: "Cada arquivo fica disponível por 24h — depois é excluído do servidor."

### Stats (client-side)
- 3 cards: contagem de vídeos, total economizado (soma com `BigInt` — sizes vêm como string), % médio.
- `components/history/stats-row.tsx`.

### Tabela
- `components/history/compressions-table.tsx`: colunas Arquivo (thumb placeholder + nome + meta), Data, Tamanho (`orig → comp`), Economia (badge −%), Ações.
- Ação por linha: **Baixar** (`POST /api/compressor/download`) — só em linhas não expiradas. Menu "···" fica pro M5.
- Linhas `EXPIRED`: badge "Expirado" (borda tracejada, ícone de relógio) no lugar do botão Baixar.
- Badges de status pra itens não-COMPLETED (QUEUED/PROCESSING/FAILED).
- Empty state: "Nada por aqui ainda" + CTA "Comprimir um vídeo".

### Header global
- Sessão presente → "Histórico" + avatar; senão botão Entrar (ação real no M4).
- Botão "Novo vídeo" no header da `/history`.

## Verificação

- Comprimir 2 vídeos → ambos aparecem na tabela com tamanhos/economia corretos.
- Stats batem com a soma manual das linhas.
- Download por linha funciona.
- Usuário sem compressões vê o empty state.

## Checklist

- [ ] Rota `/history` + fetch da lista
- [ ] Stats row (contagem, total BigInt, média)
- [ ] Tabela com colunas do design + badges de status
- [ ] Estado "Expirado" (sem Baixar) + nota de retenção 24h
- [ ] Download por linha (não expiradas)
- [ ] Empty state
- [ ] Header ciente da sessão + Novo vídeo
