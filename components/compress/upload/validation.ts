import { formatBytes } from "@/lib/format";
import { validateMedia } from "@/lib/video";
import z from "zod";

export const MAX_SIZE = 524_288_000 // 500MB

/** `accept` map for react-dropzone — the extensions the API's ffmpeg accepts. */
export const ACCEPTED_TYPES = {
    "video/*": [".mp4", ".webm", ".mov", ".mkv", ".avi", ".m4v", ".mpg", ".ogv", ".3gp"],
}

export const compressionSchema = z.object({
    file: z
        .file({ error: "Selecione um vídeo para comprimir." })
        .max(MAX_SIZE, `O vídeo passa de ${formatBytes(MAX_SIZE)}.`)
        .nonoptional("Selecione um vídeo para comprimir.")
        .superRefine(async (file, context) => {
            const isValid = await validateMedia(file)
            if (!isValid) {
                context.addIssue({
                    code: "custom",
                    message: "Formato de arquivo inválido ou não permitido."
                })
                return
            }

        }),
    preset: z.enum(["HIGH", "MID", "LOW"])
})


export type ICompressionForm = z.infer<typeof compressionSchema>
