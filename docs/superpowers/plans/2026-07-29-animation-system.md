# Plano de implementação — Sistema de animações do Squish

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o sistema de animações springy do spec `docs/superpowers/specs/2026-07-29-animation-system-design.md`: entradas de página, morph contínuo do uploader e micro-interações com Framer Motion (`motion`), sem tocar no chrome shadcn.

**Architecture:** Provider único (`LazyMotion domMax` + `MotionConfig reducedMotion="user"`) no layout raiz; tokens de spring centralizados em `lib/motion.ts`; morph do uploader via `layoutId` compartilhado + `AnimatePresence mode="popLayout"`; entradas com componentes `m.*` e delays explícitos.

**Tech Stack:** Next.js 16.2 (App Router, React 19, React Compiler), `motion` v12+ (imports de `motion/react`, componentes `m.*`), Tailwind 4, shadcn.

**Contexto obrigatório para o executor:**
- O spec aprovado é a fonte de verdade: `docs/superpowers/specs/2026-07-29-animation-system-design.md`.
- Não há framework de testes neste pacote. A validação de cada task é: `npm run lint`, `npm run build` e checagem visual no `npm run dev` (o spec define assim).
- **Nunca** importar `motion.*` de `motion/react` — sempre `m.*` (o provider usa `LazyMotion strict`, que lança erro se `motion.*` for usado).
- Menus (Sheet, Dropdown, AlertDialog, tabs, sonner) **não são tocados** — seguem com CSS do shadcn.
- Branch de trabalho: criar `feat/animation-system` a partir de `develop`.
- UI copy em português; código e commits em inglês.

---

### Task 1: Fundação — instalar `motion`, tokens e provider

**Files:**
- Modify: `package.json` (via npm)
- Create: `lib/motion.ts`
- Create: `components/motion-provider.tsx`
- Modify: `app/layout.tsx`

- [x] **Step 1: Instalar a biblioteca**

Run: `npm install motion`
Expected: adiciona `"motion"` (v12+) em `dependencies` sem erros de peer deps (React 19 é suportado pelo v12).

- [x] **Step 2: Criar os tokens de movimento**

Create `lib/motion.ts`:

```ts
import type { Transition } from "motion/react"

/**
 * Motion tokens — the only place springs are defined.
 * Components import these; never write spring configs inline.
 */

/** Signature spring: high stiffness, visible overshoot. Badges, drop-active, card morph. */
export const pop: Transition = { type: "spring", stiffness: 500, damping: 18, mass: 0.8 }

/** Entrance spring: rises with a slight overshoot. Page/block entrances. */
export const rise: Transition = { type: "spring", stiffness: 260, damping: 24 }

/** No-bounce spring: exits, progress, adjustments. */
export const settle: Transition = { type: "spring", stiffness: 300, damping: 32 }

/** Gap between staggered landing elements (seconds). */
export const STAGGER = 0.08
```

- [x] **Step 3: Criar o provider**

Create `components/motion-provider.tsx`:

```tsx
"use client"

import { LazyMotion, MotionConfig, domMax } from "motion/react"

// domMax (not domAnimation) because the uploader morph relies on layout
// animations. `strict` throws if any `motion.*` component sneaks in.
export function MotionProvider({ children }: { children: React.ReactNode }) {
    return (
        <LazyMotion features={domMax} strict>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </LazyMotion>
    )
}
```

- [x] **Step 4: Montar o provider no layout raiz**

Em `app/layout.tsx`, importar e envolver o conteúdo dentro do `ThemeProvider` (o provider precisa cobrir header, páginas e toasts):

```tsx
import { MotionProvider } from "@/components/motion-provider";
```

```tsx
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MotionProvider>
            <Toaster />
            <div className="relative z-0 flex flex-1 flex-col bg-app-radial md:min-h-0">
              <Suspense fallback={<HeaderSkeleton />}>
                <Header />
              </Suspense>
              {children}
            </div>
          </MotionProvider>
        </ThemeProvider>
```

- [x] **Step 5: Verificar**

Run: `npm run lint && npm run build`
Expected: ambos passam; nenhuma mudança visual ainda.

- [x] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/motion.ts components/motion-provider.tsx app/layout.tsx
git commit -m "feat: add motion foundation (tokens, LazyMotion provider)"
```

---

### Task 2: Componente `Entrance` + entrada do header

**Files:**
- Create: `components/motion/entrance.tsx`
- Modify: `app/layout.tsx`

- [x] **Step 1: Criar o componente de entrada reutilizável**

Create `components/motion/entrance.tsx`:

```tsx
"use client"

import { m } from "motion/react"

import { rise } from "@/lib/motion"

type EntranceProps = {
    delay?: number
    className?: string
    children: React.ReactNode
}

/**
 * Single-block page entrance (spec §2): fades in rising with the `rise`
 * spring. Server components can use it around their content — children
 * cross the boundary untouched.
 */
export function Entrance({ delay = 0, className, children }: EntranceProps) {
    return (
        <m.div
            className={className}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...rise, delay }}
        >
            {children}
        </m.div>
    )
}
```

- [x] **Step 2: Animar a entrada do header**

Em `app/layout.tsx`, envolver o bloco do header (o layout raiz só monta no primeiro carregamento, então o header anima uma vez por page load — exatamente o que o spec pede):

```tsx
import { Entrance } from "@/components/motion/entrance";
```

```tsx
            <div className="relative z-0 flex flex-1 flex-col bg-app-radial md:min-h-0">
              <Entrance>
                <Suspense fallback={<HeaderSkeleton />}>
                  <Header />
                </Suspense>
              </Entrance>
              {children}
            </div>
```

- [x] **Step 3: Verificar**

Run: `npm run lint`
Expected: passa.
Run: `npm run dev` e abrir `http://localhost:3000`.
Expected: o header sobe suavemente com leve overshoot ao carregar; navegar entre rotas **não** re-anima o header.

- [x] **Step 4: Commit**

```bash
git add components/motion/entrance.tsx app/layout.tsx
git commit -m "feat: add Entrance component and header entrance"
```

---

### Task 3: Cascata springy da landing

**Files:**
- Modify: `components/compress/upload/uploadForm.tsx`

- [x] **Step 1: Converter os blocos da landing para `m.*` com delays em cascata**

Reescrever `components/compress/upload/uploadForm.tsx`. A ordem da cascata (spec §2): header (Task 2, delay 0) → título → subtítulo → formulário (dropzone + presets) → linha "Até 500MB" — todos com `rise`; o badge rotacionado ("Grátis · rápido…") **estala por último** com `pop` + rotação. O `main` root também ganha `exit` (fade) para a Task 5 (AnimatePresence do uploader).

```tsx
"use client"
import { FormProvider, SubmitErrorHandler, useForm } from "react-hook-form"
import { m } from "motion/react"
import { compressionSchema, ICompressionForm } from "./validation"
import { zodResolver } from "@hookform/resolvers/zod"
import Dropzone from "./dropzone"
import { Presets } from "./presets"
import { UploaderContext } from "./uploader/uploader-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"
import { pop, rise, settle, STAGGER } from "@/lib/motion"

const riseAt = (step: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { ...rise, delay: STAGGER * step },
})

export function UploadForm() {
    const actorRef = UploaderContext.useActorRef()
    const methods = useForm<ICompressionForm>({
        resolver: zodResolver(compressionSchema),
        defaultValues: {
            preset: "MID",
        }
    })
    const onError: SubmitErrorHandler<ICompressionForm> = async (errors) => {
        toast.error("Não foi possível enviar o arquivo", {
            description: errors.file?.message ?? errors.preset?.message ?? "Verifique o arquivo e tente de novo."
        })
    }
    const onUpload = (data: ICompressionForm) => {
        actorRef.send({ type: "SUBMIT", file: data.file, preset: data.preset })
    }
    return (
        <FormProvider {...methods}>
            <m.main
                exit={{ opacity: 0, transition: settle }}
                className="flex w-full flex-col items-center gap-6 justify-center max-w-2xl md:h-full"
            >
                <section className="flex flex-col gap-3 sm:gap-4 items-center">
                    <m.div
                        initial={{ opacity: 0, scale: 0, rotate: -14 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ ...pop, delay: STAGGER * 5 }}
                    >
                        <Badge variant={"secondary"} className="-rotate-2">Grátis · rápido · sem marca d&apos;água</Badge>
                    </m.div>
                    <m.h1 {...riseAt(1)} className="font-heading font-extrabold tracking-tighter text-4xl sm:text-5xl lg:text-6xl max-w-md text-center text-balance">
                        Dê um <span className="text-primary underline decoration-wavy decoration-4 decoration-coral">squish</span> nos seus vídeos.
                    </m.h1>
                    <m.p {...riseAt(2)} className="text-muted-foreground max-w-xl text-center text-pretty sm:text-lg">Comprima qualquer vídeo e baixe na hora! Sem perder a qualidade que realmente importa.</m.p>
                </section>
                <m.form {...riseAt(3)} onSubmit={methods.handleSubmit(onUpload, onError)} className="flex w-full flex-col gap-5 md:h-7/12">
                    <Dropzone className="md:h-full" />
                    <Presets />
                </m.form>
                <m.div {...riseAt(4)} className="flex">
                    <p className="text-muted-foreground text-xs text-center text-pretty">Até 500MB - <Button variant={"link"} nativeButton={false} size={"xs"} className={"p-0"} render={<Link href="/login">Faça login</Link>} /> para mais funcionalidades.</p>
                </m.div>
            </m.main>
        </FormProvider>)
}
```

Nota: o badge fica no DOM antes do título mas anima por último (delay `STAGGER * 5`) — a ordem visual vem dos delays, não do DOM. Total da cascata ≈ 0,4s de delays + spring ≈ < 700ms (limite do spec).

- [x] **Step 2: Verificar**

Run: `npm run lint`
Expected: passa.
No `npm run dev`, recarregar `http://localhost:3000`.
Expected: header → título → subtítulo → dropzone/presets → linha "Até 500MB" sobem em cascata; o badge estala girando por último. Comportamento aceito (registrado no debate): a cascata re-roda ao voltar para `idle` via "Comprimir outro"/cancelar.

- [x] **Step 3: Commit**

```bash
git add components/compress/upload/uploadForm.tsx
git commit -m "feat: add springy stagger entrance to landing"
```

---

### Task 4: Entradas leves — Histórico e Auth

**Files:**
- Modify: `app/history/page.tsx`
- Modify: `app/(auth)/layout.tsx`

- [x] **Step 1: Histórico**

Em `app/history/page.tsx`, importar `Entrance` e substituir o elemento `<section>` por `<Entrance>` com as mesmas classes (o bloco inteiro entra como unidade única — spec §2):

```tsx
import { Entrance } from "@/components/motion/entrance";
```

```tsx
        <main className="flex flex-col flex-1 items-center w-full md:min-h-0 md:overflow-hidden">
            <Entrance className="flex flex-col w-full sm:w-9/12 md:w-8/12 gap-4 px-5 pb-6 sm:px-6 md:flex-1 md:min-h-0 md:gap-3 md:pb-4">
                {/* conteúdo existente da section, sem alterações */}
            </Entrance>
        </main>
```

(Manter todo o conteúdo interno exatamente como está; só a tag externa muda de `section` para o `m.div` do `Entrance`.)

- [x] **Step 2: Auth (login/registro)**

Em `app/(auth)/layout.tsx`, envolver o bloco do card com `Entrance` (mesma técnica — o `div` que envolve `AuthTabs` vira `Entrance`):

```tsx
import { Entrance } from "@/components/motion/entrance";
```

```tsx
            <Entrance className="flex flex-col gap-4 w-full max-w-100 px-5 pb-8 sm:px-0">
                <AuthTabs>{children}</AuthTabs>
            </Entrance>
```

- [x] **Step 3: Verificar**

Run: `npm run lint`
Expected: passa.
No dev: navegar para `/history` (logado) e `/login`.
Expected: o bloco principal de cada rota entra com um pop suave único; header não re-anima; alternar entre as tabs Login/Registro **não** re-anima (o layout auth persiste entre elas).

- [x] **Step 4: Commit**

```bash
git add app/history/page.tsx "app/(auth)/layout.tsx"
git commit -m "feat: add light entrance to history and auth routes"
```

---

### Task 5: Morph contínuo do uploader — dropzone ↔ card

**Files:**
- Modify: `components/compress/upload/uploader/uploader.tsx`
- Modify: `components/compress/upload/dropzone.tsx`
- Modify: `components/compress/upload/uploader/processing-card-shell.tsx`

O coração do spec (§3): a área tracejada da dropzone e o card de processamento compartilham `layoutId="uploader-card"`. Quando um sai e o outro entra dentro de `AnimatePresence mode="popLayout"`, o Motion faz FLIP entre os dois retângulos (posição/tamanho com spring `pop`) e crossfade automático.

- [x] **Step 1: AnimatePresence em `UploaderScreens`**

Em `components/compress/upload/uploader/uploader.tsx`, substituir a função `UploaderScreens` por:

```tsx
import { AnimatePresence } from "motion/react"
```

```tsx
function UploaderScreens() {
    const screen = UploaderContext.useSelector((snapshot) => screenFor(snapshot.value))
    const file = UploaderContext.useSelector((snapshot) => snapshot.context.file)
    const preset = UploaderContext.useSelector((snapshot) => snapshot.context.preset)

    // Owned here, not per-card: `usePosterPair` decodes the video once per
    // File, and both the processing cards (thumbnail) and the result card
    // (before/after) read from this single capture.
    const poster = usePosterPair(file, preset)

    const fileName = file?.name ?? ""
    const metaLine = [resolutionLabel(poster.height ?? 0), formatDuration(poster.duration ?? 0), videoFormatLabel(file?.type ?? "")]
        .filter(Boolean)
        .join(" · ")

    return (
        <AnimatePresence mode="popLayout" initial={false}>
            {screen === "idle" && <UploadForm key="idle" />}
            {screen === "sending" && <SendingCard key="sending" posterUrl={poster.before} fileName={fileName} metaLine={metaLine} />}
            {screen === "compressing" && <CompressingCard key="compressing" posterUrl={poster.before} fileName={fileName} metaLine={metaLine} />}
            {screen === "error" && <ErrorCard key="error" />}
            {screen === "result" && <ResultCard key="result" before={poster.before} after={poster.after} />}
        </AnimatePresence>
    )
}
```

(O restante do arquivo — `screenFor`, `EmittedEventsBridge`, `Uploader` — não muda.)

- [x] **Step 2: Dropzone vira o elemento compartilhado**

Em `components/compress/upload/dropzone.tsx`, transformar a área de drop em `m.div` com `layoutId` e reação springy ao arquivo arrastado por cima (spec §5). Extrair `isDragActive` do `useDropzone` e trocar o `div` externo da área:

```tsx
import { m } from "motion/react"
import { pop } from "@/lib/motion"
```

```tsx
    const { getRootProps, getInputProps, rootRef, open, isDragActive } = useDropzone({
```

```tsx
            <m.div
                layoutId="uploader-card"
                animate={{ scale: isDragActive ? 1.04 : 1 }}
                transition={pop}
                className={
                    cn(
                        "flex flex-col flex-1 min-h-40 w-full bg-primary/2.5 cursor-pointer hover:bg-primary/10 p-2 items-center justify-center border-dashed border-2 border-primary/70 rounded-xl",
                        isDragActive && "border-primary bg-primary/10",
                    )}
                {...getRootProps()}
                {...props}>
```

E fechar com `</m.div>` no lugar do `</div>` correspondente. Notas:
- `getRootProps()` fornece `onDragEnter/onDragOver/onDragLeave/onDrop` (eventos DOM) — não colidem com as props de gesto do Motion (`onDragStart/onDrag/onDragEnd`, baseadas em pointer), então o spread é seguro.
- O tipo de `props` (`React.ComponentProps<"div">`) pode conflitar com as props do `m.div` (ex.: `onAnimationStart`). Se o TypeScript reclamar, trocar a assinatura do componente para `{ className }: { className?: string }` e remover o spread `{...props}` — nenhum call site passa outras props (verificar com grep por `<Dropzone`).

- [x] **Step 3: Card de processamento vira o par do morph**

Em `components/compress/upload/uploader/processing-card-shell.tsx`, trocar o `div` externo por:

```tsx
import { m } from "motion/react"
import { pop } from "@/lib/motion"
```

```tsx
        <m.div layoutId="uploader-card" transition={pop} className="w-full max-w-xl rounded-3xl border bg-card p-5 shadow-lg sm:p-8">
```

(fechar com `</m.div>`.)

- [x] **Step 4: Verificar o morph**

Run: `npm run lint`
Expected: passa.
No dev: soltar um vídeo na dropzone.
Expected:
- Arrastar um arquivo por cima → dropzone cresce ~4% com quique e borda acende.
- Soltar → a área tracejada **se transforma** no card de envio (posição/tamanho animam com spring, conteúdo faz crossfade). Sem "piscar" nem duplo-render.
- Enviando → Comprimindo troca com crossfade no mesmo card.
- Cancelar durante o envio → o card volta a ser a dropzone pelo mesmo morph.
Se o morph "esticar" o conteúdo de forma feia, confirmar que `mode="popLayout"` está no `AnimatePresence` e que **ambos** os elementos têm o mesmo `layoutId`.

- [x] **Step 5: Commit**

```bash
git add components/compress/upload/uploader/uploader.tsx components/compress/upload/dropzone.tsx components/compress/upload/uploader/processing-card-shell.tsx
git commit -m "feat: add continuous morph between dropzone and processing card"
```

---

### Task 6: Card de erro — morph + shake

**Files:**
- Modify: `components/compress/upload/uploader/error-card.tsx`

- [x] **Step 1: Converter o card**

O card de erro entra no morph (mesmo `layoutId`) e treme ao aparecer (spec §3). O shake fica num `m.div` **interno** — não no elemento com `layoutId`, para não brigar com o transform do FLIP. **Obrigatório:** como filho direto de `AnimatePresence mode="popLayout"`, o componente precisa aceitar `ref` e encaminhá-lo ao `m.div` raiz (React 19, sem `forwardRef`) — sem isso o pop não engata:

```tsx
"use client"

import { CircleAlert } from "lucide-react"
import { m } from "motion/react"

import { Button } from "@/components/ui/button"
import { pop } from "@/lib/motion"
import { UploaderContext } from "./uploader-context"

export function ErrorCard({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
    const error = UploaderContext.useSelector((snapshot) => snapshot.context.error)
    const actorRef = UploaderContext.useActorRef()

    return (
        <m.div ref={ref} layoutId="uploader-card" transition={pop} className="w-full max-w-xl rounded-3xl border border-coral/60 bg-card shadow-lg">
            <m.div
                animate={{ x: [0, -10, 10, -6, 6, 0] }}
                transition={{ duration: 0.45, delay: 0.15 }}
                className="p-6 text-center sm:p-10"
            >
                <div className="mx-auto flex size-14 -rotate-6 items-center justify-center rounded-full bg-coral/15 text-coral">
                    <CircleAlert className="size-6" />
                </div>
                <h3 className="font-heading mt-4 text-xl font-extrabold tracking-tight text-balance sm:text-2xl">Ops, o squish falhou.</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground text-pretty">
                    {error ?? "Não foi possível concluir a compressão. Tente novamente."}
                </p>
                <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
                    <Button onClick={() => actorRef.send({ type: "RETRY" })}>Enviar novamente</Button>
                    <Button variant="outline" onClick={() => actorRef.send({ type: "RESET" })}>
                        Escolher outro vídeo
                    </Button>
                </div>
            </m.div>
        </m.div>
    )
}
```

(Atenção: o padding saiu do elemento externo para o interno, para o shake mover o conteúdo inteiro.)

- [x] **Step 2: Verificar**

Run: `npm run lint`
Expected: passa.
No dev: forçar um erro (ex.: derrubar a API local e enviar um vídeo, ou desconectar a rede durante o envio).
Expected: o card de envio se transforma no card de erro e ele treme horizontalmente uma vez; "Enviar novamente" volta ao fluxo; "Escolher outro vídeo" morfa de volta para a dropzone.

- [x] **Step 3: Commit**

```bash
git add components/compress/upload/uploader/error-card.tsx
git commit -m "feat: add morph and shake to error card"
```

---

### Task 7: Resultado — morph, badge que estala e confete

**Files:**
- Create: `components/compress/upload/uploader/confetti-burst.tsx`
- Modify: `components/compress/upload/uploader/result-card.tsx`

- [x] **Step 1: Criar o confete**

Create `components/compress/upload/uploader/confetti-burst.tsx`:

```tsx
"use client"

import { useMemo } from "react"
import { m } from "motion/react"

const COLORS = ["var(--color-primary)", "var(--color-coral)", "#facc15"]
const COUNT = 18

/**
 * One-shot burst behind the success check (design's playful confetti).
 * Pure decoration: aria-hidden, pointer-events-none, and reduced-motion
 * users never see it move (MotionConfig turns transform animations off).
 */
export function ConfettiBurst() {
    const pieces = useMemo(
        () =>
            Array.from({ length: COUNT }, (_, index) => ({
                angle: (index / COUNT) * 2 * Math.PI,
                distance: 90 + (index % 3) * 45,
                color: COLORS[index % COLORS.length],
                spin: 120 + ((index * 47) % 240),
            })),
        [],
    )

    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {pieces.map((piece, index) => (
                <m.span
                    key={index}
                    className="absolute size-2 rounded-xs"
                    style={{ backgroundColor: piece.color }}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
                    animate={{
                        x: Math.cos(piece.angle) * piece.distance,
                        y: Math.sin(piece.angle) * piece.distance - 30,
                        scale: 0.5,
                        opacity: 0,
                        rotate: piece.spin,
                    }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.25 }}
                />
            ))}
        </div>
    )
}
```

- [x] **Step 2: Animar o ResultCard**

Em `components/compress/upload/uploader/result-card.tsx`:

1. Imports novos:

```tsx
import { m } from "motion/react"

import { pop, settle } from "@/lib/motion"
import { ConfettiBurst } from "./confetti-burst"
```

2. O container raiz vira o par final do morph (fecha o ciclo do spec §3). O componente precisa aceitar e encaminhar `ref` (exigência do `popLayout` — ver Task 6): a assinatura de `ResultCard` ganha `ref?: React.Ref<HTMLDivElement>` e o raiz vira:

```tsx
        <m.div ref={ref} layoutId="uploader-card" transition={pop} exit={{ opacity: 0, transition: settle }} className="flex w-full max-w-2xl flex-col items-center gap-6">
```

(fechar com `</m.div>`.)

3. O check de sucesso ganha o confete atrás (o wrapper precisa de `relative`):

```tsx
            <div className="flex flex-col items-center gap-1.5 text-center">
                <div className="relative flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                    <ConfettiBurst />
                    <Check className="size-6" />
                </div>
```

4. O selo "−{pct}% menor" estala com `pop` + rotação, depois do morph assentar:

```tsx
                <m.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ ...pop, delay: 0.3 }}
                    className="z-10 -my-4 flex size-19 shrink-0 flex-col items-center justify-center rounded-full border-4 border-background bg-coral text-white shadow-lg sm:my-0 sm:-mx-4"
                >
                    <div className="font-heading text-xl font-extrabold">−{pctSaved}%</div>
                    <div className="text-2xs font-bold opacity-90">menor</div>
                </m.div>
```

- [x] **Step 3: Verificar**

Run: `npm run lint`
Expected: passa.
No dev: completar uma compressão de ponta a ponta.
Expected: o card "Comprimindo" se transforma no bloco de resultado; o selo de % estala girando ~300ms depois; o confete explode atrás do check e some. "Comprimir outro" morfa de volta à dropzone. Se o morph card→resultado distorcer demais (conteúdos muito diferentes), remover apenas o `layoutId` deste container (mantendo `initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={rise}`) (adicionando `rise` ao import de `@/lib/motion`) e registrar a decisão no commit — o spec prevê validação visual aqui.

- [x] **Step 4: Commit**

```bash
git add components/compress/upload/uploader/confetti-burst.tsx components/compress/upload/uploader/result-card.tsx
git commit -m "feat: add result morph, popping badge and confetti burst"
```

---

### Task 8: Micro-interações — progresso, status rotativo e whileTap

**Files:**
- Modify: `components/compress/upload/uploader/upload-progress-bar.tsx`
- Modify: `components/compress/upload/uploader/rotating-status-line.tsx`
- Create: `components/motion/tap.tsx`
- Modify: `components/compress/upload/dropzone.tsx` (botão mobile)
- Modify: `components/compress/upload/uploader/result-card.tsx` (botões)
- Modify: `components/compress/upload/uploader/error-card.tsx` (botões)

- [x] **Step 1: Barra de progresso com spring `settle`**

Reescrever o miolo de `components/compress/upload/uploader/upload-progress-bar.tsx` (anima `scaleX` — transform, não `width`, conforme spec §1):

```tsx
"use client"

import { m } from "motion/react"

import { settle } from "@/lib/motion"
import { UploaderContext } from "./uploader-context"

/**
 * This component is isolated because the UPLOAD_PROGRESS event from the state machine would make the entire page re-renders
 * a lot of times. Made this trying to improve app performance
 */
export function UploadProgressBar() {
    const percent = UploaderContext.useSelector((snapshot) => Math.round(snapshot.context.uploadedPercent))

    return (
        <div className="flex items-center gap-3.5">
            <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-primary/15">
                <m.div
                    className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-primary"
                    initial={false}
                    animate={{ scaleX: percent / 100 }}
                    transition={settle}
                />
            </div>
            <span className="font-mono text-sm font-bold tabular-nums">{percent}%</span>
        </div>
    )
}
```

- [x] **Step 2: Linhas de status com slide vertical + fade**

Reescrever o retorno de `components/compress/upload/uploader/rotating-status-line.tsx` (mantendo o comentário e a lógica do `useEffect` intactos):

```tsx
import { AnimatePresence, m } from "motion/react"

import { settle } from "@/lib/motion"
```

```tsx
    return (
        <AnimatePresence mode="wait" initial={false}>
            <m.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={settle}
                className="text-sm font-medium italic text-muted-foreground"
            >
                {COMPRESSING_LINES[index]}
            </m.p>
        </AnimatePresence>
    )
```

(Remover as classes `animate-in shimmer fade-in` — o Motion assume a transição.)

- [x] **Step 3: Criar o wrapper `Tap`**

Create `components/motion/tap.tsx`:

```tsx
"use client"

import { m } from "motion/react"

import { settle } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * Press feedback for primary action buttons (spec §5). Wraps instead of
 * patching the shadcn Button so chrome buttons stay untouched.
 */
export function Tap({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <m.div whileTap={{ scale: 0.97 }} transition={settle} className={cn("inline-flex", className)}>
            {children}
        </m.div>
    )
}
```

- [x] **Step 4: Aplicar o `Tap` nos botões de ação primária**

Somente nestes (menus e chrome ficam de fora):

Em `components/compress/upload/dropzone.tsx` (botão mobile):

```tsx
import { Tap } from "@/components/motion/tap"
```

```tsx
            <Tap className="w-full sm:hidden">
                <Button type="button" size="lg" className="w-full" onClick={open}>
                    Escolher arquivo
                </Button>
            </Tap>
```

Em `components/compress/upload/uploader/result-card.tsx` (baixar + comprimir outro):

```tsx
import { Tap } from "@/components/motion/tap"
```

```tsx
            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Tap className="w-full sm:w-auto">
                    <Button size="lg" className="w-full" onClick={() => actorRef.send({ type: "DOWNLOAD" })}>
                        <Download className="size-4.5" />
                        Baixar vídeo · {compLabel}
                    </Button>
                </Tap>
                <Tap className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full" onClick={() => actorRef.send({ type: "RESET" })}>
                        Comprimir outro
                    </Button>
                </Tap>
            </div>
```

Em `components/compress/upload/uploader/error-card.tsx` (retry + reset):

```tsx
import { Tap } from "@/components/motion/tap"
```

```tsx
                <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
                    <Tap className="w-full sm:w-auto">
                        <Button className="w-full" onClick={() => actorRef.send({ type: "RETRY" })}>Enviar novamente</Button>
                    </Tap>
                    <Tap className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full" onClick={() => actorRef.send({ type: "RESET" })}>
                            Escolher outro vídeo
                        </Button>
                    </Tap>
                </div>
```

- [x] **Step 5: Verificar**

Run: `npm run lint`
Expected: passa.
No dev:
- Barra de progresso avança suave, sem quicar e sem recuar visualmente.
- Na fase "Comprimindo", as frases trocam com slide vertical + fade a cada ~3,2s.
- Segurar o clique nos botões de ação → encolhem a 97% e voltam ao soltar.

- [x] **Step 6: Commit**

```bash
git add components/compress/upload/uploader/upload-progress-bar.tsx components/compress/upload/uploader/rotating-status-line.tsx components/motion/tap.tsx components/compress/upload/dropzone.tsx components/compress/upload/uploader/result-card.tsx components/compress/upload/uploader/error-card.tsx
git commit -m "feat: add progress spring, rotating status transition and tap feedback"
```

---

### Task 9: Verificação final

**Files:** nenhum novo.

- [x] **Step 1: Lint e build completos**

Run: `npm run lint && npm run build`
Expected: ambos passam sem warnings novos (atenção a avisos do React Compiler sobre componentes `m.*` — se houver, reportar antes de prosseguir).

- [x] **Step 2: Checklist visual completo (spec "Testes e validação")**

No `npm run dev`, percorrer:
1. Landing (primeiro load): cascata completa + badge por último.
2. Upload de ponta a ponta: dropzone → morph → enviando → comprimindo → resultado (badge + confete).
3. Erro + "Enviar novamente" + "Escolher outro vídeo".
4. Cancelamento durante envio → morph de volta à dropzone.
5. Navegação para `/history` e `/login`: entrada leve, header estável.
6. Sheet mobile, dropdown do avatar, AlertDialog de deletar no histórico, toasts: **idênticos a antes** (nenhuma regressão de chrome).

- [x] **Step 3: Reduced motion**

DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce". Recarregar e repetir o fluxo de upload.
Expected: nenhuma animação de transform (sem cascata, sem morph deslizante, sem confete voando) — apenas fades/trocas instantâneas.

- [x] **Step 4: Commit final (se houver ajustes)**

```bash
git add -A
git commit -m "chore: final animation polish after visual verification"
```

(Somente se a verificação tiver gerado ajustes; caso contrário, nada a commitar.)

---

## Notas de execução (o que mudou em relação ao plano)

Registrado depois da execução, para quem for ler o código sem acompanhar as revisões:

1. **`ref` obrigatório nos filhos do `AnimatePresence`** (Tasks 5–7). O `PopChild` clona cada filho injetando um `ref`; componentes de função no React 19 descartam esse `ref` em silêncio. Sem encaminhá-lo ao elemento `m.*` raiz, o `popLayout` nunca engata: o card que sai continua no fluxo e espreme o que entra por toda a duração da saída. Não gera erro de lint, de tipo nem de console.
2. **`initial={false}` removido do `AnimatePresence`** (Task 5). Ele desliga o `initial` de toda a subárvore no primeiro render, o que anulava a cascata da landing no primeiro carregamento.
3. **Cascata só antes de sair de `idle`** (Task 5). `hasLeftIdle` + `animateEntrance`; sem isso o morph de volta ao dropzone aterrissava num destino com `opacity: 0`.
4. **`h1` da landing anima só `y`** (Task 3). Elementos com `opacity: 0` não são candidatos a LCP; o herói precisa continuar pintável no HTML do servidor.
5. **Resultado fora do morph** (Task 7). Geometrias incompatíveis (≈1,17× na horizontal e ≈1,6× na vertical, sem correção de border-radius e sem contra-escala dos filhos): lia como borrão, não como morph. Trocado por entrada `rise` + exit fade.
6. **Confete some sob reduced motion** (Task 7). O `MotionConfig` só torna os transforms instantâneos — com `delay`, isso vira corte seco em vez de "sem animação". Decoração pura deve simplesmente não renderizar.
7. **`tabIndex={-1}` no `Tap`** (Task 8). O gesto de press do Motion injeta `tabIndex=0` em hosts não interativos, criando tab stops mortos na frente de cada botão.
8. **Barra de progresso translada em vez de escalar** (Task 8). `scaleX` achata a ponta arredondada durante quase todo o upload.
