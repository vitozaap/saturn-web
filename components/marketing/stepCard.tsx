import { Squeeze } from "@/components/motion/ambient"
import { cn } from "@/lib/utils"

interface StepCardProps {
    /** Two-digit order chip ("01"). */
    step: string
    title: string
    icon: React.ReactNode
    /** Step 02 is the hero of the trio: primary border, tilt, and a squeezing icon. */
    featured?: boolean
    children: React.ReactNode
}

/**
 * One of the three "Como funciona" steps. The two viewports genuinely diverge:
 * phones read it as a row (chip beside the text, no icon), desktop stacks the
 * chip-and-icon header above the copy.
 */
export function StepCard({ step, title, icon, featured, children }: StepCardProps) {
    const iconBox = (
        <span
            className={cn(
                "hidden size-10.5 items-center justify-center rounded-xl text-primary md:flex",
                featured ? "bg-primary/10" : "bg-primary/5"
            )}
        >
            {icon}
        </span>
    )

    return (
        <div
            className={cn(
                "flex items-start gap-3.5 rounded-2xl border bg-card p-4 text-left shadow-lg md:flex-col md:gap-0 md:rounded-3xl md:p-5.5",
                featured && "rotate-1 border-primary shadow-primary/25"
            )}
        >
            <div className="flex flex-none items-center md:w-full md:justify-between">
                <span
                    className={cn(
                        "-rotate-3 rounded-lg px-2.5 py-1 font-mono text-xs font-bold",
                        featured ? "bg-primary text-white" : "bg-primary/10 text-primary"
                    )}
                >
                    {step}
                </span>
                {featured ? <Squeeze className="hidden md:inline-flex">{iconBox}</Squeeze> : iconBox}
            </div>
            <div className="md:mt-4">
                <h2 className="font-heading text-base font-extrabold tracking-tight md:text-lg">
                    {title}
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-pretty text-muted-foreground md:mt-1.5 md:text-sm">
                    {children}
                </p>
            </div>
        </div>
    )
}
