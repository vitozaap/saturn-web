"use client"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "../ui/field"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginFormType, loginSchema } from "./schemas"
import { InputGroup, InputGroupInput } from "../ui/input-group"
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
        }).then((payload) => {
            if (payload.error) {
                // The API resends the OTP on this error, so send the user to it.
                if (payload.error.code === "EMAIL_NOT_VERIFIED") {
                    router.push(`/verify?email=${encodeURIComponent(data.email)}`)
                    return
                }
                toast.error("Ocorreu um erro ao fazer login", {
                    description: payload.error.message
                })
                return
            }
            // Full navigation, not router.push: /history is guarded by server
            // components and has to see the session cookie this call just set.
            window.location.assign("/history")
        })
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
                    <Button type="submit" size={"lg"}>Entrar agora</Button>
                </FieldSet>
            </FieldGroup>
        </form>
    )
}