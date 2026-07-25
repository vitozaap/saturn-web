import { AuthTabs } from "@/components/auth/auth-tabs";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="flex flex-col mt-12 items-center h-full">
            <div className="flex flex-col gap-4 w-[400px]">
                <AuthTabs>{children}</AuthTabs>
            </div>
        </main>
    )
}
