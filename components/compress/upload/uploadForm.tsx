"use client"
import { FormProvider, SubmitErrorHandler, useForm } from "react-hook-form"
import { compressionSchema, ICompressionForm } from "./validation"
import { zodResolver } from "@hookform/resolvers/zod"
import Dropzone from "./dropzone"
import { Presets } from "./presets"
import { UploaderContext } from "./uploader/uploader-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"


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
            description: errors.file?.message
        })
    }
    const onUpload = (data: ICompressionForm) => {
        actorRef.send({ type: "SUBMIT", file: data.file, preset: data.preset })
    }
    return (
        <FormProvider {...methods}>
            <main className="flex flex-col items-center gap-6 justify-center max-w-2xl h-full">
                <section className="flex flex-col gap-4 items-center">
                    <Badge variant={"secondary"} className="-rotate-2">Grátis · rápido · sem marca d&apos;água</Badge>
                    <h1 className="font-heading font-extrabold tracking-tighter text-6xl max-w-md text-center">
                        Dê um <span className="text-primary underline decoration-wavy decoration-4 decoration-coral">squish</span> nos seus vídeos.
                    </h1>
                    <p className="text-muted-foreground max-w-xl text-center text-lg">Comprima qualquer vídeo e baixe na hora! Sem perder a qualidade que realmente importa.</p>
                </section>
                <form onSubmit={methods.handleSubmit(onUpload, onError)} className="flex flex-col gap-5 h-7/12">
                    <Dropzone className="h-full" />
                    <Presets />
                </form>
                <div className="flex">
                    <p className="text-muted-foreground text-xs">Até 500MB - <Button variant={"link"} nativeButton={false} size={"xs"} className={"p-0"} render={<Link href="/login">Faça login</Link>} /> para mais funcionalidades.</p>
                </div>
            </main>

        </FormProvider>)
}