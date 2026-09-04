"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";

interface HeaderItem {
	title: string;
	description: string;
}

type AuthMode = "login" | "register";

const headerText: Record<AuthMode, HeaderItem> = {
	register: {
		title: "Crie sua conta",
		description: "Crie uma conta para ter acesso a todas as funcionalidades.",
	},
	login: {
		title: "Bem-vindo de volta",
		description: "Faça login em sua conta de forma rápida.",
	},
};

export function AuthTabs({ children }: { children: React.ReactNode }) {
	const mode: AuthMode = usePathname() === "/login" ? "login" : "register";

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>{headerText[mode].title}</CardTitle>
				<CardDescription>{headerText[mode].description}</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs value={mode} className={"gap-6"}>
					<TabsList className={"w-full"}>
						<TabsTrigger
							value={"register"}
							nativeButton={false}
							render={<Link href="/register" />}
						>
							Criar conta
						</TabsTrigger>
						<TabsTrigger
							value={"login"}
							nativeButton={false}
							render={<Link href="/login" />}
						>
							Fazer login
						</TabsTrigger>
					</TabsList>
					<div className="flex flex-col w-full h-max">{children}</div>
				</Tabs>
			</CardContent>
		</Card>
	);
}
