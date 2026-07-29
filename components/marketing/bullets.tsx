import { cn } from "@/lib/utils"

/** The design's three accents, in the order they always appear. */
const DOT = {
    primary: "bg-primary",
    coral: "bg-coral",
    gold: "bg-gold",
} as const

export type Bullet = { label: string; tone: keyof typeof DOT }

/**
 * Reassurance line under the cards: a colored dot per claim. Stacks on phones
 * and lays out inline from `md`, which is where the row still fits in one line.
 */
export function Bullets({ items, className }: { items: Bullet[]; className?: string }) {
    return (
        <ul
            className={cn(
                "mt-4.5 flex flex-col items-center gap-2 text-xs font-semibold text-muted-foreground md:mt-6.5 md:flex-row md:gap-5",
                className
            )}
        >
            {items.map(({ label, tone }) => (
                <li key={label} className="inline-flex items-center gap-1.5">
                    <span className={cn("size-1.5 rounded-full", DOT[tone])} />
                    {label}
                </li>
            ))}
        </ul>
    )
}
