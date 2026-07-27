"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HeaderItem {
    title: string,
    description: string
}

type AuthMode = "login" | "register"

const headerText: Record<AuthMode, HeaderItem> = {
    register: {
        title: "Crie sua conta",
        description: "Crie uma conta para ter acesso a todas as funcionalidades."
    },
    login: {
        title: "Bem-vindo de volta",
        description: "Faça login em sua conta de forma rápida."
    }
}

export function AuthTabs({ children }: { children: React.ReactNode }) {
    const mode: AuthMode = usePathname() === "/login" ? "login" : "register"

    return (
        <>
            <div className="flex flex-col gap-3 items-center justify-center">
                <h1 className="font-heading text-2xl font-semibold">{headerText[mode].title}</h1>
                <span className="text-muted-foreground text-sm">{headerText[mode].description}</span>
            </div>
            <Tabs value={mode} className={"gap-6"}>
                <TabsList className={"w-full"}>
                    <TabsTrigger value={"register"} nativeButton={false} render={<Link href="/register" />}>Criar conta</TabsTrigger>
                    <TabsTrigger value={"login"} nativeButton={false} render={<Link href="/login" />}>Fazer login</TabsTrigger>
                </TabsList>
                <div className="flex flex-col w-full h-max">
                    {children}
                </div>
            </Tabs>
        </>
    )
}
