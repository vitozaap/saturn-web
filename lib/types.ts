export type CompressionStatus =
    | "PENDING_UPLOAD"
    | "QUEUED"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "EXPIRED"

export type Preset = "HIGH" | "MID" | "LOW"

// Mirrors the API's CompressionResponseDto. BigInt sizes arrive serialized as
// strings; dates arrive as ISO strings over JSON.
export interface Compression {
    id: string
    filename: string
    status: CompressionStatus
    contentType: string
    sourceSize: string | null
    outputSize: string | null
    ratio: number | null
    error: string | null
    createdAt: string
    updatedAt: string
    completedAt: string | null
}

export interface RequestCompressionInput {
    filename: string
    contentType: string
    preset?: Preset
}

export interface ConfirmUploadInput {
    compressionId: string
}

export interface UploadS3Input {
    uploadUrl: string,
    file: File,
    onProgress: (percent: number) => void,
    signal?: AbortSignal,
}

export interface StreamCompressionInput {
    compressionId: string
}

export interface RequestDownloadInput {
    compressionId: string
}

export interface RequestCompressionResponse {
    compressionId: string
    uploadUrl: string
    sourceKey: string
}
