"use client"
import { LoginForm } from "@/components/forms/login";
import { RegisterForm } from "@/components/forms/register";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";


interface HeaderItem {
    title: string,
    description: string
}

const headerText: Record<"login" | "register", HeaderItem> = {
    register: {
        title: "Crie sua conta",
        description: "Crie uma conta para ter acesso a todas as funcionalidades."
    },
    login: {
        title: "Bem-vindo de volta",
        description: "Faça login em sua conta de forma rápida."
    }
}
export default function Register() {
    const [mode, setMode] = useState<HeaderItem>(headerText.register)
    return (
        <main className="flex flex-col items-center h-full border">
            <div className="flex flex-col gap-4 w-[400px]">
                <div className="flex flex-col gap-3 items-center justify-center">
                    <h1 className="font-heading text-2xl font-semibold">{mode?.title}</h1>
                    <span className="text-muted-foreground text-sm">{mode?.description}</span>
                </div>
                <Tabs defaultValue={"register"} >
                    <TabsList className={"w-full"}>
                        <TabsTrigger value={"register"} onClick={() => setMode(headerText.register)}>Criar conta</TabsTrigger>
                        <TabsTrigger value={"login"} onClick={() => setMode(headerText.login)}>Fazer login</TabsTrigger>
                    </TabsList>
                    <div className="flex flex-col w-full h-max">
                        <TabsContent value={"register"} >
                            <RegisterForm />
                        </TabsContent>
                        <TabsContent value={"login"}  >
                            <LoginForm />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </main>
    )
}