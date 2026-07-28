import type { User } from "better-auth"
import { FileVideo, HelpCircle, type LucideIcon } from "lucide-react"


export type NavUser = User & { isAnonymous: boolean | undefined | null }

export function isSignedIn(user: NavUser | undefined) {
    return Boolean(user && !user.isAnonymous)
}


export const NAV_PAGES: { href: string; label: string; icon: LucideIcon }[] = [
    { href: "/help", label: "Como funciona", icon: HelpCircle },
    { href: "/formats", label: "Formatos", icon: FileVideo },
]
