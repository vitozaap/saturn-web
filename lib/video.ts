import { Preset } from "@/lib/types"

export type CapturedFrame = {
    bitmap: ImageBitmap
    /** Already normalised to TARGET_WIDTH — not the source video's resolution. */
    width: number
    height: number
    duration: number
    /** ImageBitmap is not garbage collected. Calling this is mandatory. */
    close(): void
}

export type EncodeOptions = {
    /** Intermediate resolution, 0..1. Does more visual work than `quality`. */
    scale: number
    /** JPEG quality, 0..1. */
    quality: number
    /** Encode/decode cycles. Above 1 the artefacts compound generationally. */
    passes: number
}

const TARGET_WIDTH = 600
const TIMEOUT_MS = 5_000
const SEEK_RATIO = 0.1
const MAX_SEEK_S = 2
const OUTPUT_QUALITY = 0.92

/**
 * How much visual damage to fake per preset, so the user can see the quality
 * trade-off. Calibrated against the copy in `components/compress/upload/items.ts`:
 * MID promises "sem perda visível" and is the recommended option, so it has to
 * still look good — overdoing it there contradicts the card's own text.
 *
 * This is an illustrative simulation, not the ffmpeg output. The real compressed
 * video does not exist until the worker is done.
 */
export const PRESET_SIMULATION: Record<Preset, EncodeOptions> = {
    HIGH: { scale: 1, quality: 0.55, passes: 1 },
    MID: { scale: 0.72, quality: 0.34, passes: 1 },
    LOW: { scale: 0.4, quality: 0.18, passes: 2 },
}

/** The "antes" card: the frame as captured, no simulated damage. */
export const REFERENCE_ENCODE: EncodeOptions = { scale: 1, quality: OUTPUT_QUALITY, passes: 1 }

type VideoWithFrameCallback = HTMLVideoElement & {
    requestVideoFrameCallback?: (callback: () => void) => number
}

/**
 * Decodes a single frame from a local file. Returns null instead of throwing —
 * an absent poster is a supported, invisible outcome (HEVC/MOV commonly fail to
 * decode on Chrome/Linux and Chrome/Windows without a hardware decoder).
 */
export async function captureFrame(file: File): Promise<CapturedFrame | null> {
    if (typeof document === "undefined") return null

    const video = document.createElement("video")
    // An empty file.type tells us nothing, so only bail when the browser
    // actively rejects a type it was given.
    if (file.type && !video.canPlayType(file.type)) return null

    const url = URL.createObjectURL(file)
    // Detaches every event listener on abort — without it, a timeout would
    // leave the "loadedmetadata"/"seeked"/"error" listeners attached until GC.
    const abort = new AbortController()

    try {
        video.muted = true
        video.playsInline = true
        video.preload = "metadata"
        // iOS refuses to decode a detached element, and `display:none` suppresses
        // decoding as well — so it stays in the document, just invisible.
        video.setAttribute(
            "style",
            "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none",
        )
        document.body.appendChild(video)
        video.src = url

        await withTimeout(seekToFrame(video, abort.signal), TIMEOUT_MS)
        if (!video.videoWidth) return null

        const scale = Math.min(1, TARGET_WIDTH / video.videoWidth)
        const width = Math.round(video.videoWidth * scale)
        const height = Math.round(video.videoHeight * scale)

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext("2d")
        if (!context) return null
        context.drawImage(video, 0, 0, width, height)

        const bitmap = await createImageBitmap(canvas)
        canvas.width = 0
        canvas.height = 0

        return {
            bitmap,
            width,
            height,
            duration: Number.isFinite(video.duration) ? video.duration : 0,
            close: () => bitmap.close(),
        }
    } catch {
        return null
    } finally {
        abort.abort()
        video.removeAttribute("src")
        // Releases the decoder now rather than at GC — matters for 4K sources,
        // where a decoded frame is ~33 MB.
        video.load()
        video.remove()
        URL.revokeObjectURL(url)
    }
}

/**
 * Re-encodes a captured frame with simulated compression damage and returns a
 * blob URL. The caller owns revocation. Output is always frame.width x
 * frame.height so before/after never differ in size.
 */
export async function encodeFrame(frame: CapturedFrame, options: EncodeOptions): Promise<string | null> {
    const intermediates: ImageBitmap[] = []
    // frame.bitmap is only ever drawn synchronously, before the first await —
    // after that `source` is an intermediate we own. Keep it that way: the
    // caller may close() the frame while we are suspended.
    let source: CanvasImageSource = frame.bitmap

    try {
        for (let pass = 0; pass < options.passes; pass++) {
            const width = Math.max(1, Math.round(frame.width * options.scale))
            const height = Math.max(1, Math.round(frame.height * options.scale))

            const blob = await drawToBlob(source, width, height, options.quality, true)
            if (!blob) return null

            const decoded = await createImageBitmap(blob)
            intermediates.push(decoded)
            source = decoded
        }

        // Smoothing OFF on the way back up is what preserves the blocks. With it
        // on the result reads as "blurry" rather than "compressed".
        const final = await drawToBlob(source, frame.width, frame.height, OUTPUT_QUALITY, false)
        return final ? URL.createObjectURL(final) : null
    } catch {
        return null
    } finally {
        for (const bitmap of intermediates) bitmap.close()
    }
}

async function seekToFrame(video: HTMLVideoElement, signal: AbortSignal) {
    await once(video, "loadedmetadata", signal)

    const duration = Number.isFinite(video.duration) ? video.duration : 0
    // The opening frames are often black or a fade-in.
    video.currentTime = Math.min(duration * SEEK_RATIO, MAX_SEEK_S)

    await once(video, "seeked", signal)
    await nextPresentedFrame(video)
}

function once(video: HTMLVideoElement, event: string, signal: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
        video.addEventListener(event, () => resolve(), { once: true, signal })
        video.addEventListener(
            "error",
            () => reject(video.error ?? new Error(`video failed before "${event}"`)),
            { once: true, signal },
        )
    })
}

const PRESENT_GRACE_MS = 300

/**
 * "seeked" can fire before a frame is actually presentable (Safari), which
 * captures black. requestVideoFrameCallback only fires with a decoded frame —
 * but the capture `<video>` is 1x1 and opacity:0, and some browsers never
 * composite (so never "present") a frame for an effectively-invisible
 * element, which would hang here forever. Race it against a short grace
 * period instead: by the time `seeked` already fired, the frame is decoded
 * and safe to draw even if the compositor never reports it as presented.
 */
function nextPresentedFrame(video: HTMLVideoElement) {
    const withCallback = video as VideoWithFrameCallback

    if (typeof withCallback.requestVideoFrameCallback !== "function") {
        return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    }

    return new Promise<void>((resolve) => {
        let settled = false
        const finish = () => {
            if (settled) return
            settled = true
            resolve()
        }
        withCallback.requestVideoFrameCallback!(finish)
        setTimeout(finish, PRESENT_GRACE_MS)
    })
}

function drawToBlob(
    source: CanvasImageSource,
    width: number,
    height: number,
    quality: number,
    smoothing: boolean,
) {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext("2d")
    if (!context) return Promise.resolve(null)

    context.imageSmoothingEnabled = smoothing
    context.drawImage(source, 0, 0, width, height)

    return new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
            (blob) => {
                canvas.width = 0
                canvas.height = 0
                resolve(blob)
            },
            "image/jpeg",
            quality,
        )
    })
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("video decode timed out")), ms)
        promise.then(resolve, reject).finally(() => clearTimeout(timer))
    })
}
