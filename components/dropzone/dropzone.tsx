"use client"
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { Logo } from "../logo";
import { Controller, useFormContext } from "react-hook-form";
import { ICompressionForm } from "./validation";


export default function Dropzone({ className, ...props }: React.ComponentProps<"div">) {
    const { control } = useFormContext<ICompressionForm>()

    return (
        <Controller
            control={control}
            name="file"
            render={({ field: { onChange, value }, fieldState: { error } }) => {
                const { getRootProps, getInputProps } = useDropzone({
                    multiple: false,
                    accept: { "video/*": [] },
                    maxSize: 500 * 1024 * 1024,
                    onDrop: (acceptedFiles) => {
                        onChange(acceptedFiles[0] ?? null)
                    }
                });
                return (<div
                    className={
                        cn("flex flex-col w-full bg-primary/2.5 cursor-pointer hover:bg-primary/10 p-2 items-center justify-center border-dashed border-2 border-primary/70 rounded-xl", className)}
                    {...getRootProps()}
                    {...props}>
                    <input {...getInputProps({ onChange })} />
                    <div className="flex flex-col gap-2 items-center">
                        <Logo height={64} width={64} />
                        <div className="flex flex-col gap-1 items-center">
                            <h1 className="text-xl font-bold">Arraste um vídeo aqui</h1>
                            <p className="text-muted-foreground text-sm">Ou clique na área para selecionar o arquivo.</p>
                        </div>
                    </div>
                </div>)
            }
            }
        />
    )
}