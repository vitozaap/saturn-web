"use client"
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { Logo } from "../../logo";
import { useController } from "react-hook-form";
import { ICompressionForm } from "./validation";


export default function Dropzone({ className, ...props }: React.ComponentProps<"div">) {
    const { field: { onChange } } = useController<ICompressionForm, "file">({ name: "file" })
    const { getRootProps, getInputProps, rootRef } = useDropzone({
        multiple: false,
        accept: { "video/*": [] },
        maxSize: 500 * 1024 * 1024,
        onDrop: (acceptedFiles) => {
            onChange(acceptedFiles[0] ?? null)
            rootRef.current?.closest("form")?.requestSubmit()
        }
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
