# Task: M5 — Ações do histórico

**Status:** ⬜ não iniciada
**Criada:** 2026-07-15 (revisada 2026-07-15: design v2 removeu "comprimir de novo")
**Depende de:** M4.
**Escopo:** `api/` + `web/`.
**Referência:** `../plano-frontend.md` (gaps 1, 2).

## Objetivo

Menu "···" por linha do histórico: **Copiar link** (não expiradas) e **Excluir**. Página pública do link compartilhável.

## Mudanças

### API
- **`DELETE /compressor/:id`** → 204. Apaga a row (owner-only), dispara deleção assíncrona dos objetos S3. Novo `deleteOwnedById` no `CompressorContract`.
- **Compartilhamento:**
  - `shareToken String? @unique` na `Compression` (+ migration).
  - `POST /compressor/:id/share` → `{ token }` (cria/rotaciona, owner-only; 409/410 se `EXPIRED`).
  - Rotas **públicas**: `GET /compressor/shared/:token` (metadata) e `POST /compressor/shared/:token/download` (URL presigned; 404/410 quando expirada).

### Web
- Menu "···" por linha: **Copiar link** (some em linhas expiradas) e **Excluir** — igual ao design v2.
- Excluir: otimista com toast "arquivo excluído do histórico".
- Copiar link: `POST share` → `navigator.clipboard.writeText` → toast "Link copiado".
- Rota pública `app/s/[token]/page.tsx`: metadata do vídeo + botão baixar (sem auth); estado "Expirado" quando o arquivo já foi excluído.

## Verificação

- Excluir remove da tabela e do banco; objetos S3 removidos.
- Link copiado abre em janela anônima e permite download.
- Linha expirada: menu só mostra Excluir; link antigo da mesma compressão responde expirado.
- Rotas públicas não vazam compressões sem token válido.

## Checklist

- [ ] API: DELETE :id (+ limpeza S3)
- [ ] API: shareToken + rotas públicas
- [ ] Web: menu ··· (copiar link/excluir, ciente de expiração)
- [ ] Web: página pública `s/[token]` (+ estado expirado)
- [ ] Verificação ponta a ponta das 2 ações
