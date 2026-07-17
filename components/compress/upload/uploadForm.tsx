"use client"
import { FormProvider, useForm } from "react-hook-form"
import { compressionSchema, ICompressionForm } from "./validation"
import { zodResolver } from "@hookform/resolvers/zod"
import Dropzone from "./dropzone"
import { Presets } from "./presets"
import { ensureSession } from "@/lib/session"


export function UploadForm() {
    const methods = useForm<ICompressionForm>({
        resolver: zodResolver(compressionSchema),
        defaultValues: {
            preset: "MID",
        }
    })
    const onUpload = async (data: ICompressionForm) => {
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
        const { compressionId, uploadUrl, sourceKey } = await res.json()
        const { ok } = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                "Content-Type": data.file.type
            },
            body: data.file
        })
    }
    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onUpload)} className="flex flex-col gap-5 h-full ">
                <Dropzone className="h-full" />
                <Presets />
            </form>
        </FormProvider>)
}