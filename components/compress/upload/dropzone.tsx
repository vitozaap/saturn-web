"use client"
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { Logo } from "../../logo";
import { useController, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { ACCEPTED_TYPES, ICompressionForm, MAX_SIZE } from "./validation";
import { describeRejections } from "./rejection";


export default function Dropzone({ className, ...props }: React.ComponentProps<"div">) {
    const { setError, clearErrors } = useFormContext<ICompressionForm>()
    const { field: { onChange } } = useController<ICompressionForm, "file">({ name: "file" })
    const { getRootProps, getInputProps, rootRef } = useDropzone({
        multiple: false,
        accept: ACCEPTED_TYPES,
        maxSize: MAX_SIZE,
        // A 0-byte file decodes into nothing and would only fail on the worker.
        minSize: 1,
        onDrop: (acceptedFiles, fileRejections) => {
            const rejection = describeRejections(fileRejections)
            if (rejection) {
                // The file never enters the form, so the schema would report a
                // missing value instead of the real reason. Keep the previous
                // selection and surface the reason on the field itself.
                setError("file", { type: "dropzone", message: rejection })
                toast.error("Não foi possível enviar o arquivo", { description: rejection })
                return
            }

            const [file] = acceptedFiles
            if (!file) return

            clearErrors("file")
            onChange(file)
            rootRef.current?.closest("form")?.requestSubmit()
        },
        // Thrown by the File System Access API (permission denied, file moved
        // between the picker and the read). Without this it is swallowed.
        onError: () => {
            const message = "Não foi possível ler o arquivo. Tente selecioná-lo de novo."
            setError("file", { type: "dropzone", message })
            toast.error("Não foi possível enviar o arquivo", { description: message })
        },
    });

    return (
        <div
            className={
                cn("flex flex-col w-full bg-primary/2.5 cursor-pointer hover:bg-primary/10 p-2 items-center justify-center border-dashed border-2 border-primary/70 rounded-xl", className)}
            {...getRootProps()}
            {...props}>
            <input {...getInputProps()} />
            <div className="flex flex-col gap-2 items-center">
                <Logo height={64} width={64} />
                <div className="flex flex-col gap-1 items-center">
                    <h1 className="text-xl font-bold">Arraste um vídeo aqui</h1>
                    <p className="text-muted-foreground text-sm">Ou clique na área para selecionar o arquivo.</p>
                </div>
            </div>
        </div>
    )
}
