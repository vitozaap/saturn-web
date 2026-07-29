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

- **Landing (`app/page.tsx`):** cascata com delays explícitos múltiplos de `STAGGER` (≈ 80ms): header → título → subtítulo → dropzone (spring `rise`); o badge estala por último com rotação (spring `pop`, delay `STAGGER * 5`). Percepção de conclusão ≈ 500ms; o assentamento completo do badge chega a ≈ 850ms. O `h1` anima só `y` (sem `opacity`) para continuar pintável no HTML do servidor e seguir elegível a LCP.
- **Histórico / Login / Registro:** o bloco principal (tabela, card de auth) entra como unidade única com `rise`. Header estático.
- Entradas rodam **apenas no mount da rota** e fazem o papel de transição de navegação. Não há exit animations entre rotas (o App Router não as suporta bem e não são necessárias).

## 3. Uploader — morph contínuo (peça central)

- O contêiner do card é **um único elemento persistente** através de `idle → sending → compressing → error → result`, com `layout` animation: borda tracejada → sólida, dimensões se ajustam com spring `pop`.
- O conteúdo interno troca com `AnimatePresence mode="popLayout"` + crossfade rápido.
- **Arquitetura (como foi implementado):** `UploaderScreens` (`components/compress/upload/uploader/uploader.tsx`) continua trocando cards inteiros dentro de um `AnimatePresence mode="popLayout"`; a continuidade vem de um `layoutId="uploader-card"` **compartilhado** entre a área tracejada do dropzone, o `processing-card-shell` (envio/compressão) e o `error-card`. O Motion faz o FLIP entre os dois retângulos e o crossfade. Não existe um `MotionCardShell` único: cada card permanece um componente completo.
- **Requisito do `popLayout`:** todo filho direto do `AnimatePresence` precisa aceitar `ref` (React 19, sem `forwardRef`) e encaminhá-lo ao seu elemento `m.*` raiz. Sem isso o pop falha em silêncio e o card que sai continua no fluxo, espremendo o que entra.
- **Erro:** o card treme (shake horizontal curto) ao entrar no estado de erro.
- **Resultado:** o bloco de resultado NÃO participa do morph (geometrias incompatíveis — decisão de code review): entra com `rise` + exit fade. O badge de % estala com `pop` + rotação; o confete dispara junto (e é omitido sob reduced motion). O morph fica entre dropzone ↔ cards de processamento/erro.

## 4. Menus e chrome — sem mudança

Sheet mobile, dropdown do avatar, AlertDialog, tabs e toasts (sonner) continuam com as animações CSS do shadcn/tw-animate-css. Motion não entra nesses componentes.

## 5. Micro-interações

- **Dropzone com arquivo arrastado por cima (`drag-active`):** scale-up com `pop` + borda acesa — junto com o resultado, o momento mais springy da app.
- **Botões de ação primária:** `whileTap` scale 0.97 com `settle`. Sem `whileHover` de escala (hover permanece no CSS atual).
- **Barra de progresso do upload:** preenchimento de largura total transladado (`x: percent - 100%`) com `settle` a cada tick de % — transform, nunca `width`, e sem bounce perceptível (recuo de pico < 0,2px), preservando a ponta arredondada.
- **Linhas de status rotativas** do "Comprimindo": troca com slide vertical + fade via `AnimatePresence`.

## Tratamento de erros e casos-limite

- **Reduced motion:** animações Motion cobertas globalmente pelo `MotionConfig` (fades apenas); as View Transitions pré-existentes (login/registro) são neutralizadas por regra `prefers-reduced-motion` em `globals.css`.
- **Troca rápida de estados** (ex.: erro imediato após envio): `AnimatePresence mode="popLayout"` garante que o conteúdo que sai não empurre o que entra; springs `settle` em saídas evitam sobreposição visual.
- **Cancelamento durante upload:** volta ao estado `idle` pelo mesmo morph (card → dropzone tracejada).
- **Cascata só na primeira vez:** a cascata da landing roda no mount da rota, mas **não** ao voltar para `idle` depois de uma tentativa (flag `hasLeftIdle` em `UploaderScreens` → prop `animateEntrance` em `UploadForm`). Sem isso o morph de volta aterrissaria num destino com `opacity: 0`.

## Testes e validação

- `npm run lint` e `npm run build` passam (React Compiler ativo — verificar compatibilidade dos componentes `m.*`).
- Validação visual manual dos fluxos: landing (primeiro load), upload completo até resultado, erro + retry, cancelamento, navegação para histórico/login.
- Verificar `prefers-reduced-motion` emulado no DevTools: nenhuma animação de transform deve rodar.
- Confirmar que sheet/dropdown/dialog continuam idênticos (nenhuma regressão de chrome).

O `popLayout` e o morph não emitem erro de lint, de tipo nem de console quando quebram — a verificação precisa inspecionar o DOM durante a transição:

- **Morph engatado:** durante a troca, o elemento que sai tem `data-motion-pop-id` e `position: absolute` (fora do fluxo); o que entra tem um `transform` interpolando da geometria antiga para a sua.
- **Sem "piscar" lado a lado:** em nenhum frame dois cards ocupam o fluxo simultaneamente.
- **Reduced motion:** o selo de % precisa terminar em `opacity: 1` / `transform: none` (o risco real é ficar preso em `scale: 0`), e o confete não deve renderizar nenhuma partícula.

## Fora de escopo

- Animações em e-mails, página de API/Swagger ou qualquer coisa fora de `web/`.
- View Transitions API do Next.js (reavaliação futura, se exit animations entre rotas virarem requisito).
- Recompressão, seletor de formato e demais features ausentes do design de referência.
