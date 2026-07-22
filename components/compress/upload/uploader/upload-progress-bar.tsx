"use client"

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
                <div
                    className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-150"
                    style={{ width: `${percent}%` }}
                />
            </div>
            <span className="font-mono text-sm font-bold tabular-nums">{percent}%</span>
        </div>
    )
}
