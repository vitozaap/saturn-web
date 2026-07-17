"use client"
import dynamic from "next/dynamic";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import Link from "next/link";


// Prevent theme hydration errors by only loading themeSwitch when the client is mounted
const ThemeSwitch = dynamic(() => import('./themeSwitch'), { ssr: false })

export function Header() {
    return (
        <header className="flex w-full py-5 px-9 items-center-safe justify-between">
            <Link href="/" className="flex gap-2 items-center cursor-pointer">
                <Logo /> <h1 className="font-heading font-extrabold text-2xl tracking-tight">squish</h1>
            </Link>
            <div className="flex gap-1">
                <ThemeSwitch />
                <Button variant={"ghost"}>Como funciona</ Button>
                <Button variant={"ghost"}>Formatos</Button>
                <Button variant={"outline"}>Entrar</Button>
            </div>
        </header>
    )
}