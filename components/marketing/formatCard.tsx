import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FormatCardProps {
    /** Extension chip, as the design writes it (".MP4"). */
    extension: string
    /** Typical reduction ("até −86%"). */
    reduction: string
    /** The format that shrinks the most wears the coral chip. */
    highlight?: boolean
    title: string
    /** Which way the card leans; the middle one tilts. */
    className?: string
    children: React.ReactNode
}

/** One supported container on the "Formatos" screen. */
export function FormatCard({
    extension,
    reduction,
    highlight,
    title,
    className,
    children,
}: FormatCardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border bg-card p-4 text-left shadow-lg md:rounded-3xl md:p-5.5",
                className
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="-rotate-2 rounded-lg bg-primary/10 px-2.5 py-1.5 font-mono text-xs font-bold text-primary md:text-sm">
                    {extension}
                </span>
                <Badge
                    variant={highlight ? "default" : "secondary"}
                    className={cn(
                        "rounded-md font-mono text-2xs md:text-xs",
                        highlight ? "bg-coral text-white" : "bg-primary/5"
                    )}
                >
                    {reduction}
                </Badge>
            </div>
            <h2 className="mt-3 font-heading text-base font-extrabold tracking-tight md:mt-4 md:text-lg">
                {title}
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-pretty text-muted-foreground md:mt-1.5 md:text-sm">
                {children}
            </p>
        </div>
    )
}
