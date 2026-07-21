"use client"

import { ProcessingCardShell } from "./processing-card-shell"
import { RotatingStatusLine } from "./rotating-status-line"
import { UploaderContext } from "./uploader-context"

type CompressingCardProps = {
    posterUrl: string | null
    fileName: string
    metaLine: string
}

export function CompressingCard({ posterUrl, fileName, metaLine }: CompressingCardProps) {
    const preset = UploaderContext.useSelector((snapshot) => snapshot.context.preset)
    const queued = UploaderContext.useSelector((snapshot) => snapshot.context.compression?.status === "QUEUED")
    const reconnecting = UploaderContext.useSelector((snapshot) => snapshot.matches({ compressing: "reconnecting" }))

    return (
        <ProcessingCardShell
            posterUrl={posterUrl}
            fileName={fileName}
            metaLine={metaLine}
            chipLabel={queued ? "Na fila" : `Squishando · ${preset}`}
            phaseTitle={queued ? "Na fila de compressão…" : "Comprimindo na nuvem…"}
            statusLine={
                queued ? (
                    <p className="text-sm font-medium italic text-muted-foreground">
                        Você está na fila de compressão…
                        {reconnecting && " Reconectando…"}
                    </p>
                ) : (
                    <RotatingStatusLine />
                )
            }
            cancelable={false}
            onCancel={() => {}}
        >
            {!queued && (
                <div className="relative h-3 overflow-hidden rounded-full bg-primary/15">
                    <div className="animate-indeterminate absolute inset-y-0 w-[36%] rounded-full bg-linear-to-r from-primary to-coral" />
                </div>
            )}
        </ProcessingCardShell>
    )
}
