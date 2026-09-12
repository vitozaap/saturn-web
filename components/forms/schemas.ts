import z from "zod";


export const loginSchema = z.object({
    email: z.email({ error: "Endereço de email inválido" }).nonoptional(),
    password: z.string().nonoptional()
})

export type LoginFormType = z.infer<typeof loginSchema>



export const registerSchema = z.object({
    name: z.string().min(3, {
        error: "Nome deve conter no mínimo 3 letras"
    }).nonoptional(),
    email: z.email({ error: "Endereço de email inválido" }).nonoptional(),
    password: z.string().nonoptional(),
    confirmPassword: z.string().nonoptional()
}).refine((data) => data.password === data.confirmPassword, {
    error: "Senhas precisam ser iguais",
    path: ["confirmPassword"]
})

export type RegisterFormType = z.infer<typeof registerSchema>

export const otpSchema = z.object({
    otp: z.string().length(6, { error: "O código tem 6 dígitos" })
})

export type OtpFormType = z.infer<typeof otpSchema>
