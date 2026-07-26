import z, { email } from "zod";


export const loginSchema = z.object({
    email: z.email({ error: "Endereço de email inválido" }).nonoptional(),
    password: z.string().nonoptional()
})

export type LoginFormType = z.infer<typeof loginSchema>



export const registerSchema = z.object({
    email: z.email({ error: "Endereço de email inválido" }).nonoptional(),
    password: z.string().nonoptional(),
    confirmPassword: z.string().nonoptional()
}).refine((data) => data.password === data.confirmPassword, {
    error: "Senhas precisam ser iguais",
    path: ["confirmPassword"]
})

export type RegisterFormType = z.infer<typeof registerSchema>