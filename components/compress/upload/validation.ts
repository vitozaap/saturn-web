import { validateMedia } from "@/lib/video";
import { toast } from "sonner";
import z from "zod";

const MAX_SIZE = 524_288_000 // 500MB
export const compressionSchema = z.object({
    file: z.file().max(MAX_SIZE).nonoptional().superRefine(async (file, context) => {
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