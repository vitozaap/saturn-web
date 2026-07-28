"use client"

import { Clock, DownloadIcon, PlayIcon } from "lucide-react"

import { formatBytes, videoFormatLabel } from "@/lib/format"
import { Compression } from "@/lib/types"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { HistoryEmpty } from "./emptyState"
import { formatDate, savings, STATUS } from "./helpers"
import { RowActions } from "./rowActions"
import { useCompressionActions } from "./useCompressionActions"

function HistoryCard({ comp }: { comp: Compression }) {
    const actions = useCompressionActions(comp)
    const status = STATUS[comp.status]
    const percent = savings(comp.ratio)
    const downloadable = comp.status === "COMPLETED"

    return (
        <li className="rounded-2xl border bg-card p-3.5">
            <div className="flex items-center gap-3">
                <div className="flex h-8.5 w-13 flex-none items-center justify-center rounded-lg bg-[repeating-linear-gradient(135deg,var(--muted)_0,var(--muted)_0.5rem,var(--card)_0.5rem,var(--card)_1rem)]">
                    <PlayIcon className="size-3 fill-primary text-primary" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold" title={comp.filename}>
                        {comp.filename}
                    </span>
                    <span className="truncate font-mono text-2xs text-muted-foreground">
                        {formatDate(comp.completedAt ?? comp.createdAt)} · {videoFormatLabel(comp.contentType)}
                    </span>
                </div>
                {percent != null && (
                    <Badge variant="secondary" className="flex-none font-mono">-{percent}%</Badge>
                )}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
                <div className="min-w-0 truncate font-mono text-xs">
                    {comp.sourceSize ? formatBytes(Number(comp.sourceSize)) : "—"}
                    <span className="text-muted-foreground"> → </span>
                    <span className="font-bold text-primary">
                        {comp.outputSize ? formatBytes(Number(comp.outputSize)) : "—"}
                    </span>
                </div>
                <div className="flex flex-none items-center gap-1">
                    {downloadable ? (
                        <Button size="sm" variant="outline" onClick={() => actions.download()}>
                            <DownloadIcon />
                            Baixar
                        </Button>
                    ) : (
                        <Badge
                            variant={status.variant}
                            className={comp.status === "EXPIRED" ? "border-dashed" : undefined}
                        >
                            {comp.status === "EXPIRED" && <Clock />}
                            {status.label}
                        </Badge>
                    )}
                    <RowActions comp={comp} actions={actions} showDownload={!downloadable} />
                </div>
            </div>
        </li>
    )
}


export function HistoryList({ compressions }: { compressions: Compression[] }) {
    if (compressions.length === 0) return <HistoryEmpty />

    return (
        <ul className="flex w-full flex-col gap-2.5">
            {compressions.map((comp) => (
                <HistoryCard key={comp.id} comp={comp} />
            ))}
        </ul>
    )
}
