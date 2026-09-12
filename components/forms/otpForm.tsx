"use client"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth"
import { Button } from "../ui/button"
import { Field, FieldError, FieldGroup, FieldSet } from "../ui/field"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp"
import { OtpFormType, otpSchema } from "./schemas"

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 60

// better-auth speaks English; the UI speaks Portuguese.
const errorMessages: Record<string, string> = {
    INVALID_OTP: "Código inválido. Confira os dígitos e tente de novo.",
    OTP_EXPIRED: "Esse código expirou. Peça um novo.",
    TOO_MANY_ATTEMPTS: "Muitas tentativas. Peça um código novo."
}

export function OtpForm({ email }: { email: string }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [cooldown, setCooldown] = useState<number>(RESEND_COOLDOWN)
    const [resending, setResending] = useState<boolean>(false)
    // Bumped whenever the field is cleared, so the effect below can put the
    // caret back on the first slot without reading the ref during render.
    const [clearCount, setClearCount] = useState<number>(0)
    const form = useForm<OtpFormType>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" }
    })

    useEffect(() => {
        if (cooldown <= 0) return
        const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
        return () => clearTimeout(timer)
    }, [cooldown])

    useEffect(() => {
        if (clearCount === 0) return
        containerRef.current?.querySelector("input")?.focus()
    }, [clearCount])

    const clearField = () => {
        form.setValue("otp", "")
        setClearCount((count) => count + 1)
    }

    const onSubmit = async (data: OtpFormType) => {
        await authClient.emailOtp.verifyEmail({
            email,
            otp: data.otp,
            fetchOptions: { credentials: "include" }
        }).then((payload) => {
            if (payload.error) {
                const code = payload.error.code
                toast.error("Não foi possível verificar seu email", {
                    description: (code && errorMessages[code]) ?? payload.error.message
                })
                clearField()
                return
            }
            // Full navigation, not router.push: /history is guarded by server
            // components and has to see the session cookie this call just set.
            window.location.assign("/history")
        })
    }

    const onResend = async () => {
        setResending(true)
        await authClient.emailOtp.sendVerificationOtp({
            email,
            type: "email-verification",
            fetchOptions: { credentials: "include" }
        }).then((payload) => {
            if (payload.error) {
                toast.error("Não foi possível reenviar o código", { description: payload.error.message })
                return
            }
            toast.success("Código reenviado", { description: `Enviamos um novo código para ${email}.` })
            setCooldown(RESEND_COOLDOWN)
            clearField()
        }).finally(() => setResending(false))
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <FieldSet className="gap-5">
                    <Controller name="otp" control={form.control}
                        render={({ field, fieldState }) =>
                            <Field>
                                <div ref={containerRef}>
                                    <InputOTP
                                        maxLength={OTP_LENGTH}
                                        pattern={REGEXP_ONLY_DIGITS}
                                        autoFocus
                                        disabled={form.formState.isSubmitting}
                                        value={field.value}
                                        onChange={field.onChange}
                                        onComplete={form.handleSubmit(onSubmit)}
                                    >
                                        <InputOTPGroup>
                                            {Array.from({ length: OTP_LENGTH }, (_, index) => (
                                                <InputOTPSlot key={index} index={index} aria-invalid={fieldState.invalid} />
                                            ))}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                {fieldState.invalid && (<FieldError>{fieldState.error?.message}</FieldError>)}
                            </Field>} />
                    <Button type="submit" size={"lg"} disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Verificando..." : "Verificar código"}
                    </Button>
                </FieldSet>
            </FieldGroup>
            <span className="flex w-full flex-wrap justify-center items-center font-medium mt-5 text-sm">
                Não recebeu?
                <Button type="button" variant={"link"} size={"sm"}
                    className="p-1! decoration-0 text-primary"
                    disabled={cooldown > 0 || resending}
                    onClick={onResend}>
                    {cooldown > 0 ? `Reenviar em ${cooldown}s` : "Reenviar código"}
                </Button>
            </span>
        </form>
    )
}
