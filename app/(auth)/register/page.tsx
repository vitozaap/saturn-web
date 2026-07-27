import { ViewTransition } from "react";

import { RegisterForm } from "@/components/forms/register";
import { TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Register() {
    return (
        <ViewTransition name="auth-panel" share="auto" enter="auto" exit="auto" default="none">
            <TabsContent value={"register"} className={"flex flex-col gap-5"}>
                <RegisterForm />
                <span className="flex w-full justify-center items-center font-medium">Já tem conta?<Link href={"login"} className={buttonVariants({ variant: "link", size: "sm", className: "p-1! decoration-0 text-primary" })}>Entre agora</Link></span>
            </TabsContent>
        </ViewTransition>
    )
}
