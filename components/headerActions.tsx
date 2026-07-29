"use client"

import dynamic from 'next/dynamic'
import { buttonVariants } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Book, LogOut, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { authClient } from '@/lib/auth'
import { MobileNav } from './mobileNav'
import { isSignedIn, NAV_PAGES, type NavUser } from './navItems'

// Prevent theme hydration errors by only loading themeSwitch when the client is mounted
const ThemeSwitch = dynamic(() => import('./themeSwitch'), { ssr: false })


export function HeaderActions({ user }: { user: NavUser | undefined }) {
    const path = usePathname()
    const signedIn = isSignedIn(user)

    return (
        <>
            <div className='hidden gap-1 items-center md:flex'>
                <ThemeSwitch />
                {NAV_PAGES.map(({ href, label }) => (
                    <Link
                        key={href}
                        href={href}
                        aria-current={path === href ? "page" : undefined}
                        className={buttonVariants({
                            size: "sm",
                            variant: "ghost",
                            // The design marks the current screen with a coral wavy
                            // underline rather than a filled pill.
                            className: path === href && "font-bold text-primary underline decoration-coral decoration-wavy decoration-2 underline-offset-6 hover:text-primary",
                        })}
                    >{label}</Link>
                ))}
                {signedIn ? (
                    <>
                        {path !== "/" ? <Link className={buttonVariants({ size: "sm", variant: "default" })} href={"/"}><Plus />Novo</Link> : ""}

                        <DropdownMenu>
                            <DropdownMenuTrigger nativeButton={false} className={"ml-4"} render={
                                <Avatar className={"cursor-pointer"}>
                                    <AvatarImage src={user?.image ?? undefined} alt='user-image' />
                                    <AvatarFallback><span className={"font-medium p-2"}>{user?.name.substring(0, 1).toUpperCase()}</span></AvatarFallback>
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
                    </>
                ) : (
                    <Link className={buttonVariants({ size: "sm", variant: "outline" })} href={"/register"} >Entrar</Link>
                )}
            </div>

            <div className='flex gap-2 items-center md:hidden'>
                {!signedIn && (
                    <Link className={buttonVariants({ size: "sm", variant: "outline" })} href={"/register"}>Entrar</Link>
                )}
                <MobileNav user={user} />
            </div>
        </>
    )
}
