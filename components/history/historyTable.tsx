"use client"

import { requestDownload } from "@/lib/api"
import { formatBytes, videoFormatLabel } from "@/lib/format"
import { Compression, CompressionStatus } from "@/lib/types"
import { CopyIcon, DownloadIcon, MoreHorizontalIcon, PlayIcon } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table"

const STATUS: Record<CompressionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    PENDING_UPLOAD: { label: "Enviando", variant: "secondary" },
    QUEUED: { label: "Na fila", variant: "secondary" },
    PROCESSING: { label: "Processando", variant: "secondary" },
    COMPLETED: { label: "Concluído", variant: "default" },
    FAILED: { label: "Falhou", variant: "destructive" },
    EXPIRED: { label: "Expirado", variant: "outline" },
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
})

function formatDate(iso: string | null) {
    if (!iso) return "—"
    return dateFormatter.format(new Date(iso))
}

function savings(ratio: number | null) {
    if (ratio == null) return null
    return Math.round((1 - ratio) * 100)
}

async function handleDownload(comp: Compression) {
    try {
        const url = await requestDownload({ compressionId: comp.id })
        const anchor = document.createElement("a")
        anchor.href = url
        anchor.download = comp.filename
        anchor.click()
    } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao baixar o arquivo.")
    }
}

async function handleCopyLink(comp: Compression) {
    try {
        const url = await requestDownload({ compressionId: comp.id })
        await navigator.clipboard.writeText(url)
        toast.success("Link copiado para a área de transferência.")
    } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao copiar o link.")
    }
}

export function HistoryTable({ compressions }: { compressions: Compression[] }) {
    return (
        <div className="max-h-full w-full overflow-auto rounded-2xl border bg-card [scrollbar-color:var(--primary)_transparent] scrollbar- scrollbar-thin [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/60 hover:[&::-webkit-scrollbar-thumb]:bg-primary">
            <Table containerClassName="overflow-visible">
                <TableHeader className="sticky top-0 z-10 bg-card [&_tr]:border-b">
                    <TableRow>
                        <TableHead>Arquivo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Tamanho</TableHead>
                        <TableHead>Economia</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {compressions.map((comp) => {
                        const status = STATUS[comp.status]
                        const percent = savings(comp.ratio)
                        const downloadable = comp.status === "COMPLETED"
                        return (
                            <TableRow key={comp.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3.5">
                                        <div className="flex h-9 w-14 flex-none items-center justify-center rounded-lg bg-[repeating-linear-gradient(135deg,var(--muted)_0,var(--muted)_0.5rem,var(--card)_0.5rem,var(--card)_1rem)]">
                                            <PlayIcon className="size-3 fill-primary text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">{comp.filename}</span>
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {videoFormatLabel(comp.contentType)}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(comp.completedAt ?? comp.createdAt)}
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                    {comp.sourceSize ? formatBytes(Number(comp.sourceSize)) : "—"}
                                    <span className="text-muted-foreground"> → </span>
                                    <span className="font-bold text-primary">
                                        {comp.outputSize ? formatBytes(Number(comp.outputSize)) : "—"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {percent != null ? (
                                        <Badge variant="secondary" className="font-mono">-{percent}%</Badge>
                                    ) : (
                                        <span className="text-muted-foreground">—</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={status.variant}>{status.label}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger
                                            render={<Button size="icon-sm" variant="ghost" aria-label="Ações" />}
                                        >
                                            <MoreHorizontalIcon />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                disabled={!downloadable}
                                                onClick={() => handleDownload(comp)}
                                            >
                                                <DownloadIcon />
                                                Baixar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                disabled={!downloadable}
                                                onClick={() => handleCopyLink(comp)}
                                            >
                                                <CopyIcon />
                                                Copiar link
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

            {compressions.length === 0 && (
                <div className="flex flex-col items-center gap-1 px-6 py-12 text-center">
                    <span className="font-semibold text-foreground">Nada por aqui ainda</span>
                    <span className="text-sm text-muted-foreground">
                        Comprima seu primeiro vídeo e ele aparece nesta lista.
                    </span>
                </div>
            )}
        </div>
    )
}
