import z from "zod";


export const compressionSchema = z.object({
    file: z.file().nonoptional(),
    preset: z.enum(["HIGH", "MID", "LOW"])
})


export type ICompressionForm = z.infer<typeof compressionSchema>


export function validateFile(file: File) {
    //TODO: validate file magic bytes
}