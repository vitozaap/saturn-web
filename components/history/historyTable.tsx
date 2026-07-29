"use client"

import { formatBytes, formatDelta, sizeDelta, videoFormatLabel } from "@/lib/format"
import { Compression } from "@/lib/types"
import { PlayIcon } from "lucide-react"
import { Badge } from "../ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table"
import { HistoryEmpty } from "./emptyState"
import { formatDate, STATUS } from "./helpers"
import { RowActions } from "./rowActions"
import { useCompressionActions } from "./useCompressionActions"

function HistoryRow({ comp }: { comp: Compression }) {
    const actions = useCompressionActions(comp)
    const status = STATUS[comp.status]
    const delta = sizeDelta(comp.ratio)

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-14 flex-none items-center justify-center rounded-lg bg-[repeating-linear-gradient(135deg,var(--muted)_0,var(--muted)_0.5rem,var(--card)_0.5rem,var(--card)_1rem)]">
                        <PlayIcon className="size-3 fill-primary text-primary" />
                    </div>

                    <div className="flex min-w-0 max-w-md flex-col">
                        <span
                            className="truncate font-semibold text-foreground"
                            title={comp.filename}
                        >
                            {comp.filename}
                        </span>
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
                {delta != null ? (
                    <Badge variant={delta.inflated ? "outline" : "secondary"} className="font-mono">
                        {formatDelta(delta)}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )}
            </TableCell>
            <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
            </TableCell>
            <TableCell className="text-right">
                <RowActions comp={comp} actions={actions} />
            </TableCell>
        </TableRow>
    )
}

export function HistoryTable({ compressions }: { compressions: Compression[] }) {
    if (compressions.length === 0) return <HistoryEmpty />

    return (
        <div className="max-h-full w-full overflow-auto rounded-2xl border bg-card [scrollbar-color:var(--primary)_transparent] scrollbar-thin [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/60 hover:[&::-webkit-scrollbar-thumb]:bg-primary">
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
                    {compressions.map((comp) => (
                        <HistoryRow key={comp.id} comp={comp} />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
