# Task: M2 — Fluxo de compressão ponta a ponta (API como está)

**Status:** ⬜ não iniciada
**Criada:** 2026-07-15
**Depende de:** M1.
**Escopo:** só `web/` — usa a API atual, sem mudanças nela. **É o produto.**
**Referência:** `../plano-frontend.md`.

## Objetivo

Soltar um vídeo na landing → ver o squish acontecendo → baixar o resultado. Telas Comprimindo e Resultado funcionando com dados reais.

## Mudanças

### Auth anônima
- `lib/auth-client.ts` — `createAuthClient` (better-auth/react) + plugin `anonymousClient`.
- `signIn.anonymous()` silencioso antes do primeiro `POST /api/compressor` (endpoints exigem sessão).
- Dep nova: `better-auth`.

### State machine — hook `useCompression()`
`idle → picking → creating → uploading(percent) → confirming → processing → completed | failed`

1. `POST /api/compressor` — body `{ filename, contentType, preset? }` (`filename` minúsculo; `preset` opcional, default `MID`; **não existe** campo de tamanho — `sourceSize` é medido no servidor via S3 HeadObject no confirm) → presigned URL.
2. **XHR** `PUT` direto no S3 — `xhr.upload.onprogress` dá o % real. (fetch não tem progresso de upload.)
3. `POST /api/compressor/confirm-upload` → QUEUED.
4. `new EventSource('/api/compressor/{id}/stream')` → atualiza status até `COMPLETED|FAILED`. Tratar `EXPIRED` como terminal defensivamente. **Fechar o EventSource (`es.close()`) no evento terminal** — o Nest encerra o stream e o browser reconecta sozinho, gerando loop infinito de reconexão se não fechar.
5. Qualquer falha no caminho (400/401 no create, erro/CORS/URL expirada no PUT do S3, 404/409 no confirm) cai no mesmo card de erro — nunca deixar a UI presa em `uploading`/`confirming`.

### Tela Comprimindo (duas fases)
- Card com nome do arquivo, meta (resolução/duração via `<video>` + `URL.createObjectURL`), animação squish.
- Fase **"Enviando"**: barra com % real (`xhr.upload.onprogress`) + título "Enviando seu vídeo…". Botão Cancelar visível só aqui — aborta o XHR e volta pra landing (pós-confirm não tem cancel).
- Fase **"Comprimindo"**: barra **indeterminada pulsante** (sem %, sem MB, sem ETA) + frases de status lúdicas rotativas por timer + chip "Squishando". Vai pra Resultado no SSE `COMPLETED`.
- Rodapé do card: "Processado com segurança na nuvem — excluído automaticamente em 24h".

### Card de erro (SSE `FAILED`)
- Mesmo lugar do card de progresso: "Ops, o squish falhou." + nome do arquivo, ações "Tentar de novo" (refaz o fluxo completo) e "Escolher outro vídeo".

### Tela Resultado
- Cards antes/depois (`sourceSize`/`outputSize` do último evento SSE), badge −% (`ratio`), confetti.
- Baixar: `POST /api/compressor/download` → abrir URL presigned.
- "Comprimir outro" → reset do estado.
- Aviso de retenção: "Disponível por 24h — depois a gente exclui do servidor."
- Sem seletor de formato — a saída mantém o formato de entrada.

### Validação e erros
- Aceitar `video/*` (MP4/WebM/MOV), limite **500 MB**, mensagem clara quando inválido. GIF não é aceito.
- Tratar `EXPIRED` como terminal defensivamente.

### Vídeo de exemplo
- `public/example.mp4` pequeno; link "testar com um vídeo de exemplo" faz fetch como Blob e entra no fluxo normal.

## Verificação

- Fluxo completo com vídeo real: upload com % subindo, transição pra processing, resultado com tamanhos reais, download abre o arquivo comprimido.
- Cancelar durante upload volta pra landing sem erro no console.
- Recarregar durante processing: comportamento aceitável (v1: perde a tela, histórico cobre no M3).

## Checklist

- [x] `lib/auth-client.ts` + sign-in anônimo
- [x] `lib/api.ts` implementado (4 endpoints + tipos)
- [x] Tela Comprimindo — fase Enviando (% real + cancelar) e fase Comprimindo (barra indeterminada + frases)
- [x] Card de erro (FAILED) com tentar de novo
- [x] Tela Resultado (antes/depois, −%, download, aviso 24h, comprimir outro)
- [ ] Validação de arquivo (500 MB, MP4/WebM/MOV)
