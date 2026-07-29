"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, m } from "motion/react"

import { settle } from "@/lib/motion"

const COMPRESSING_LINES = [
    "Analisando cada quadro com carinho…",
    "Espremendo os pixels desnecessários…",
    "Tirando o peso, mantendo a nitidez…",
    "Quase lá — dobrando com capricho…",
    "Último squish de capricho…",
]

/**
 * Purely cosmetic — never advances past what the actual work is doing, it just
 * gives the indeterminate bar something reassuring to say. Lives outside the
 * machine on purpose, same call as `usePosterPair`: it isn't state, it's flavor.
 */
export function RotatingStatusLine() {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((current) => Math.min(COMPRESSING_LINES.length - 1, current + 1))
        }, 3200)
        return () => clearInterval(interval)
    }, [])

    return (
        <AnimatePresence mode="wait" initial={false}>
            <m.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={settle}
                className="text-sm font-medium italic text-muted-foreground"
            >
                {COMPRESSING_LINES[index]}
            </m.p>
        </AnimatePresence>
    )
}
