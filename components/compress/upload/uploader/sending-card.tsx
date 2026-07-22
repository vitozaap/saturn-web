"use client"

import { ProcessingCardShell } from "./processing-card-shell"
import { UploadProgressBar } from "./upload-progress-bar"
import { UploaderContext } from "./uploader-context"

type SendingCardProps = {
    posterUrl: string | null
    fileName: string
    metaLine: string
}

const STATUS_LINE: Record<"creating" | "uploading" | "confirming", string> = {
    creating: "Preparando o envio…",
    uploading: "Enviando seu vídeo pro servidor…",
    confirming: "Confirmando o envio…",
}

export function SendingCard({ posterUrl, fileName, metaLine }: SendingCardProps) {
    const phase = UploaderContext.useSelector((snapshot) =>
        snapshot.matches("uploading") ? "uploading" : snapshot.matches("confirming") ? "confirming" : "creating",
    )
    const cancelable = UploaderContext.useSelector((snapshot) => snapshot.can({ type: "CANCEL" }))
    const actorRef = UploaderContext.useActorRef()

    return (
        <ProcessingCardShell
            posterUrl={posterUrl}
            fileName={fileName}
            metaLine={metaLine}
            chipLabel="Enviando"
            phaseTitle="Enviando seu vídeo…"
            statusLine={<p className="text-sm font-medium italic text-muted-foreground">{STATUS_LINE[phase]}</p>}
            cancelable={cancelable}
            onCancel={() => actorRef.send({ type: "CANCEL" })}
        >
            <UploadProgressBar />
        </ProcessingCardShell>
    )
}
