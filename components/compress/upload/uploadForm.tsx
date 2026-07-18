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
    const onUpload = async (data: ICompressionForm) => {}
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