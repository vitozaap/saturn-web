"use client"

import { ReactNode } from "react"
import { Play } from "lucide-react"

import { cn } from "@/lib/utils"

type ProcessingCardShellProps = {
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
        <div className="w-full max-w-xl rounded-3xl border bg-card p-6 shadow-lg sm:p-8">
            <div className="flex items-center gap-4">
                <div
                    className={cn("flex h-16 w-26 shrink-0 items-center justify-center rounded-xl bg-cover bg-center", !posterUrl && "bg-muted")}
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
                    <div className="truncate text-lg font-bold">{fileName}</div>
                    <div className="font-mono text-sm text-muted-foreground">{metaLine}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                    <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                    {chipLabel}
                </div>
            </div>

            <div className="my-8 text-center">
                <div className="font-heading text-2xl font-extrabold tracking-tight">{phaseTitle}</div>
                <div className="mt-1.5 min-h-5">{statusLine}</div>
            </div>

            {children}

            <div className="mt-6 flex min-h-5 items-center justify-between border-t pt-5">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-primary" />
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
        </div>
    )
}
