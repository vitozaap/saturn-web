"use client"

import { m } from "motion/react"

import { settle } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * Press feedback for primary action buttons (spec §5). Wraps instead of
 * patching the shadcn Button so chrome buttons stay untouched.
 */
export function Tap({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <m.div tabIndex={-1} whileTap={{ scale: 0.97 }} transition={settle} className={cn("inline-flex", className)}>
            {children}
        </m.div>
    )
}
