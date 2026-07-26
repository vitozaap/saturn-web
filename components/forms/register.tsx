"use client"
import { Controller, useForm } from "react-hook-form"
import { RegisterFormType, registerSchema } from "./schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "../ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import { Mail } from "lucide-react"
import { PasswordInput } from "../ui/password-input"
import { Button } from "../ui/button"


export function RegisterForm() {
    const form = useForm<RegisterFormType>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: ""
        }
    })
    const onSubmit = (data: RegisterFormType) => {
        console.log(data)
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
                    <Controller
                        name="confirmPassword"
                        control={form.control}
                        render={({ field, fieldState }) =>
                            <Field>
                                <FieldLabel>
                                    Confirmar senha
                                </FieldLabel>
                                <PasswordInput {...field} aria-invalid={fieldState.invalid} />
                                {fieldState.invalid && (
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                )}
                            </Field>}
                    />
                    <Button type="submit">Criar minha conta</Button>
                </FieldSet>
            </FieldGroup>
        </form>
    )
}