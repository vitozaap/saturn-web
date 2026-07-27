"use client"

import dynamic from 'next/dynamic'
import { Button, buttonVariants } from './ui/button'
import { User } from 'better-auth'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Book, LogOut, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { authClient } from '@/lib/auth'

// Prevent theme hydration errors by only loading themeSwitch when the client is mounted
const ThemeSwitch = dynamic(() => import('./themeSwitch'), { ssr: false })


export function HeaderActions({ user }: { user: User & { isAnonymous: boolean | undefined | null } | undefined }) {
    const path = usePathname()
    if (user && !user.isAnonymous) {
        return (<div className='flex gap-1 items-center'>
            <ThemeSwitch />
            <Link className={buttonVariants({ size: "sm", variant: "ghost" })} href={"/help"}>Como funciona</Link>
            <Link className={buttonVariants({ size: "sm", variant: "ghost" })} href={"/formats"}>Formatos</Link>
            {path !== "/" ? <Link className={buttonVariants({ size: "sm", variant: "default" })} href={"/"}><Plus />Novo</Link> : ""}

            <DropdownMenu>
                <DropdownMenuTrigger nativeButton={false} className={"ml-4"} render={
                    <Avatar className={"cursor-pointer"}>
                        <AvatarImage src={user.image!} alt='user-image' />
                        <AvatarFallback><span className={"font-medium p-2"}>{user.name.substring(0, 1).toUpperCase()}</span></AvatarFallback>
                    </Avatar>
                } />
                <DropdownMenuContent className={"min-w-38"}>
                    <DropdownMenuGroup>
                        <Link href={"/history"}> <DropdownMenuItem> <Book /> Histórico</DropdownMenuItem></Link>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant='destructive' onClick={async () => {
                        await authClient.signOut().then(() => window.location.reload())
                    }}> <LogOut /> Sair da conta</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

        </div>)
    }
    return (
        <div className='flex gap-1'>
            <ThemeSwitch />
            <Link className={buttonVariants({ size: "sm", variant: "ghost" })} href={"/help"}>Como funciona</Link>
            <Link className={buttonVariants({ size: "sm", variant: "ghost" })} href={"/formats"}>Formatos</Link>
            <Link className={buttonVariants({ size: "sm", variant: "outline" })} href={"/register"} >Entrar</Link>
        </div>
    )
}