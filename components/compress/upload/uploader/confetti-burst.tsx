"use client"

import { useMemo } from "react"
import { m, useReducedMotion } from "motion/react"

const COLORS = ["var(--primary)", "var(--coral)", "#facc15"]
const COUNT = 18

/**
 * One-shot burst behind the success check (design's playful confetti).
 * Pure decoration: aria-hidden, pointer-events-none, and it renders
 * nothing at all under reduced motion.
 */
export function ConfettiBurst() {
    const shouldReduceMotion = useReducedMotion()
    const pieces = useMemo(
        () =>
            Array.from({ length: COUNT }, (_, index) => ({
                angle: (index / COUNT) * 2 * Math.PI,
                distance: 90 + (index % 3) * 45,
                color: COLORS[index % COLORS.length],
                spin: 120 + ((index * 47) % 240),
            })),
        [],
    )

    if (shouldReduceMotion) return null

    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {pieces.map((piece, index) => (
                <m.span
                    key={index}
                    className="absolute size-2 rounded-xs"
                    style={{ backgroundColor: piece.color }}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 0, rotate: 0 }}
                    animate={{
                        x: Math.cos(piece.angle) * piece.distance,
                        y: Math.sin(piece.angle) * piece.distance - 30,
                        scale: 0.5,
                        opacity: [0, 1, 0],
                        rotate: piece.spin,
                    }}
                    transition={{
                        duration: 0.9,
                        ease: "easeOut",
                        delay: 0.25,
                        opacity: { duration: 0.9, delay: 0.25, times: [0, 0.08, 1] },
                    }}
                />
            ))}
        </div>
    )
}
