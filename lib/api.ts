import type { Compression, RequestCompressionInput, RequestCompressionResponse } from "./types"

// POST /compressor — creates a PENDING_UPLOAD row and returns a presigned
// S3 PUT URL to upload the source video to.
export async function requestCompression(input: RequestCompressionInput): Promise<RequestCompressionResponse> {
    void input
    throw new Error("Not implemented (M2)")
}

// PUT {uploadUrl} — uploads the file straight to S3. XHR instead of fetch
// because only xhr.upload.onprogress reports real upload progress; the
// AbortSignal backs the "Cancelar" button during the upload phase.
export function uploadToS3(
    uploadUrl: string,
    file: File,
    onProgress: (percent: number) => void,
    signal?: AbortSignal,
): Promise<void> {
    void uploadUrl
    void file
    void onProgress
    void signal
    throw new Error("Not implemented (M2)")
}

// POST /compressor/confirm-upload — transitions the row to QUEUED after the
// S3 upload succeeds.
export async function confirmUpload(compressionId: string): Promise<void> {
    void compressionId
    throw new Error("Not implemented (M2)")
}

// GET /compressor — lists every compression owned by the authenticated user.
export async function listCompressions(): Promise<Compression[]> {
    throw new Error("Not implemented (M2)")
}

// SSE GET /compressor/:id/stream — emits the compression on each status
// change and closes at COMPLETED/FAILED. Caller owns the EventSource
// lifecycle (close on unmount/terminal status).
export function streamCompression(id: string): EventSource {
    void id
    throw new Error("Not implemented (M2)")
}

// POST /compressor/download — returns a presigned S3 download URL for a
// COMPLETED compression. The API responds with plain text, not JSON
// (res.text(), never res.json()).
export async function requestDownload(compressionId: string): Promise<string> {
    void compressionId
    throw new Error("Not implemented (M2)")
}
