# Squish Frontend — Arquitetura & Plano de Entregas

**Criado:** 2026-07-15 · **Revisado:** 2026-07-15 (design v2: sem seletor de formato, limite 500 MB, barra indeterminada na compressão, avisos de retenção 24h, sem "comprimir de novo")
**Fonte de design:** projeto Claude Design "Compressor de vídeo web" (`https://claude.ai/design/p/e10bda9c-661e-42d8-bb2a-aea102d31b50`), arquivo `Squish - Final.dc.html`.

## Fatos descobertos na API (afetam o plano)

- **Auth anônima já existe**: plugin `anonymous()` do better-auth habilitado (`api/src/config/auth/auth.config.service.ts:16`) e `User.isAnonymous` no schema (`api/prisma/schema.prisma:19`). "Usar antes de logar" é quase suportado — o frontend pode fazer `signIn.anonymous()` silencioso antes do primeiro upload.
- **Mas nenhum método de login real habilitado**: config do betterAuth não tem `emailAndPassword` (nem social) — só anonymous. "Entrar" e o banner de signup dependem de mudança na API.
- **Preset de qualidade existe, formato de saída não**: `RequestCompressionDto` aceita `preset: HIGH|MID|LOW` (`api/src/modules/compressor/dto/request-compression.dto.ts:28`), mas não há campo de formato. O body é `{ filename, contentType, preset? }` — não existe campo de tamanho; `sourceSize` é medido no confirm via S3 HeadObject. Sem problema: o design v2 removeu o seletor de formato e o GIF da lista de entrada (`contentType` já exige `/^video\//`).
- **Retenção já implementada na API**: cron diário marca `COMPLETED` > 1 dia como `EXPIRED` e apaga os objetos S3; outro cron expira `PENDING_UPLOAD`/`FAILED` > 5 min (`api/src/modules/cleanup/cleanup.service.ts`). Os avisos "24h" e o estado "Expirado" do design v2 mapeiam direto pra isso — zero gap.
- **CORS já configurado** para `WEB_URL` com credentials (`api/src/main.ts:19-22`) e `trustedOrigins: [WEB_URL]` no better-auth.
- **SSE** emite o `CompressionResponseDto` completo a cada mudança de status, pula `QUEUED`, fecha em `COMPLETED|FAILED` (`api/src/modules/compressor/compressor.service.ts:47-71`). `EXPIRED` existe no enum mas não é tratado como terminal em `isTerminal` (`compression.mapper.ts:56-58`) — frontend deve tratar como terminal defensivamente.
- Tamanhos são BigInt-como-string; `ratio` é calculado no servidor e vem nas respostas (`compression.mapper.ts:68-71`).
- Next 16.2 (`web/AGENTS.md` + docs embarcadas): `rewrites` seguem existindo em `next.config.ts`; `middleware.ts` agora é `proxy.ts`. `web/` hoje só tem o scaffold (`app/page.tsx`, `layout.tsx` com fontes erradas, um `button.tsx` shadcn).

## Decisões de arquitetura

### Rotas (App Router)

```
app/
  layout.tsx          # fontes, ThemeProvider, <Header/>, <Toaster/>
  page.tsx            # Landing → Comprimindo → Resultado: UMA rota, state machine no client
  history/page.tsx    # histórico logado (tabela + stats)
  login/page.tsx      # M4 — sign-in/up com email/senha
```

Landing/Comprimindo/Resultado são **uma página, não três rotas**: o objeto `File` e o XHR vivem em memória e não sobrevivem à navegação. `app/page.tsx` continua server component (metadata, copy estática do hero) renderizando um `<CompressFlow />` client component dono do estado de fase. Sem `proxy.ts` de route guard — `/history` checa a sessão no client (ou renda o empty state deslogado); middleware seria cerimônia desnecessária.

### Falar com a API: **proxy via rewrites do Next**

```ts
// next.config.ts
rewrites: async () => [
  { source: "/api/auth/:path*", destination: `${process.env.API_URL}/api/auth/:path*` },
  { source: "/api/compressor/:path*", destination: `${process.env.API_URL}/compressor/:path*` },
  { source: "/api/compressor", destination: `${process.env.API_URL}/compressor` },
]
```

Por quê: cookie de sessão vira first-party (sem ginástica de `SameSite=None` em prod com domínios distintos), `EventSource` funciona sem config (same-origin manda cookies sozinho), e nenhum código client precisa de base URL. CORS na API fica como fallback inofensivo. O PUT presigned é a única chamada direta ao S3 (CORS do bucket precisa liberar a origem web — nota de infra, não de código).

### Data fetching / estado: **sem lib, um hook**

- Sem react-query/SWR/zustand. O produto inteiro é um ciclo de vida. Um hook client `useCompression()` implementa a state machine: `idle → picking → creating → uploading(percent) → confirming → processing → completed | failed`, mapeando para: `POST /api/compressor` → **XHR** `PUT` no S3 (XHR porque `fetch` não tem progresso de upload; `xhr.upload.onprogress` dá o % real da fase de upload) → `POST /api/compressor/confirm-upload` → `new EventSource('/api/compressor/{id}/stream')`.
- A API é **status-only**, e o design v2 abraça isso: fase "Enviando" mostra % real (via `xhr.upload.onprogress`); fase "Comprimindo" mostra **barra indeterminada que pulsa** + frases de status rotativas por timer — sem número de %, sem MB em tempo real, sem ETA. Snap pra tela de Resultado no evento SSE `COMPLETED`. Nenhuma mudança na API.
- Meta do vídeo (resolução/duração) lida no client com `<video>` destacado + `URL.createObjectURL(file)` — como o design pretende.
- Histórico: client component com `GET /api/compressor` no mount; stats (contagem, total economizado, % médio) calculados da lista no browser. Fetch server-side exigiria forwarding de cookie sem benefício num dashboard atrás de auth.

### Layout de código (lean)

```
lib/
  api.ts          # ~60 linhas: fetch helpers tipados, uma função por endpoint
  types.ts        # tipo Compression espelhando CompressionResponseDto (sizes como string)
  auth-client.ts  # createAuthClient do better-auth/react + plugin anonymousClient
  format.ts       # formatBytes(str), formatPercent(ratio)
components/
  compress/       # dropzone, progress-card, result-card
  history/        # stats-row, compressions-table
  header.tsx, theme-toggle.tsx
```

Deps: `better-auth` (já instalado no scaffold) e `sonner` (ou shadcn toast) — nada mais. `@tanstack/react-query` está instalado mas **não será usado** (remover do `package.json`). Sem codegen do Swagger; são 5 endpoints, tipos à mão são menos maquinário.

Cuidados no `lib/api.ts`: `POST /compressor/download` responde a URL presigned como **texto puro, não JSON** (`res.text()`); o badge de economia é **`1 − ratio`** — `ratio` é `outputSize / sourceSize` (`compression.mapper.ts:68-71`), então ratio 0.33 = "−67%".

### Tamanhos BigInt

Manter como `string` em `lib/types.ts` (exatamente o que a API manda). Converter com `Number()` só na borda de formatação (`formatBytes`) — seguro abaixo de 2^53 bytes (~9 PB). `BigInt(str)` de verdade só onde soma importa: agregado "total economizado" do histórico. Nunca truque de reviver no `JSON.parse`.

### Fontes/tema

Trocar Geist/Inter do scaffold em `web/app/layout.tsx` por `Bricolage_Grotesque` (display), `Plus_Jakarta_Sans` (corpo), `JetBrains_Mono` (números) via `next/font/google`, ligadas às CSS variables que `app/globals.css` já espera. Dark mode via ThemeProvider que alterna classe (`next-themes` ou ~15 linhas à mão).

## Mapa de features (design → API)

| Feature do design | API |
|---|---|
| Upload drag-and-drop / picker (MP4/WebM/MOV, até 500 MB) | `POST /compressor` → PUT S3 (presigned) → `POST /compressor/confirm-upload`; limite 500 MB validado no client |
| Fase "Enviando" (% real) | `xhr.upload.onprogress` no PUT do S3 |
| Fase "Comprimindo" (barra indeterminada pulsante + frases de status) | `SSE GET /compressor/:id/stream` (status-only — casa exato com o design) |
| Card de erro ("Ops, o squish falhou") + tentar de novo | evento SSE `FAILED`; retry = novo fluxo completo |
| Cancelar (só na fase de envio) | client-only: aborta o XHR; sweep de 5 min expira a row `PENDING_UPLOAD` |
| Meta do arquivo (resolução/duração) | nenhuma — `<video>` no client |
| Resultado antes/depois + badge −% | último evento SSE: `sourceSize`, `outputSize`, `ratio` |
| Botão baixar | `POST /compressor/download` → URL presigned GET |
| Avisos "disponível por 24h / excluído em 24h" | copy estática; retenção real já existe (`cleanup.service.ts`) |
| Estado "Expirado" nas linhas do histórico | status `EXPIRED` do `GET /compressor` |
| "Comprimir outro" | reset de estado no client |
| Usar antes de logar (anônimo) | `POST /api/auth/sign-in/anonymous` (plugin já habilitado) |
| Banner convite signup (email → conta) | sign-up better-auth — **bloqueado, ver gaps** |
| Entrar / avatar / sessão | `/api/auth/*` (get-session, sign-in) — **método de login faltando, ver gaps** |
| Tabela histórico | `GET /compressor` |
| Stats do histórico | agregado client-side de `GET /compressor` (adequado até existir paginação) |
| Baixar por linha | `POST /compressor/download` |
| Preset de qualidade (se exposto na UI) | campo `preset` do `POST /compressor` — já suportado |
| Excluir, copiar link | **sem suporte na API — gaps abaixo** |
| Vídeo de exemplo | nada — `web/public/example.mp4`, fetch como Blob, fluxo normal |

Removidos no design v2 (deixaram de ser gaps): seletor de formato de saída, entrada GIF, "comprimir de novo", % real de compressão, cancel pós-fila.

## Gaps (frontend tem, API não)

1. **Excluir compressão** — sugestão: `DELETE /compressor/:id` → 204; apaga a row, dispara deleção assíncrona dos objetos S3. Precisa de `deleteOwnedById` no `CompressorContract`.
2. **Link compartilhável / copiar link** — URLs de download são presigned+curtas e tudo exige auth do dono. Sugestão: `shareToken String? @unique` na `Compression`; `POST /compressor/:id/share` → `{ token }` (cria/rotaciona, owner-only; 409/410 se `EXPIRED`); rotas **públicas** `GET /compressor/shared/:token` (metadata) e `POST /compressor/shared/:token/download` (URL presigned; 404/410 quando `EXPIRED`). Frontend adiciona rota pública `app/s/[token]/page.tsx`. Só pra linhas não expiradas — o design esconde "Copiar link" nas expiradas.
3. **Criação de conta (banner + Entrar)** — config do betterAuth não tem método de credencial. Sugestão: `emailAndPassword: { enabled: true }` no `auth.config.service.ts`, mais handler `onLinkAccount` no `anonymous({ ... })` migrando `Compression.userId` do user anônimo pro novo (better-auth deleta o user anônimo após o link por padrão — compressões seriam apagadas em cascata pelo `onDelete: Cascade` de `schema.prisma:47` sem isso).
4. **Stats do histórico** — sem gap na v1 (agregado client-side). Só vira `GET /compressor/stats` se/quando a listagem ganhar paginação.
5. **Vídeo de exemplo** — sem gap: asset estático em `web/public/`, passa pelo pipeline normal de upload.

## Riscos / decisões pendentes (achados da revisão)

- **Sweep de 5 min vs uploads de 500 MB**: o cron expira `PENDING_UPLOAD` > 5 min **a partir do `createdAt`** (a row nasce antes do upload começar) e apaga o objeto S3. Upload de 500 MB precisa de ~13,5 Mbps sustentados pra caber em 5 min — conexão mais lenta perde a row no meio do upload e o `confirm-upload` responde 409. Fix de uma linha na API: alargar a janela de `PENDING_UPLOAD` (30–60 min), mantendo 5 min só pra `FAILED`. Decidir antes da verificação do M2 com arquivos grandes.
- **Limite de 500 MB é só client-side**: a URL presigned assina apenas `content-type` (`s3.service.ts:50-52`, sem `ContentLength`) e o confirm aceita qualquer tamanho — nada impede 5 GB de chegar no worker. Aceito como risco na v1 ou vira validação de tamanho no `confirm-upload` (o HeadObject já traz o tamanho).

## Plano de entregas

Cada milestone tem task própria em `tasks/` (prefixo `todo-`/`wip-`/`done-`):

- **M1 — Shell & design system** (`todo-m1-shell-design-system.md`): fontes, header, dark mode, toast, landing fiel ao design, rewrites, stubs de `lib/`. Demo: landing pixel-faithful nos dois temas.
- **M2 — Fluxo de compressão ponta a ponta (API como está)** (`todo-m2-fluxo-compressao.md`): sign-in anônimo, state machine, fase Enviando com % real + fase Comprimindo indeterminada, SSE, card de erro, Resultado real, download + aviso 24h, exemplo, cancel de upload. Demo: soltar vídeo, ver squish, baixar. **É o produto.**
- **M3 — Histórico read-only** (`todo-m3-historico-readonly.md`): tabela com estado Expirado, stats client-side, download por linha, nota de retenção, empty state. Demo: comprimir dois vídeos e vê-los listados.
- **M4 — Contas reais** (`todo-m4-contas-reais.md`): API `emailAndPassword` + migração do anônimo; web login + banner de conversão. Demo: comprimir anônimo, criar conta pelo banner, histórico persiste.
- **M5 — Ações do histórico** (`todo-m5-acoes-historico.md`): API delete/share; web menu ··· (Copiar link, Excluir) + página pública. Demo: tela de histórico completa igual ao design.
- **M6 — Polish & fidelidade (stretch)** (`todo-m6-polish.md`): microinterações, passada visual 1:1 com o design.

## Arquivos críticos

- `web/next.config.ts` (rewrites proxy — fundação pra cookies de auth + SSE)
- `web/app/layout.tsx` (fontes, tema, header, toaster)
- `web/app/page.tsx` (landing + host do CompressFlow)
- `web/lib/api.ts` (novo — client tipado da API, caminho único de dados)
- `api/src/config/auth/auth.config.service.ts` (gap M4: habilitar emailAndPassword + migração onLinkAccount)
