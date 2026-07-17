

export function formatBytes(bytes: number) {
    return (bytes / (1024 ** 2)).toFixed(2)
}