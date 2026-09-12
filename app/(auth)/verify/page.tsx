import { ViewTransition } from "react";
import { redirect } from "next/navigation";

import { OtpForm } from "@/components/forms/otpForm";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default async function Verify({
    searchParams,
}: {
    searchParams: Promise<{ email?: string }>
}) {
    const { email } = await searchParams
    if (!email) redirect("/register")

    return (
        <ViewTransition name="auth-panel" share="auto" enter="auto" exit="auto" default="none">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Confirme seu email</CardTitle>
                    <CardDescription>
                        Enviamos um código de 6 dígitos para <span className="font-medium text-foreground wrap-anywhere">{email}</span>. O código vale por 5 minutos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <OtpForm email={email} />
                </CardContent>
            </Card>
        </ViewTransition>
    )
}
