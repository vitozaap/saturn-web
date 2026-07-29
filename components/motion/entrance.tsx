"use client"

import { m } from "motion/react"

import { riseIn } from "@/lib/motion"

type EntranceProps = {
    delay?: number
    className?: string
    children: React.ReactNode
}

/**
 * Single-block page entrance (spec §2): fades in rising with the `rise`
 * spring. Server components can use it around their content — children
 * cross the boundary untouched.
 * When wrapping a Suspense boundary, the wrapper animates once at mount —
 * suspended children appear inside it already settled.
 */
export function Entrance({ delay = 0, className, children }: EntranceProps) {
    return (
        <m.div className={className} {...riseIn(delay)}>
            {children}
        </m.div>
    )
}
