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
