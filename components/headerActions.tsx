"use client"

import dynamic from 'next/dynamic'
import { Button } from './ui/button'
import { User } from 'better-auth'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Prevent theme hydration errors by only loading themeSwitch when the client is mounted
const ThemeSwitch = dynamic(() => import('./themeSwitch'), { ssr: false })


export function HeaderActions({ user }: { user: User & { isAnonymous: boolean | undefined | null } | undefined }) {
    const path = usePathname()
    if (user && user.isAnonymous) {
        return (<div className='flex gap-1 items-center'>
            <ThemeSwitch />
            <Button size={"sm"} variant={"ghost"}>Como funciona</Button>
            <Button size={"sm"} variant={"ghost"}>Formatos</Button>
            {path !== "/" ? <Button size={"sm"}><Plus /> Novo</Button> : ""}
            <Link href={"/history"} className='ml-4'>
                <Avatar>
                    <AvatarImage src={user.image!} alt='user-image' />
                    <AvatarFallback><span className={"font-medium p-2"}>{user.name.substring(0, 2).toUpperCase()}</span></AvatarFallback>
                </Avatar>
            </Link>
        </div>)
    }
    return (
        <div className='flex gap-1'>
            <ThemeSwitch />
            <Button size={"sm"} variant={"ghost"}>Como funciona</Button>
            <Button size={"sm"} variant={"ghost"}>Formatos</Button>
            <Button size={"sm"} variant={"outline"}>Entrar</Button>
        </div>
    )
}