"use client"

import { useEffect, useState } from "react"

import { Preset } from "@/lib/types"
import {
    CapturedFrame,
    PRESET_SIMULATION,
    REFERENCE_ENCODE,
    captureFrame,
    encodeFrame,
} from "@/lib/video"

type CaptureState = { file: File; frame: CapturedFrame; url: string | null }
type DegradedState = { frame: CapturedFrame; preset: Preset; url: string | null }

/**
 * Extracts a frame from the local file and produces the before/after pair for
 * the result screen. Both are blob URLs of identical dimensions; null means
 * either "still working" or "codec not supported", which callers render the
 * same way (the striped placeholder).
 *
 * Call this from the container that owns the machine, not from the result card:
 * the cards only show up in `completed`, but capturing on drop uses the upload
 * and processing window, so the pair is already in memory by then.
 *
 * The `file` dependency must be the File itself, never the machine snapshot —
 * `useMachine` re-renders on every UPLOAD_PROGRESS event, and a fresh context
 * object each tick would restart the capture dozens of times per second. The
 * File identity survives `assign`, so it is stable for a whole run.
 */
export function usePosterPair(file: File | null, preset: Preset) {
    const [captured, setCaptured] = useState<CaptureState | null>(null)
    const [degraded, setDegraded] = useState<DegradedState | null>(null)

    // Each state carries what produced it, so results from a previous file or
    // preset are filtered out here rather than reset from inside an effect.
    const current = captured && captured.file === file ? captured : null
    const frame = current?.frame ?? null
    const before = current?.url ?? null
    const after =
        degraded && degraded.frame === frame && degraded.preset === preset ? degraded.url : null

    useEffect(() => {
        if (!file) return

        let cancelled = false
        let owned: CapturedFrame | null = null
        let url: string | null = null

        void (async () => {
            const next = await captureFrame(file)
            if (!next) return
            if (cancelled) {
                next.close()
                return
            }
            owned = next

            const reference = await encodeFrame(next, REFERENCE_ENCODE)
            // Teardown may have happened while we were encoding. Revoke rather
            // than set state, or the blob URL leaks for the page's lifetime.
            // This is also what makes StrictMode's double invoke correct in dev.
            if (cancelled) {
                if (reference) URL.revokeObjectURL(reference)
                return
            }

            url = reference
            setCaptured({ file, frame: next, url: reference })
        })()

        return () => {
            cancelled = true
            owned?.close()
            if (url) URL.revokeObjectURL(url)
        }
    }, [file])

    // Split from the capture effect on purpose: RETRY reuses the same File with
    // a possibly different preset, and re-encoding an in-memory bitmap costs
    // milliseconds against a full video decode.
    useEffect(() => {
        if (!frame) return

        let cancelled = false
        let url: string | null = null

        void (async () => {
            const next = await encodeFrame(frame, PRESET_SIMULATION[preset])
            if (cancelled) {
                if (next) URL.revokeObjectURL(next)
                return
            }

            url = next
            setDegraded({ frame, preset, url: next })
        })()

        return () => {
            cancelled = true
            if (url) URL.revokeObjectURL(url)
        }
    }, [frame, preset])

    return {
        before,
        after,
        ready: before !== null,
        // Already decoded while capturing the poster frame — exposed so callers
        // don't need a second video probe just for the meta line (resolution/duration).
        width: frame?.width ?? null,
        height: frame?.height ?? null,
        duration: frame?.duration ?? null,
    }
}
