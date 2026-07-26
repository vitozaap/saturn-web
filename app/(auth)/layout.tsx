import { AuthTabs } from "@/components/auth/auth-tabs";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
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
