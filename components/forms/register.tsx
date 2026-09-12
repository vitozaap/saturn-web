"use client"
import {Controller, useForm} from "react-hook-form"
import {RegisterFormType, registerSchema} from "./schemas"
import {zodResolver} from "@hookform/resolvers/zod"
import {Field, FieldError, FieldGroup, FieldLabel, FieldSet} from "../ui/field"
import {InputGroup, InputGroupInput} from "../ui/input-group"
import {PasswordInput} from "../ui/password-input"
import {Button} from "../ui/button"
import {authClient} from "@/lib/auth"
import {useRouter} from "next/navigation"
import {toast} from "sonner"


export function RegisterForm() {
    const router = useRouter()
    const form = useForm<RegisterFormType>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    })
    const onSubmit = async (data: RegisterFormType) => {
        await authClient.signUp.email({
            email: data.email,
            name: data.name,
            password: data.password,
        })
            .then((payload) => {
                if (payload.error) {
                    toast.error("Ocorreu um erro ao criar sua conta", {
                        description: payload.error.message
                    })
                    return
                }
                // signUp does not create a session: the API requires email
                // verification, and the session lands on OTP verification.
                router.push(`/verify?email=${encodeURIComponent(data.email)}`)
            })
    }
    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <FieldSet className="gap-3">
                    <Controller
                        control={form.control}
                        name="name"
                        render={({field, fieldState}) =>
                            <Field>
                                <FieldLabel>
                                    Nome completo
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupInput placeholder="Digite seu nome" {...field}
                                                     aria-invalid={fieldState.invalid}/>
                                </InputGroup>
                                {fieldState.invalid && (
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                )}
                            </Field>}
                    />
                    <Controller
                        name="email"
                        control={form.control}
                        render={({field, fieldState}) =>
                            <Field>
                                <FieldLabel>
                                    Email
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupInput placeholder="Digite seu email" type="email" {...field}
                                                     aria-invalid={fieldState.invalid}/>
                                </InputGroup>
                                {fieldState.invalid && (
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                )}
                            </Field>}
                    />
                    <Controller
                        name="password"
                        control={form.control}
                        render={({field, fieldState}) =>
                            <Field>
                                <FieldLabel>
                                    Senha
                                </FieldLabel>
                                <PasswordInput {...field} aria-invalid={fieldState.invalid}/>
                                {fieldState.invalid && (
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                )}
                            </Field>}
                    />
                    <Controller
                        name="confirmPassword"
                        control={form.control}
                        render={({field, fieldState}) =>
                            <Field>
                                <FieldLabel>
                                    Confirmar senha
                                </FieldLabel>
                                <PasswordInput {...field} aria-invalid={fieldState.invalid}/>
                                {fieldState.invalid && (
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                )}
                            </Field>}
                    />
                    <Button type="submit" size={"lg"}>Criar minha conta</Button>
                </FieldSet>
            </FieldGroup>
        </form>
    )
}