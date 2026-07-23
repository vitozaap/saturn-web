import { formatBytes } from "@/lib/format";
import { Compression } from "@/lib/types";

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
    return Math.round(((1 - (totalRatio / videos.length)) * 100))
}