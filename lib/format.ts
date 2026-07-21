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
    return `${Math.max(1, Math.round(bytes / KB))} KB`
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

export function videoFormatLabel(contentType: string) {
    if (contentType === "video/webm") return "WebM"
    if (contentType === "video/quicktime") return "MOV"
    return "MP4"
}
