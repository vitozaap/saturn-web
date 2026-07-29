import { formatBytes, sizeDelta, type SizeDelta } from "@/lib/format";
import { Compression, CompressionStatus } from "@/lib/types";

export const STATUS: Record<CompressionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
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

export function formatDate(iso: string | null) {
    if (!iso) return "—"
    return dateFormatter.format(new Date(iso))
}


export function totalCompressed(videos: Compression[]) {
    let totalSourceSize = 0;
    let totalOutputSize = 0;
    for (let i = 0; i <= videos.length - 1; i++) {
        totalSourceSize += Number(videos[i].sourceSize ?? 0)
        totalOutputSize += Number(videos[i].outputSize ?? videos[i].sourceSize)
    }
    const total = totalSourceSize - totalOutputSize
    return formatBytes(total)
}

export function average(videos: Compression[]): SizeDelta {
    let totalRatio = 0
    for (let i = 0; i <= videos.length - 1; i++) {
        totalRatio += videos[i].ratio ?? 0
    }
    const mean = totalRatio / videos.length
    return sizeDelta(Number.isNaN(mean) ? 1 : mean) ?? { percent: 0, inflated: false }
}