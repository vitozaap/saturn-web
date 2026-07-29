import { Entrance } from "@/components/motion/entrance";
import { HistoryCards } from "@/components/history/historyCards";
import { HistoryList } from "@/components/history/historyList";
import { HistoryTable } from "@/components/history/historyTable";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { listCompressions } from "@/lib/api.server";
import { getSession } from "@/lib/sessionServer";
import { Clock, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";




export default async function History() {
    const session = await getSession()
    if (session.data === null || session.data?.user.isAnonymous) {
        redirect("/login")
    }
    const compressions = await listCompressions()
    return (
        <main className="flex flex-col flex-1 items-center w-full md:min-h-0 md:overflow-hidden">
            <Entrance className="flex flex-col w-full sm:w-9/12 md:w-8/12 gap-4 px-5 pb-6 sm:px-6 md:flex-1 md:min-h-0 md:gap-3 md:pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-heading text-2xl sm:text-3xl font-bold">Suas compressões</h1>
                        <Label className="font-normal text-pretty">Tudo o que você espremeu fica aqui pra baixar de novo.</Label>
                        <Label className="font-medium text-muted-foreground text-xs"><Clock size={14} /> Cada arquivo fica disponível por 24h.</Label>
                    </div>
                    <HistoryCards compressions={compressions} />
                </div>
                <div className="md:hidden">
                    <HistoryList compressions={compressions} />
                </div>
                <div className="hidden md:flex md:flex-1 md:min-h-0 w-full items-start">
                    <HistoryTable compressions={compressions} />
                </div>
                {compressions.length > 0 && (
                    <Link href="/" className={buttonVariants({ size: "lg", className: "w-full md:hidden" })}>
                        <Plus /> Novo vídeo
                    </Link>
                )}
            </Entrance>
        </main>
    )
}