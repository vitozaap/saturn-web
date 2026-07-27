import { AuthTabs } from "@/components/auth/auth-tabs";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/sessionServer";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getSession()
    if (session && !session.data?.user.isAnonymous) {
        redirect("/history")
    }
    return (
        <main className="flex flex-col mt-12 items-center h-full">
            <div className="flex w-full px-9 justify-end"><Link className={buttonVariants({
                size: "sm",
                variant: "link"
            })} href={"/"}> <ArrowLeft /> Voltar para home</Link></div>
            <div className="flex flex-col gap-4 w-[400px]">
                <AuthTabs>{children}</AuthTabs>
            </div>
        </main>
    )
}
