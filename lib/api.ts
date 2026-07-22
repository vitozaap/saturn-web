import { ensureSession } from "./session"
import type {
    Compression,
    ConfirmUploadInput,
    RequestCompressionInput,
    RequestCompressionResponse,
    RequestDownloadInput,
    StreamCompressionInput,
    UploadS3Input,
} from "./types"

const JSON_HEADERS = { "Content-Type": "application/json" }

async function failure(res: Response, fallback: string): Promise<Error> {
    try {
        const body = await res.json()
        const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message
        if (message) return new Error(message)
    } catch {
        // Body was empty or not JSON — fall through to the generic message.
    }
    return new Error(fallback)
}

// POST /compressor — creates a PENDING_UPLOAD row and returns a presigned
// S3 PUT URL to upload the source video to.
export async function requestCompression(input: RequestCompressionInput): Promise<RequestCompressionResponse> {
    await ensureSession()
    const res = await fetch("/api/compressor", {
        method: "POST",
        headers: JSON_HEADERS,
        credentials: "include",
        body: JSON.stringify(input),
    })
    if (!res.ok) throw await failure(res, "Falha na conexão com o servidor.")
    return res.json()
}

// PUT {uploadUrl} — uploads the file straight to S3. XHR instead of fetch
// because only xhr.upload.onprogress reports real upload progress; the
// AbortSignal backs the "Cancelar" button during the upload phase.
export function uploadToS3(input: UploadS3Input): Promise<void> {
    const { uploadUrl, file, onProgress, signal } = input

    return new Promise<void>((resolve, reject) => {
        if (signal?.aborted) {
            reject(new DOMException("Envio cancelado.", "AbortError"))
            return
        }

        const xhr = new XMLHttpRequest()
        xhr.open("PUT", uploadUrl)
        xhr.setRequestHeader("Content-Type", file.type)

        const abort = () => xhr.abort()
        signal?.addEventListener("abort", abort)
        const cleanup = () => signal?.removeEventListener("abort", abort)

        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return
            onProgress((event.loaded / event.total) * 100)
        }

        xhr.onload = () => {
            cleanup()
            if (xhr.status >= 200 && xhr.status < 300) resolve()
            else reject(new Error("Falha ao salvar arquivo no servidor. Tente novamente mais tarde."))
        }

        xhr.onerror = () => {
            cleanup()
            reject(new Error("Falha de rede durante o envio do arquivo."))
        }

        xhr.onabort = () => {
            cleanup()
            reject(new DOMException("Envio cancelado.", "AbortError"))
        }

        xhr.send(file)
    })
}

// POST /compressor/confirm-upload — transitions the row to QUEUED after the S3 upload succeeds.
export async function confirmUpload(input: ConfirmUploadInput): Promise<void> {
    const res = await fetch("/api/compressor/confirm-upload", {
        method: "POST",
        headers: JSON_HEADERS,
        credentials: "include",
        body: JSON.stringify(input),
    })
    if (!res.ok) throw await failure(res, "Falha ao enfileirar a compressão.")
}

// GET /compressor — lists every compression owned by the authenticated user.
export async function listCompressions(): Promise<Compression[]> {
    const res = await fetch("/api/compressor", {
        method: "GET",
        credentials: "include",
    })
    if (!res.ok) throw await failure(res, "Falha ao carregar o histórico.")
    return res.json()
}

// SSE GET /compressor/:id/stream — emits the compression on each status
export function streamCompression(input: StreamCompressionInput): EventSource {
    return new EventSource(`/api/compressor/${input.compressionId}/stream`, {
        withCredentials: true,
    })
}

// POST /compressor/download — returns a presigned S3 download URL for a COMPLETED compression. (Respond with plain text)
export async function requestDownload(input: RequestDownloadInput): Promise<string> {
    const res = await fetch("/api/compressor/download", {
        method: "POST",
        headers: JSON_HEADERS,
        credentials: "include",
        body: JSON.stringify(input),
    })
    if (!res.ok) throw await failure(res, "Falha ao gerar o link de download.")
    return res.text()
}
