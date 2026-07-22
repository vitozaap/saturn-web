"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Clock, Download, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatBytes, videoFormatLabel } from "@/lib/format"
import { UploaderContext } from "./uploader-context"

type ResultCardProps = {
    before: string | null
    after: string | null
}

function PosterBox({ url, label, size, tone }: { url: string | null; label: string; size: string; tone: "before" | "after" }) {
    return (
        <div
            className={cn(
                "w-full max-w-90 flex-1 overflow-hidden rounded-2xl border bg-card",
                tone === "after" && "border-primary bg-primary/5 shadow-lg",
            )}
        >
            <div
                className={cn("h-36 bg-cover bg-center", !url && "bg-muted")}
                style={{
                    backgroundImage: url
                        ? `url(${url})`
                        : "repeating-linear-gradient(135deg, var(--muted) 0px, var(--muted) 9px, transparent 9px, transparent 18px)",
                }}
            />
            <div className="flex flex-col gap-0.5 p-4">
                <div className={cn("font-mono text-xs font-semibold tracking-wide text-muted-foreground", tone === "after" && "text-primary")}>
                    {tone === "before" ? "ANTES" : "DEPOIS"}
                </div>
                <div className={cn("font-heading text-2xl font-extrabold tracking-tight", tone === "after" && "text-primary")}>{size}</div>
                <div className="text-xs font-medium text-muted-foreground">{label}</div>
            </div>
        </div>
    )
}

export function ResultCard({ before, after }: ResultCardProps) {
    const [inviteDismissed, setInviteDismissed] = useState(false)
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
        <div className="flex w-full max-w-2xl flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-1.5 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                    <Check className="size-6" />
                </div>
                <h2 className="font-heading text-3xl font-extrabold tracking-tight">Squish feito! Bem mais leve.</h2>
                <div className="font-mono text-sm text-muted-foreground">
                    {fileName} · {videoFormatLabel(contentType)} · preset {preset}
                </div>
            </div>

            <div className="flex w-full items-center justify-center">
                <PosterBox url={before} label="Tamanho original." size={origLabel} tone="before" />
                <div className="z-10 -mx-4 flex size-19 shrink-0 flex-col items-center justify-center rounded-full border-4 border-background bg-coral text-white shadow-lg">
                    <div className="font-heading text-xl font-extrabold">−{pctSaved}%</div>
                    <div className="text-[9px] font-bold opacity-90">menor</div>
                </div>
                <PosterBox url={after} label="Pós squish." size={compLabel} tone="after" />
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                Você espremeu <span className="text-primary font-extrabold">{savedLabel}</span> desse vídeo.
            </div>

            <div className="flex items-center gap-3">
                <Button size="lg" onClick={() => actorRef.send({ type: "DOWNLOAD" })}>
                    <Download className="size-4.5" />
                    Baixar vídeo · {compLabel}
                </Button>
                <Button size="lg" variant="outline" onClick={() => actorRef.send({ type: "RESET" })}>
                    Comprimir outro
                </Button>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="size-3.5" />
                Automaticamente deletado em 24h. 
            </div>

            {!inviteDismissed && (
                <div className="relative flex w-full items-center gap-5 rounded-2xl border border-primary bg-primary/5 p-5">
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
                    <Button nativeButton={false} render={<Link href="/login">Criar conta grátis</Link>} />
                </div>
            )}
        </div>
    )
}
