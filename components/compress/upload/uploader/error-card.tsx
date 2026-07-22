"use client"

import { CircleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { UploaderContext } from "./uploader-context"

export function ErrorCard() {
    const error = UploaderContext.useSelector((snapshot) => snapshot.context.error)
    const actorRef = UploaderContext.useActorRef()

    return (
        <div className="w-full max-w-xl rounded-3xl border border-coral/60 bg-card p-10 text-center shadow-lg">
            <div className="mx-auto flex size-14 -rotate-6 items-center justify-center rounded-full bg-coral/15 text-coral">
                <CircleAlert className="size-6" />
            </div>
            <h3 className="font-heading mt-4 text-2xl font-extrabold tracking-tight">Ops, o squish falhou.</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                {error ?? "Não foi possível concluir a compressão. Tente novamente."}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
                <Button onClick={() => actorRef.send({ type: "RETRY" })}>Enviar novamente</Button>
                <Button variant="outline" onClick={() => actorRef.send({ type: "RESET" })}>
                    Escolher outro vídeo
                </Button>
            </div>
        </div>
    )
}
