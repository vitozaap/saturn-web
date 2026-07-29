"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AnimatePresence } from "motion/react"

import { UploadForm } from "../uploadForm"
import { usePosterPair } from "./usePosterPair"
import { UploaderContext } from "./uploader-context"
import { SendingCard } from "./sending-card"
import { CompressingCard } from "./compressing-card"
import { ErrorCard } from "./error-card"
import { ResultCard } from "./result-card"
import { formatDuration, resolutionLabel, videoFormatLabel } from "@/lib/format"

type Screen = "idle" | "sending" | "compressing" | "error" | "result"

function screenFor(value: unknown): Screen {
    if (typeof value === "object" && value !== null && "compressing" in value) return "compressing"
    switch (value) {
        case "creating":
        case "uploading":
        case "confirming":
            return "sending"
        case "error":
            return "error"
        case "completed":
        case "downloading":
            return "result"
        default:
            return "idle"
    }
}

function EmittedEventsBridge() {
    const actorRef = UploaderContext.useActorRef()

    useEffect(() => {
        const subs = [
            actorRef.on("notify", ({ message }) => toast(message)),
            actorRef.on("download", ({ url }) => {
                window.location.href = url
            }),
        ]
        return () => subs.forEach((sub) => sub.unsubscribe())
    }, [actorRef])

    return null
}

function UploaderScreens() {
    const screen = UploaderContext.useSelector((snapshot) => screenFor(snapshot.value))
    const file = UploaderContext.useSelector((snapshot) => snapshot.context.file)
    const preset = UploaderContext.useSelector((snapshot) => snapshot.context.preset)

    // Owned here, not per-card: `usePosterPair` decodes the video once per
    // File, and both the processing cards (thumbnail) and the result card
    // (before/after) read from this single capture.
    const poster = usePosterPair(file, preset)

    const fileName = file?.name ?? ""
    const metaLine = [resolutionLabel(poster.height ?? 0), formatDuration(poster.duration ?? 0), videoFormatLabel(file?.type ?? "")]
        .filter(Boolean)
        .join(" · ")

    // The landing cascade only plays the first time idle is shown on this
    // mount. Once the user has left idle (submitted, errored, ...), a
    // return to idle is a pure morph target — the m.form re-entering with
    // its cascade's initial opacity:0 would otherwise land invisible.
    // "Adjust state while rendering" (react.dev/learn/you-might-not-need-an-effect):
    // a guarded setState call in the render body itself, not in an effect or
    // a ref — the guard makes it a no-op once hasLeftIdle is already true.
    const [hasLeftIdle, setHasLeftIdle] = useState(false)
    if (screen !== "idle" && !hasLeftIdle) setHasLeftIdle(true)

    return (
        <AnimatePresence mode="popLayout">
            {screen === "idle" && <UploadForm key="idle" animateEntrance={!hasLeftIdle} />}
            {screen === "sending" && <SendingCard key="sending" posterUrl={poster.before} fileName={fileName} metaLine={metaLine} />}
            {screen === "compressing" && <CompressingCard key="compressing" posterUrl={poster.before} fileName={fileName} metaLine={metaLine} />}
            {screen === "error" && <ErrorCard key="error" />}
            {screen === "result" && <ResultCard key="result" before={poster.before} after={poster.after} />}
        </AnimatePresence>
    )
}

export function Uploader() {
    return (
        <UploaderContext.Provider>
            <EmittedEventsBridge />
            <div className="flex w-full flex-1 items-center justify-center px-5 py-4 sm:px-6">
                <UploaderScreens />
            </div>
        </UploaderContext.Provider>
    )
}
