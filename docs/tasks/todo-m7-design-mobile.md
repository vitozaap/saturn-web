# Task: M7 — Design mobile

**Status:** 🟨 implementada (falta conferência visual)
**Criada:** 2026-07-27
**Depende de:** M1–M3 (shell, fluxo de compressão, histórico read-only).
**Escopo:** só `web/`.
**Referência:** design `Squish - Mobile.dc.html` (telas 01–08) no projeto Claude Design "Compressor de vídeo web".

## Objetivo

Tornar as telas existentes utilizáveis em telefone, seguindo o design mobile. Mobile-first, sem
duplicar componentes por viewport — exceto onde a estrutura realmente diverge (tabela vs. lista
do histórico).

Breakpoints: base (< 640) telefone · `sm` (640) telefone grande · `md` (768) tabela e nav inline ·
`lg` (1024) tipografia desktop cheia. Alvo mínimo 360 px, design a 402 px.

## Fora de escopo (decidido com o autor)

- **Telas 05 (Como funciona) e 06 (Formatos)** — correspondem a `/help` e `/formats`, que o header
  já linka mas que nunca foram criadas (404 hoje, no desktop também). Ficam para um PR próprio.
  O sheet mobile espelha a nav atual, então herda os mesmos links quebrados.
- **Chips "Re-espremer em LOW/HIGH" da tela 03** — contradizem o design v2 e o `plano-frontend.md`
  (linha 102 removeu "comprimir de novo"), e a API não tem endpoint de recompressão.
- **Card em volta dos formulários de auth (telas 07/08)** — o design mostra, mas manter o desktop
  como está foi preferido.

## Mudanças

**Shell e tokens**

- `app/layout.tsx`: o shell era `absolute inset-0`, o que prendia o app à altura da viewport e
  impedia o scroll quando o conteúdo era mais alto (landing com presets empilhados, histórico).
  Agora o documento rola no telefone (`min-h-dvh`) e volta a ser preso à viewport a partir de `md`,
  onde a tabela do histórico depende disso para ter scroll próprio.
- `app/globals.css`: `--app-radial` (claro/escuro) exposto como utilitário `bg-app-radial`, no lugar
  do `bg-[radial-gradient(...#E2D3FA...)]` duplicado com hex cru; novo `--text-2xs` para os rótulos
  mono de 10 px; removido `--top-spacing: 20px`, que não era usado.

**Navegação**

- `components/ui/sheet.tsx` instalado via shadcn (variante `base-luma`, sobre `@base-ui/react/dialog`).
- `components/mobileNav.tsx`: painel único abaixo de `md`. Gatilho hambúrguer para visitante
  (tela 01) e o próprio avatar quando logado (tela 04) — substitui o dropdown do avatar no mobile
  em vez de conviver com ele repetindo os mesmos itens.
- `components/navItems.ts`: `NAV_PAGES`, `NavUser` e `isSignedIn` compartilhados entre a nav inline
  e o sheet, para as duas listas não divergirem.
- `header.tsx` / `headerSkeleton.tsx`: paddings e logo responsivos; skeleton com variante mobile
  (pílula "Entrar" + gatilho) para não causar layout shift.

**Telas**

- Landing: escala tipográfica `text-4xl` → `sm:5xl` → `lg:6xl`; alturas fracionárias restritas a
  `md`; presets empilhados abaixo de `sm`; cópia de toque no dropzone e botão "Escolher arquivo"
  só no mobile, ligado ao `open()` do `useDropzone` (fora do root, para não abrir o picker duas
  vezes, e `type="button"` porque vive dentro do `<form>`).
- Enviando/Comprimindo: o chip de status desce para a própria linha abaixo de `sm` (não cabia com
  thumbnail e nome em 375 px); rodapé empilha.
- Resultado: `PosterBox` vira linha horizontal no telefone e volta ao card vertical em `sm`; o badge
  −% troca o eixo de sobreposição junto com a direção do empilhamento; botões e banner de cadastro
  em coluna.
- Histórico: `historyTable.tsx` concentrava tabela, ações, estado vazio e formatação. Extraídos
  `useCompressionActions.ts` (uma transition por linha, o que dispensa o `deletingId` global),
  `rowActions.tsx`, `emptyState.tsx` e os helpers de status/data/economia para `helpers.ts`. Novo
  `historyList.tsx` com os cards da tela 04 abaixo de `md`; a tabela continua a partir de `md`.
  O card mobile promove "Baixar" a botão e mantém copiar link/apagar no menu `...`.
- Auth: `w-[400px]` (que estourava em 375 px) → `w-full max-w-100`, com a calha por dentro do painel
  abaixo de `sm` para o desktop não perder largura.
- Presets: o card usava `<label htmlFor={preset.title}>` apontando para `id={preset.title}`, mas o
  base-ui descarta o `id` recebido e gera o próprio. O `for` ficava pendurado, o label sem controle
  associado e tocar no card não selecionava nada. A seleção agora sai do próprio label.

## Verificação

- `npm run build` ✅ e `npm run lint` ✅ (8 warnings, todos pré-existentes).
- ⬜ **Pendente:** conferência visual em 360/402/768/1440 px nos temas claro e escuro contra as
  telas 01–04, 07 e 08. Não foi possível nesta máquina: a extensão do Chrome não conecta e o Chrome
  headless derruba o próprio serviço de rede (`Network service crashed`, GPU com `0xC0000005`).

### Ao testar em celular

Servir o dev por IP em HTTP (`http://<ip-da-lan>:3000`) **quebra a hidratação** e deixa a página
inteira sem interatividade. Não é bug do app: `next/dist/shared/lib/router/utils/cache-busting-search-param.js`
chama `globalThis.crypto.subtle.digest(...)` sem guarda, e `crypto.subtle` só existe em secure
context — `localhost` é, um IP em HTTP não. Reproduz em qualquer navegador, não só no Safari, e não
afeta produção (HTTPS). Para testar em aparelho, subir o dev com `next dev --experimental-https`.

## Checklist

- [x] Shell rola no mobile / preso à viewport em `md`
- [x] Tokens `bg-app-radial` e `text-2xs`; sem valores em px hardcoded no código de app
- [x] Sheet de navegação mobile
- [x] Landing, Enviando/Comprimindo, Resultado e Erro responsivos
- [x] Lista de cards do histórico + refatoração das fronteiras
- [x] Auth sem largura fixa
- [ ] Conferência visual 1:1 nos dois temas
