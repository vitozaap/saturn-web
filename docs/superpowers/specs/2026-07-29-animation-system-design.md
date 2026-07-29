# Sistema de animações do Squish (web)

**Data:** 2026-07-29
**Status:** Aprovado (brainstorm com companion visual)
**Escopo:** `web/` — frontend Next.js

## Objetivo

Dar personalidade de movimento à app usando Framer Motion (pacote `motion`), cobrindo entradas de página, transições de estado do uploader e micro-interações — sem tocar nas animações CSS dos componentes shadcn de chrome (menus, dialogs, tabs, toasts).

## Decisões (com alternativas descartadas)

| Tema | Decisão | Alternativas descartadas |
| --- | --- | --- |
| Personalidade | **Springy e brincalhão**: springs com overshoot são a assinatura visual do movimento | Suave/discreto; híbrido calmo+springy |
| Transição de telas do uploader | **Morph contínuo**: um único contêiner persistente se transforma entre estados | Crossfade + pop; slide direcional |
| Menus (sheet mobile, dropdown, dialogs) | **Padrão shadcn intocado** (CSS/tw-animate-css) | Spring sutil; spring forte |
| Entrada da landing | **Stagger springy** em cascata (~80ms entre elementos), badge estala por último | Sem entrada; só o herói |
| Entrada das demais rotas | **Entrada leve**: bloco principal entra como unidade única com pop suave | Stagger completo; estático |

Na prática o sistema é springy no **conteúdo** e nos **momentos de recompensa**, e discreto no **chrome utilitário** — os menus abrem dezenas de vezes por sessão e ficam com o CSS pronto do shadcn.

## 1. Fundação técnica

- **Biblioteca:** `motion` (Framer Motion v12+). Imports de `motion/react`, sempre em client components.
- **Bundle:** `LazyMotion` com feature set `domMax` + componentes `m.*` (nunca `motion.*`), carregado uma única vez em um provider client montado no layout raiz. `domMax` é necessário porque o morph do uploader usa layout animations (o set menor, `domAnimation`, não as inclui); ainda assim é menor que importar `motion.*` direto.
- **Tokens de movimento** centralizados em `lib/motion.ts`, com três springs nomeados:
  - `pop` — stiffness alta, bounce marcado. A assinatura springy (badges, dropzone ativa, morph do card).
  - `rise` — subida com leve overshoot, para entradas de página/blocos.
  - `settle` — sem bounce, para saídas, ajustes e progresso.
  Nenhum componente define spring inline; todos importam dos tokens.
- **Acessibilidade:** `MotionConfig reducedMotion="user"` no provider. Usuários com `prefers-reduced-motion` recebem apenas fades, sem trabalho extra por componente.
- **Performance:** animar somente `transform` e `opacity`. O morph usa layout animations do Motion (FLIP, transform por baixo) — nunca animar `width`/`height`/`top` manualmente.

## 2. Entradas de página

- **Landing (`app/page.tsx`):** cascata via `variants` + `staggerChildren` ≈ 80ms: header → título → subtítulo → dropzone (spring `rise`); o badge "até 500 MB" estala por último com rotação (spring `pop`). Duração total < 700ms.
- **Histórico / Login / Registro:** o bloco principal (tabela, card de auth) entra como unidade única com `rise`. Header estático.
- Entradas rodam **apenas no mount da rota** e fazem o papel de transição de navegação. Não há exit animations entre rotas (o App Router não as suporta bem e não são necessárias).

## 3. Uploader — morph contínuo (peça central)

- O contêiner do card é **um único elemento persistente** através de `idle → sending → compressing → error → result`, com `layout` animation: borda tracejada → sólida, dimensões se ajustam com spring `pop`.
- O conteúdo interno troca com `AnimatePresence mode="popLayout"` + crossfade rápido.
- **Reestruturação necessária:** `UploaderScreens` (`components/compress/upload/uploader/uploader.tsx`) deixa de trocar cards inteiros e passa a renderizar um `MotionCardShell` único que recebe o miolo de cada estado. `sending-card`, `compressing-card`, `error-card` e `result-card` viram "miolos" (conteúdo interno), não cards completos. `processing-card-shell` é absorvido/substituído pelo novo shell.
- **Erro:** o card treme (shake horizontal curto) ao entrar no estado de erro.
- **Resultado:** o badge de % estala com `pop` + rotação; o confete previsto no design dispara junto.

## 4. Menus e chrome — sem mudança

Sheet mobile, dropdown do avatar, AlertDialog, tabs e toasts (sonner) continuam com as animações CSS do shadcn/tw-animate-css. Motion não entra nesses componentes.

## 5. Micro-interações

- **Dropzone com arquivo arrastado por cima (`drag-active`):** scale-up com `pop` + borda acesa — junto com o resultado, o momento mais springy da app.
- **Botões de ação primária:** `whileTap` scale 0.97 com `settle`. Sem `whileHover` de escala (hover permanece no CSS atual).
- **Barra de progresso do upload:** largura anima com `settle` a cada tick de % — sem bounce (progresso não pode recuar visualmente).
- **Linhas de status rotativas** do "Comprimindo": troca com slide vertical + fade via `AnimatePresence`.

## Tratamento de erros e casos-limite

- **Reduced motion:** coberto globalmente pelo `MotionConfig` (fades apenas).
- **Troca rápida de estados** (ex.: erro imediato após envio): `AnimatePresence mode="popLayout"` garante que o conteúdo que sai não empurre o que entra; springs `settle` em saídas evitam sobreposição visual.
- **Cancelamento durante upload:** volta ao estado `idle` pelo mesmo morph (card → dropzone tracejada).

## Testes e validação

- `npm run lint` e `npm run build` passam (React Compiler ativo — verificar compatibilidade dos componentes `m.*`).
- Validação visual manual dos fluxos: landing (primeiro load), upload completo até resultado, erro + retry, cancelamento, navegação para histórico/login.
- Verificar `prefers-reduced-motion` emulado no DevTools: nenhuma animação de transform deve rodar.
- Confirmar que sheet/dropdown/dialog continuam idênticos (nenhuma regressão de chrome).

## Fora de escopo

- Animações em e-mails, página de API/Swagger ou qualquer coisa fora de `web/`.
- View Transitions API do Next.js (reavaliação futura, se exit animations entre rotas virarem requisito).
- Recompressão, seletor de formato e demais features ausentes do design de referência.
