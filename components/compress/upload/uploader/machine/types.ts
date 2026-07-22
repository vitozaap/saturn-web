import { Compression, Preset } from "@/lib/types"

export type Context = {
    file: File | null
    preset: Preset
    compressionId: string | null
    uploadUrl: string | null
    uploadedPercent: number
    compression: Compression | null
    error: string | null
}

export type Events =
    | { type: "SUBMIT"; file: File; preset: Preset }
    | { type: "CANCEL" }
    | { type: "RETRY" }
    | { type: "RESET" }
    | { type: "DOWNLOAD" }
    | { type: "UPLOAD_PROGRESS"; percent: number }
    | { type: "UPLOAD_DONE" }
    | { type: "UPLOAD_ERROR"; message: string }
    | { type: "STATUS"; compression: Compression }
    | { type: "STREAM_ERROR" }

export type Emitted =
    | { type: "notify"; message: string }
    | { type: "download"; url: string }