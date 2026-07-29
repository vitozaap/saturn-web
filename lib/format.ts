const KB = 1024
const MB = KB * 1024
const GB = MB * 1024

export function formatBytes(bytes: number) {
    if (bytes >= GB) {
        const value = bytes / GB
        const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10
        return `${rounded} GB`
    }
    if (bytes >= MB) return `${Math.round(bytes / MB)} MB`
    if (bytes <= 0) return "0 KB"
    return `${Math.max(1, Math.round(bytes / KB))} KB`
}


export type SizeDelta = { percent: number; inflated: boolean }

export function sizeDelta(ratio: number | null): SizeDelta | null {
    if (ratio == null) return null
    const saved = Math.round((1 - ratio) * 100)
    return { percent: Math.abs(saved), inflated: saved < 0 }
}

export function formatDelta({ percent, inflated }: SizeDelta) {
    if (percent === 0) return "0%"
    return `${inflated ? "+" : "−"}${percent}%`
}

/** "3:24" — falls back to "" for an unknown/non-finite duration. */
export function formatDuration(seconds: number) {
    if (!seconds || !Number.isFinite(seconds)) return ""
    const total = Math.round(seconds)
    const minutes = Math.floor(total / 60)
    const remaining = total % 60
    return `${minutes}:${remaining < 10 ? "0" : ""}${remaining}`
}


export function resolutionLabel(height: number) {
    if (!height) return ""
    if (height >= 2160) return "4K"
    if (height >= 1440) return "1440p"
    if (height >= 1080) return "1080p"
    if (height >= 720) return "720p"
    if (height >= 480) return "480p"
    return `${height}p`
}

/**
 * "minhas-ferias-na-praia-em-2026.mp4" → "minhas-ferias-na-fe….mp4".
 * Ellipsis goes before the extension, since that is the part that tells the
 * user which file it is. For text rendered in the DOM prefer the `truncate`
 * class — this is for strings built in JS, like toast messages.
 */
export function truncateFilename(filename: string, max = 32) {
    if (filename.length <= max) return filename
    const dot = filename.lastIndexOf(".")
    const ext = dot > 0 ? filename.slice(dot) : ""
    // No extension, or one too long to be worth keeping: plain tail ellipsis.
    if (ext.length === 0 || ext.length >= max - 1) return `${filename.slice(0, max - 1)}…`
    return `${filename.slice(0, max - 1 - ext.length)}…${ext}`
}

export function videoFormatLabel(contentType: string) {
    if (contentType === "video/webm") return "WebM"
    if (contentType === "video/quicktime") return "MOV"
    return "MP4"
}
