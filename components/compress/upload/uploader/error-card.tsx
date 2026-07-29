"use client"

import { CircleAlert } from "lucide-react"
import { m } from "motion/react"

import { Button } from "@/components/ui/button"
import { pop } from "@/lib/motion"
import { Tap } from "@/components/motion/tap"
import { UploaderContext } from "./uploader-context"

export function ErrorCard({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
    const error = UploaderContext.useSelector((snapshot) => snapshot.context.error)
    const actorRef = UploaderContext.useActorRef()

    return (
        <m.div ref={ref} layoutId="uploader-card" transition={pop} className="w-full max-w-xl rounded-3xl border border-coral/60 bg-card shadow-lg">
            <m.div
                role="alert"
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
                    <Tap className="w-full sm:w-auto">
                        <Button className="w-full" onClick={() => actorRef.send({ type: "RETRY" })}>Enviar novamente</Button>
                    </Tap>
                    <Tap className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full" onClick={() => actorRef.send({ type: "RESET" })}>
                            Escolher outro vídeo
                        </Button>
                    </Tap>
                </div>
            </m.div>
        </m.div>
    )
}
