import type { HTMLMotionProps, Transition } from "motion/react"

/**
 * Motion tokens — the only place springs are defined.
 * Components import these; never write spring configs inline.
 */

/** Signature spring: high stiffness, visible overshoot. Badges, drop-active, card morph. */
export const pop: Transition = { type: "spring", stiffness: 500, damping: 18, mass: 0.8 }

/** Entrance spring: rises with a slight overshoot. Page/block entrances. */
export const rise: Transition = { type: "spring", stiffness: 260, damping: 24 }

/** No-bounce spring: exits, progress, adjustments. */
export const settle: Transition = { type: "spring", stiffness: 300, damping: 32 }

/** Gap between staggered landing elements (seconds). */
export const STAGGER = 0.08

type RiseProps = Pick<HTMLMotionProps<"div">, "initial" | "animate" | "transition">

/** Fade+rise entrance props for m.* elements; delay in seconds. */
export const riseIn = (delay = 0): RiseProps => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { ...rise, delay },
})
