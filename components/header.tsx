import { Logo } from "./logo";
import Link from "next/link";
import { HeaderActions } from "./headerActions";
import { getSession } from "@/lib/sessionServer";

export async function Header() {
    const session = await getSession()
    return (
        <header className="flex w-full py-4 px-5 sm:py-5 sm:px-9 items-center-safe justify-between">
            <Link href="/" className="flex gap-2 items-center cursor-pointer">
                <Logo className="size-8 sm:size-9.5" /> <h1 className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight">squish</h1>
            </Link>
            <HeaderActions user={session.data?.user} />
        </header>
    )
}