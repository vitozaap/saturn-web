"use client"
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Logo } from "../../logo";
import { useController, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { m } from "motion/react";
import { pop } from "@/lib/motion";
import { ACCEPTED_TYPES, ICompressionForm, MAX_SIZE } from "./validation";
import { describeRejections } from "./rejection";


export default function Dropzone({ className }: { className?: string }) {
    const { setError, clearErrors } = useFormContext<ICompressionForm>()
    const { field: { onChange } } = useController<ICompressionForm, "file">({ name: "file" })
    const { getRootProps, getInputProps, rootRef, open, isDragActive } = useDropzone({
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

    // `getRootProps()` is generic (`<T extends DropzoneRootProps>`) and with
    // no argument resolves to the full `DropzoneRootProps` interface — every
    // optional DOM handler in `HTMLAttributes`, not just the handful it sets
    // at runtime. That collides with Motion's pointer-based gesture props of
    // the same name on `m.div` (onDrag, onDragStart, onDragEnd,
    // onAnimationStart, ...). Pulling out only the keys react-dropzone
    // actually assigns (verified against its source) avoids spreading the
    // rest of that broad type.
    const { onKeyDown, onFocus, onBlur, onClick, onDragEnter, onDragOver, onDragLeave, onDrop, role, tabIndex } = getRootProps()

    return (
        <div className={cn("flex w-full flex-col gap-3", className)}>
            <m.div
                layoutId="uploader-card"
                animate={{ scale: isDragActive ? 1.04 : 1 }}
                transition={pop}
                className={
                    cn(
                        "flex flex-col flex-1 min-h-40 w-full bg-primary/2.5 cursor-pointer hover:bg-primary/10 p-2 items-center justify-center border-dashed border-2 border-primary/70 rounded-xl",
                        isDragActive && "border-primary bg-primary/10",
                    )}
                // react-dropzone types `rootRef` as `RefObject<HTMLElement>`;
                // it is always attached to this div, so `HTMLDivElement` is
                // safe here even though the ref's declared element type is
                // wider.
                ref={rootRef as React.RefObject<HTMLDivElement>}
                role={role}
                tabIndex={tabIndex}
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                onBlur={onBlur}
                onClick={onClick}
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}>
                <input {...getInputProps()} />
                <div className="flex flex-col gap-2 items-center text-center">
                    <Logo className="size-11 sm:size-16" height={64} width={64} />
                    <div className="flex flex-col gap-1 items-center">
                        <h1 className="text-lg sm:text-xl font-bold">
                            <span className="sm:hidden">Toque para escolher um vídeo</span>
                            <span className="hidden sm:inline">Arraste um vídeo aqui</span>
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            <span className="sm:hidden">a gente espreme pra você</span>
                            <span className="hidden sm:inline">Ou clique na área para selecionar o arquivo.</span>
                        </p>
                    </div>
                </div>
            </m.div>
            <Button type="button" size="lg" className="w-full sm:hidden" onClick={open}>
                Escolher arquivo
            </Button>
        </div>
    )
}
