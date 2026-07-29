"use client"

import { m } from "motion/react"

import { rise } from "@/lib/motion"

type EntranceProps = {
    delay?: number
    className?: string
    children: React.ReactNode
}

/**
 * Single-block page entrance (spec §2): fades in rising with the `rise`
 * spring. Server components can use it around their content — children
 * cross the boundary untouched.
 */
export function Entrance({ delay = 0, className, children }: EntranceProps) {
    return (
        <m.div
            className={className}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...rise, delay }}
        >
            {children}
        </m.div>
    )
}
