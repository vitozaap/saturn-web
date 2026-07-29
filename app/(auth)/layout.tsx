import { Entrance } from "@/components/motion/entrance";
import { AuthTabs } from "@/components/auth/auth-tabs";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/sessionServer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getSession()
    if (session.data !== null && !session.data?.user.isAnonymous) {
        redirect("/history")
    }
    return (
        <main className="flex flex-col flex-1 w-full mt-6 sm:mt-12 items-center">
            <div className="flex w-full px-5 sm:px-9 justify-end"><Link className={buttonVariants({
                size: "sm",
                variant: "link"
            })} href={"/"}> <ArrowLeft /> Voltar para home</Link></div>
            <Entrance className="flex flex-col gap-4 w-full max-w-100 px-5 pb-8 sm:px-0">
                <AuthTabs>{children}</AuthTabs>
            </Entrance>
        </main>
    )
}
