"use client"

import { m } from "motion/react"

import { drift, squeeze } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * Decorative ornament that drifts in place (the design's `bobFloat`): the dots
 * and mono glyphs scattered behind the marketing screens. Purely presentational,
 * so it is hidden from assistive tech.
 */
export function Float({
    className,
    delay = 0,
    children,
}: {
    className?: string
    delay?: number
    children?: React.ReactNode
}) {
    return (
        <m.span
            aria-hidden
            className={cn("absolute", className)}
            initial={{ y: 0, rotate: -2 }}
            animate={{ y: -10, rotate: 2 }}
            transition={{ ...drift, delay }}
        >
            {children}
        </m.span>
    )
}

/** Wraps the step-02 icon so it keeps squeezing itself — the product's own gesture. */
export function Squeeze({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <m.span
            aria-hidden
            className={cn("inline-flex", className)}
            animate={{ scaleX: 0.78 }}
            transition={squeeze}
        >
            {children}
        </m.span>
    )
}
