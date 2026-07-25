import { ViewTransition } from "react";

import { LoginForm } from "@/components/forms/login";
import { TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Login() {
    return (
        <ViewTransition name="auth-panel" share="auto" enter="auto" exit="auto" default="none">
            <TabsContent value={"login"} className={"flex flex-col gap-5"}>
                <LoginForm />
                <span className="flex w-full justify-center items-center font-medium">Não tem uma conta?
                    <Link href={"register"} className={buttonVariants({ variant: "link", size: "sm", className: "p-1! decoration-0 text-primary" })}>Crie uma</Link></span>
            </TabsContent>
        </ViewTransition>
    )
}
