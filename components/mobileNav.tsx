"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Book, LogOut, Menu, Plus } from "lucide-react"

import { authClient } from "@/lib/auth"
import { isSignedIn, NAV_PAGES, type NavUser } from "./navItems"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button, buttonVariants } from "./ui/button"
import { Separator } from "./ui/separator"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "./ui/sheet"

// Prevent theme hydration errors by only loading themeSwitch when the client is mounted
const ThemeSwitch = dynamic(() => import("./themeSwitch"), { ssr: false })

const itemClass = buttonVariants({
    variant: "ghost",
    size: "lg",
    className: "w-full justify-start gap-3",
})

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
    // Closing on click is not automatic: without SheetClose the panel would
    // stay open on top of the page it just navigated to.
    return (
        <SheetClose nativeButton={false} className={itemClass} render={<Link href={href} />}>
            {children}
        </SheetClose>
    )
}

export function MobileNav({ user }: { user: NavUser | undefined }) {
    const path = usePathname()
    const signedIn = isSignedIn(user)

    return (
        <Sheet>
            {signedIn ? (
                <SheetTrigger
                    nativeButton={false}
                    aria-label="Abrir menu"
                    render={
                        <Avatar className="size-9 cursor-pointer">
                            <AvatarImage src={user?.image ?? undefined} alt="" />
                            <AvatarFallback>
                                <span className="p-2 font-medium">
                                    {user?.name.substring(0, 1).toUpperCase()}
                                </span>
                            </AvatarFallback>
                        </Avatar>
                    }
                />
            ) : (
                <SheetTrigger aria-label="Abrir menu" render={<Button variant="outline" size="icon-sm" />}>
                    <Menu />
                </SheetTrigger>
            )}

            <SheetContent side="right" className="max-w-xs gap-0 p-0">
                <SheetHeader className="gap-1 pb-4">
                    <SheetTitle className="text-lg">{signedIn ? user?.name : "Menu"}</SheetTitle>
                    {signedIn && (
                        <span className="truncate text-sm text-muted-foreground">{user?.email}</span>
                    )}
                </SheetHeader>

                <nav className="flex flex-col gap-1 px-4">
                    {signedIn && path !== "/" && (
                        <NavItem href="/">
                            <Plus />
                            Novo vídeo
                        </NavItem>
                    )}
                    {NAV_PAGES.map(({ href, label, icon: Icon }) => (
                        <NavItem key={href} href={href}>
                            <Icon />
                            {label}
                        </NavItem>
                    ))}
                    {signedIn && (
                        <NavItem href="/history">
                            <Book />
                            Histórico
                        </NavItem>
                    )}
                </nav>

                <Separator className="my-4" />

                <div className="flex items-center justify-between px-4">
                    <span className="text-sm font-medium text-muted-foreground">Tema</span>
                    <ThemeSwitch />
                </div>

                {signedIn && (
                    <SheetFooter>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                            onClick={async () => {
                                await authClient.signOut().then(() => window.location.reload())
                            }}
                        >
                            <LogOut />
                            Sair da conta
                        </Button>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    )
}
