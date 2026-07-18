"use client"
import { FormProvider, useForm } from "react-hook-form"
import { compressionSchema, ICompressionForm } from "./validation"
import { zodResolver } from "@hookform/resolvers/zod"
import Dropzone from "./dropzone"
import { Presets } from "./presets"
import { ensureSession } from "@/lib/session"
import { toast } from "sonner"
import { BetterAuthError } from "better-auth"
import { Button } from "@/components/ui/button"


export function UploadForm() {
    const methods = useForm<ICompressionForm>({
        resolver: zodResolver(compressionSchema),
        defaultValues: {
            preset: "MID",
        }
    })
    const onUpload = async (data: ICompressionForm) => {
        try {
            await ensureSession()
            const res = await fetch(`/api/compressor`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contentType: data.file.type,
                    filename: data.file.name,
                    preset: data.preset,
                }),
                credentials: "include"
            })
            if (!res.ok) {
                throw new Error("Falha na conexão com o servidor.")
            }
            const { compressionId, uploadUrl, sourceKey } = await res.json()
            const { ok } = await fetch(uploadUrl, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": data.file.type
                },
                body: data.file
            })
            if (!ok) {
                throw new Error("Falha ao salvar arquivo no servidor. Tente novamente mais tarde.")
            }

            const { ok: queued, statusText } = await fetch("/api/compressor/confirm-upload", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    compressionId: compressionId
                })
            })
            if (queued) {
                toast.success(`${compressionId} adicionado à fila de compressão.`)
            }
            else {
                toast.warning(statusText)
            }
        }
        // TODO: Better error handling, doing it just for testing purposes
        catch (err: any) {
            toast.error(`${err.message}`)
        }
    }
    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onUpload)} className="flex flex-col gap-5 h-full ">
                <Dropzone className="h-full" />
                <Presets />
                <Button onClick={async () => {
                    const res = await fetch("/api/compressor", {
                        method: "GET",
                        credentials: "include"
                    })
                    console.log(await res.json())
                }}>list</Button>
            </form>
        </FormProvider>)
}