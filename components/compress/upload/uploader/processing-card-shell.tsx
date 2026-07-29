"use client"

import { ReactNode } from "react"
import { Play } from "lucide-react"
import { m } from "motion/react"

import { cn } from "@/lib/utils"
import { pop, settle } from "@/lib/motion"

type ProcessingCardShellProps = {
    ref?: React.Ref<HTMLDivElement>
    posterUrl: string | null
    fileName: string
    metaLine: string
    chipLabel: string
    phaseTitle: string
    statusLine: ReactNode
    cancelable: boolean
    onCancel: () => void
    children: ReactNode
}

export function ProcessingCardShell({
    ref,
    posterUrl,
    fileName,
    metaLine,
    chipLabel,
    phaseTitle,
    statusLine,
    cancelable,
    onCancel,
    children,
}: ProcessingCardShellProps) {
    return (
        <m.div ref={ref} layoutId="uploader-card" transition={pop} exit={{ opacity: 0, transition: settle }} className="w-full max-w-xl rounded-3xl border bg-card p-5 shadow-lg sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 items-center gap-3 sm:contents">
                    <div
                        className={cn("flex h-14 w-21 shrink-0 items-center justify-center rounded-xl bg-cover bg-center sm:h-16 sm:w-26", !posterUrl && "bg-muted")}
                        style={{
                            backgroundImage: posterUrl
                                ? `url(${posterUrl})`
                                : "repeating-linear-gradient(135deg, var(--muted) 0px, var(--muted) 9px, transparent 9px, transparent 18px)",
                        }}
                    >
                        {!posterUrl && (
                            <div className="flex size-8 items-center justify-center rounded-full bg-background/90">
                                <Play className="size-4 fill-primary text-primary" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate font-bold sm:text-lg">{fileName}</div>
                        <div className="truncate font-mono text-xs text-muted-foreground sm:text-sm">{metaLine}</div>
                    </div>
                </div>
                <div className="flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                    <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                    {chipLabel}
                </div>
            </div>

            <div className="my-6 text-center sm:my-8">
                <div className="font-heading text-xl font-extrabold tracking-tight text-balance sm:text-2xl">{phaseTitle}</div>
                <div className="mt-1.5 min-h-5">{statusLine}</div>
            </div>

            {children}

            <div className="mt-6 flex min-h-5 flex-col items-start gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-start gap-2 text-xs font-medium text-muted-foreground text-pretty">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    Processado com segurança na nuvem — excluído automaticamente em 24h
                </div>
                {cancelable && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-sm font-semibold text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </m.div>
    )
}
