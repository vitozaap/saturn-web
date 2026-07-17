# Task: M1 — Shell & design system

**Status:** ⬜ não iniciada
**Criada:** 2026-07-15
**Escopo:** só `web/` — zero chamadas à API.
**Referência:** `../plano-frontend.md` + design `Squish - Final.dc.html` (Claude Design).

## Objetivo

Base visual fiel ao design: fontes, tema claro/escuro, header, toast e a landing completa (hero + dropzone estática). Fundação técnica: rewrites de proxy e stubs de `lib/`.

## Mudanças

### `app/layout.tsx`
- Trocar fontes do scaffold por `Bricolage_Grotesque` (display), `Plus_Jakarta_Sans` (corpo), `JetBrains_Mono` (números/meta) via `next/font/google`, ligadas às CSS variables de `app/globals.css`.
- ThemeProvider com toggle de classe (`next-themes` ou ~15 linhas à mão), `<Header/>`, `<Toaster/>` (sonner ou shadcn toast).

### `app/page.tsx` (landing estática)
- Hero: badge rotacionado ("Grátis · sem marca d'água · sem instalar"), título "Dê um squish nos seus vídeos.", subtítulo.
- Dropzone com borda tracejada animada, ícone bob, CTA "Escolher arquivo", linha de formatos "MP4 · WebM · MOV — até 500 MB", link "testar com um vídeo de exemplo" (sem ação ainda).
- Header: logo squish, nav (Como funciona, Formatos), botão Entrar (sem ação).
- Elementos flutuantes decorativos (bolinhas, "−82%").

### `next.config.ts`
- Rewrites de proxy (`/api/auth/*` e `/api/compressor*` → `API_URL`). Ver plano.

### `lib/` (stubs)
- `types.ts` — tipo `Compression` espelhando `CompressionResponseDto` (sizes como string).
- `api.ts` — assinaturas das funções (uma por endpoint), corpo em M2.
- `format.ts` — `formatBytes(str)`, `formatPercent(ratio)` (funcionais, com testes manuais rápidos).

## Verificação

- `npm run dev` → landing idêntica ao design nos temas claro e escuro (toggle funciona).
- Fontes corretas (Bricolage no título, Jakarta no corpo, JetBrains na linha de formatos).
- `npm run build` e `npm run lint` passam.

## Checklist

- [x] Fontes + CSS variables
- [x] ThemeProvider + toggle dark mode
- [x] Header + Toaster
- [ ] Landing (hero + dropzone estática + decorações)
- [ ] Rewrites no `next.config.ts`
- [ ] Stubs `lib/types.ts`, `lib/api.ts`, `lib/format.ts`
- [x] Build + lint verdes
