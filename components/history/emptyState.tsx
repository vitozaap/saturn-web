import { FolderOpen, Plus } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "../ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty"

export function HistoryEmpty() {
    return (
        <Empty>
            <EmptyHeader className="max-w-full sm:max-w-1/2">
                <EmptyMedia variant={"icon"}>
                    <FolderOpen />
                </EmptyMedia>
                <EmptyTitle>Sem arquivos por aqui</EmptyTitle>
                <EmptyDescription>
                    Você ainda não realizou nenhuma compressão. Suas compressões (mesmo as expiradas ou falhadas) irão aparecer aqui.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-col gap-2 self-stretch sm:flex-row sm:justify-center sm:self-auto">
                <Link href={"/"} className={buttonVariants({ variant: "default" })}><Plus /> Nova compressão</Link>
                <Link href={"/help"} className={buttonVariants({ variant: "secondary" })}>Como funciona</Link>
            </EmptyContent>
        </Empty>
    )
}
