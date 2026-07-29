"use client"

import { m } from "motion/react"

import { settle } from "@/lib/motion"
import { UploaderContext } from "./uploader-context"

/**
 * This component is isolated because the UPLOAD_PROGRESS event from the state machine would make the entire page re-renders
 * a lot of times. Made this trying to improve app performance
 */
export function UploadProgressBar() {
    const percent = UploaderContext.useSelector((snapshot) => Math.round(snapshot.context.uploadedPercent))

    return (
        <div className="flex items-center gap-3.5">
            <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-primary/15">
                <m.div
                    className="absolute inset-y-0 left-0 w-full rounded-full bg-primary"
                    initial={false}
                    animate={{ x: `${percent - 100}%` }}
                    transition={settle}
                />
            </div>
            <span className="font-mono text-sm font-bold tabular-nums">{percent}%</span>
        </div>
    )
}
