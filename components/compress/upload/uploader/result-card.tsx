"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Clock, Download, X } from "lucide-react"
import { m, useReducedMotion } from "motion/react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatBytes, videoFormatLabel } from "@/lib/format"
import { useIsRegistered } from "@/lib/useIsRegistered"
import { pop, rise, settle } from "@/lib/motion"
import { Tap } from "@/components/motion/tap"
import { UploaderContext } from "./uploader-context"
import { ConfettiBurst } from "./confetti-burst"

type ResultCardProps = {
    before: string | null
    after: string | null
    ref?: React.Ref<HTMLDivElement>
}

function PosterBox({ url, label, size, tone }: { url: string | null; label: string; size: string; tone: "before" | "after" }) {
    return (
        <div
            className={cn(
                "flex w-full items-center gap-4 overflow-hidden rounded-2xl border bg-card p-3.5 sm:block sm:max-w-90 sm:flex-1 sm:p-0",
                tone === "after" && "border-primary bg-primary/5 shadow-lg",
            )}
        >
            <div
                className={cn("h-12 w-19 shrink-0 rounded-lg bg-cover bg-center sm:h-36 sm:w-full sm:rounded-none", !url && "bg-muted")}
                style={{
                    backgroundImage: url
                        ? `url(${url})`
                        : "repeating-linear-gradient(135deg, var(--muted) 0px, var(--muted) 9px, transparent 9px, transparent 18px)",
                }}
            />
            <div className="flex min-w-0 flex-col gap-0.5 sm:p-4">
                <div className={cn("font-mono text-2xs font-semibold tracking-wide text-muted-foreground sm:text-xs", tone === "after" && "text-primary")}>
                    {tone === "before" ? "ANTES" : "DEPOIS"}
                </div>
                <div className={cn("font-heading text-2xl font-extrabold tracking-tight", tone === "after" && "text-primary")}>{size}</div>
                <div className="text-xs font-medium text-muted-foreground">{label}</div>
            </div>
        </div>
    )
}

export function ResultCard({ before, after, ref }: ResultCardProps) {
    const [inviteDismissed, setInviteDismissed] = useState(false)
    const shouldReduceMotion = useReducedMotion()
    const { isRegistered, pending: sessionPending } = useIsRegistered()
    const actorRef = UploaderContext.useActorRef()
    const fileName = UploaderContext.useSelector((snapshot) => snapshot.context.file?.name ?? "")
    const contentType = UploaderContext.useSelector((snapshot) => snapshot.context.file?.type ?? "")
    const preset = UploaderContext.useSelector((snapshot) => snapshot.context.preset)
    const compression = UploaderContext.useSelector((snapshot) => snapshot.context.compression)

    const sourceSize = compression?.sourceSize ? Number(compression.sourceSize) : 0
    const outputSize = compression?.outputSize ? Number(compression.outputSize) : 0
    const pctSaved = compression?.ratio != null ? Math.round((1 - compression.ratio) * 100) : 0
    const origLabel = formatBytes(sourceSize)
    const compLabel = formatBytes(outputSize)
    const savedLabel = formatBytes(Math.max(0, sourceSize - outputSize))

    return (
        <m.div ref={ref} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={rise} exit={{ opacity: 0, transition: settle }} className="flex w-full max-w-2xl flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-1.5 text-center">
                <div className="relative flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                    <ConfettiBurst />
                    <Check className="relative size-6" />
                </div>
                <h2 className="font-heading text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">Squish feito! Bem mais leve.</h2>
                <div className="font-mono text-xs break-all text-muted-foreground sm:text-sm">
                    {fileName} · {videoFormatLabel(contentType)} · preset {preset}
                </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center sm:flex-row">
                <PosterBox url={before} label="Tamanho original." size={origLabel} tone="before" />
                <m.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ ...pop, delay: shouldReduceMotion ? 0 : 0.3 }}
                    className="z-10 -my-4 flex size-19 shrink-0 flex-col items-center justify-center rounded-full border-4 border-background bg-coral text-white shadow-lg sm:my-0 sm:-mx-4"
                >
                    <div className="font-heading text-xl font-extrabold">−{pctSaved}%</div>
                    <div className="text-2xs font-bold opacity-90">menor</div>
                </m.div>
                <PosterBox url={after} label="Pós squish." size={compLabel} tone="after" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-2 text-center text-sm font-semibold text-muted-foreground">
                Você espremeu <span className="text-primary font-extrabold">{savedLabel}</span> desse vídeo.
            </div>

            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Tap className="w-full shrink-0 sm:w-auto">
                    <Button size="lg" className="w-full" onClick={() => actorRef.send({ type: "DOWNLOAD" })}>
                        <Download className="size-4.5" />
                        Baixar vídeo · {compLabel}
                    </Button>
                </Tap>
                <Tap className="w-full shrink-0 sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full" onClick={() => actorRef.send({ type: "RESET" })}>
                        Comprimir outro
                    </Button>
                </Tap>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="size-3.5" />
                Automaticamente deletado em 24h.
            </div>

             {!inviteDismissed && !sessionPending && !isRegistered && (
                <div className="relative flex w-full flex-col items-start gap-4 rounded-2xl border border-primary bg-primary/5 p-5 sm:flex-row sm:items-center sm:gap-5">
                    <button
                        type="button"
                        onClick={() => setInviteDismissed(true)}
                        className="absolute -top-2.5 -right-2.5 flex size-6.5 items-center justify-center rounded-full border bg-card text-muted-foreground shadow"
                    >
                        <X className="size-3" />
                    </button>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="font-bold">Quer guardar isso?</div>
                        <div className="text-sm text-muted-foreground">
                            Crie uma conta grátis para ver seu histórico e baixar de novo quando quiser.
                        </div>
                    </div>
                    <Link href="/register" className={buttonVariants({ className: "w-full sm:w-auto" })}>Criar conta grátis</Link>
                </div>
            )}
        </m.div>
    )
}
