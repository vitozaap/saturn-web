import { ErrorCode, type FileRejection } from "react-dropzone"
import { formatBytes, truncateFilename } from "@/lib/format"
import { MAX_SIZE } from "./validation"

/**
 * react-dropzone rejects a file before it ever reaches the form, so zod never
 * runs on it — the field just stays null and the schema reports a missing
 * value. These messages describe the actual reason instead.
 */
function describeError(code: string, file: File) {
    switch (code) {
        case ErrorCode.FileTooLarge:
            return `“${truncateFilename(file.name)}” tem ${formatBytes(file.size)}. O limite é ${formatBytes(MAX_SIZE)}.`
        case ErrorCode.FileInvalidType:
            return `“${truncateFilename(file.name)}” não é um vídeo. Envie MP4, WebM ou MOV.`
        case ErrorCode.TooManyFiles:
            return "Envie um vídeo por vez."
        case ErrorCode.FileTooSmall:
            return `“${truncateFilename(file.name)}” está vazio ou corrompido.`
        default:
            return `Não foi possível usar “${truncateFilename(file.name)}”.`
    }
}

/**
 * A single message for the whole drop. Multiple files dropped at once share one
 * toast — listing every rejection turns a mistake into a wall of text.
 */
export function describeRejections(rejections: readonly FileRejection[]) {
    if (rejections.length === 0) return null
    if (rejections.length > 1) return `Envie um vídeo por vez (${rejections.length} arquivos recusados).`

    const [{ file, errors }] = rejections
    // Order is dropzone's (type, size); the first error is the most specific.
    const [first] = errors
    return describeError(first?.code ?? "", file)
}
