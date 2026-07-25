import z from "zod";


export const loginSchema = z.object({
    email: z.email({ error: "Endereço de email inválido" }).nonoptional(),
    password: z.string().nonoptional()
})

export type LoginFormType = z.infer<typeof loginSchema>