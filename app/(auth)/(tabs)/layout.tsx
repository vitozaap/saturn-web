import { AuthTabs } from "@/components/auth/auth-tabs";

export default function TabsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <AuthTabs>{children}</AuthTabs>
}
