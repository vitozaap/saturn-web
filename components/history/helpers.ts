import { formatBytes } from "@/lib/format";
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

export function savings(ratio: number | null) {
    if (ratio == null) return null
    return Math.round((1 - ratio) * 100)
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

export function average(videos: Compression[]) {
    let totalRatio = 0
    for (let i = 0; i <= videos.length - 1; i++) {
        totalRatio += videos[i].ratio ?? 0
    }
    const res = Math.round(((1 - (totalRatio / videos.length)) * 100))
    return Number.isNaN(res) ? 0 : res
}