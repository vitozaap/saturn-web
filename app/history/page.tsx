import { HistoryCards } from "@/components/history/historyCards";
import { Label } from "@/components/ui/label";
import { listCompressions } from "@/lib/api.server";
import { formatBytes } from "@/lib/format";
import { Compression } from "@/lib/types";
import { Clock } from "lucide-react";




export default async function History() {
    const compressions = await listCompressions()
    return (
        <main className="flex flex-col flex-1 items-center h-full w-full">
            <section className="flex flex-col h-full w-full md:w-8/12 sm:w-9/12">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-heading text-3xl font-bold">Suas compressões</h1>
                        <Label className="font-normal">Tudo o que você espremeu fica aqui pra baixar de novo.</Label>
                        <Label className="font-medium text-muted-foreground text-xs"><Clock size={14} /> Cada arquivo fica disponível por 24h.</Label>
                    </div>
                    <HistoryCards compressions={compressions} />
                </div>
            </section>
        </main>
    )
}