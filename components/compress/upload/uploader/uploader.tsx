"use client"

import { useEffect } from "react"
import { toast } from "sonner"

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

    if (screen === "idle") return <UploadForm />

    if (screen === "result") return <ResultCard before={poster.before} after={poster.after} />

    const fileName = file?.name ?? ""
    const metaLine = [resolutionLabel(poster.height ?? 0), formatDuration(poster.duration ?? 0), videoFormatLabel(file?.type ?? "")]
        .filter(Boolean)
        .join(" · ")

    if (screen === "sending") return <SendingCard posterUrl={poster.before} fileName={fileName} metaLine={metaLine} />
    if (screen === "compressing") return <CompressingCard posterUrl={poster.before} fileName={fileName} metaLine={metaLine} />
    return <ErrorCard />
}

export function Uploader() {
    return (
        <UploaderContext.Provider>
            <EmittedEventsBridge />
            <div className="flex w-full flex-1 items-center justify-center">
                <UploaderScreens />
            </div>
        </UploaderContext.Provider>
    )
}
