"use client"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "../ui/field"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginFormType, loginSchema } from "./schemas"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import { Mail } from "lucide-react"
import { Button } from "../ui/button"
import { PasswordInput } from "../ui/password-input"
import Link from "next/link"
import { authClient } from "@/lib/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function LoginForm() {
    const router = useRouter()
    const form = useForm<LoginFormType>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })
    const onSubmit = async (data: LoginFormType) => {
        await authClient.signIn.email({
            email: data.email,
            password: data.password,
            rememberMe: true,
            fetchOptions: {
                credentials: "include"
            }
        }).then((payload) => !payload.error ? router.push("/history") : toast.error("Ocorreu um erro ao criar sua conta", {
            description: payload.error.message
        }))
    }
    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <FieldSet className="gap-3">
                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) =>
                            <Field>
                                <FieldLabel >
                                    Email
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupInput placeholder="Digite seu email" type="email" {...field} aria-invalid={fieldState.invalid} />
                                    <InputGroupAddon align={"inline-start"}>
                                        <Mail className="text-muted-foreground" />
                                    </InputGroupAddon>
                                </InputGroup>
                                {fieldState.invalid && (
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                )}
                            </Field>}
                    />
                    <Controller
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) =>
                            <Field>
                                <FieldLabel>
                                    Senha
                                </FieldLabel>
                                <PasswordInput {...field} aria-invalid={fieldState.invalid} />
                                {fieldState.invalid && (
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                )}
                            </Field>}
                    />
                    <Link href={"/"} className={"flex text-sm font-medium w-full justify-end decoration-0 text-primary"}>Esqueceu sua senha?</Link>
                    <Button type="submit">Entrar agora</Button>
                </FieldSet>
            </FieldGroup>
        </form>
    )
}