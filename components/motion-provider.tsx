"use client"

import { LazyMotion, MotionConfig, domMax } from "motion/react"

// domMax (not domAnimation) because the uploader morph relies on layout
// animations. `strict` throws if any `motion.*` component sneaks in.
export function MotionProvider({ children }: { children: React.ReactNode }) {
    return (
        <LazyMotion features={domMax} strict>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </LazyMotion>
    )
}
