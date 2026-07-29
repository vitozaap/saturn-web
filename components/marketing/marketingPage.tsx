import Link from "next/link"

import { Entrance } from "@/components/motion/entrance"
import { Tap } from "@/components/motion/tap"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Bullets, type Bullet } from "./bullets"

interface MarketingPageProps {
    /** Rotated pill above the title. */
    badge: string
    /** Which way the pill leans — the two screens tilt opposite ways. */
    badgeClassName?: string
    title: string
    /** Copy under the title. Sentences only shown from `md` carry their own `hidden md:inline`. */
    lead: React.ReactNode
    bullets: Bullet[]
    bulletsClassName?: string
    /** Cross-link to the sibling screen, next to the primary CTA. */
    secondary: { href: string; label: string }
    /** Mono aside under the CTA row. */
    footnote?: React.ReactNode
    /** Absolutely-positioned ornaments; the frame provides the clipping context. */
    decor?: React.ReactNode
    /** The three cards. */
    children: React.ReactNode
}

/**
 * Shared frame of the two content screens ("Como funciona" and "Formatos").
 * They differ only in their cards, so everything around them lives here and
 * the pages stay a description of their content.
 *
 * The block is top-aligned while the document scrolls (phones) and centers
 * itself from `md`, where the shell is pinned to the viewport.
 */
export function MarketingPage({
    badge,
    badgeClassName,
    title,
    lead,
    bullets,
    bulletsClassName,
    secondary,
    footnote,
    decor,
    children,
}: MarketingPageProps) {
    return (
        // `justify-center-safe`, not `justify-center`: on a short window this
        // block is taller than the viewport, and plain centering overflows the
        // top of the scroll container — the badge ends up behind the header
        // with no way to scroll up to it. Safe alignment falls back to
        // flex-start exactly in that case.
        <main className="relative flex w-full flex-1 flex-col items-center overflow-hidden md:min-h-0 md:justify-center-safe md:overflow-y-auto">
            {decor}
            <Entrance className="z-1 flex w-full flex-col items-center px-5 pt-4 pb-11 text-center sm:px-6 md:pt-5 md:pb-16">
                    <Badge
                    variant="secondary"
                    className={cn(
                        "h-auto rounded-full border-primary bg-primary/10 px-3.5 py-1.5 text-xs md:text-sm",
                        badgeClassName
                    )}
                >
                    {badge}
                </Badge>

                <h1 className="mt-3.5 font-heading text-3xl leading-[1.08] font-extrabold tracking-tight text-balance md:mt-5 md:text-5xl">
                    {title}
                </h1>

                <p className="mt-2.5 max-w-130 text-sm leading-relaxed text-pretty text-muted-foreground md:mt-4 md:text-lg">
                    {lead}
                </p>

                <div className="mt-5.5 grid w-full max-w-205 gap-3 md:mt-9.5 md:grid-cols-3 md:gap-4.5">
                    {children}
                </div>

                <Bullets items={bullets} className={bulletsClassName} />

                <div className="mt-4.5 flex w-full flex-col items-center gap-2.5 md:mt-7 md:w-auto md:flex-row md:gap-3.5">
                    <Tap className="w-full md:w-auto">
                        <Link
                            href="/"
                            className={buttonVariants({ size: "lg", className: "w-full md:w-auto" })}
                        >
                            Espremer um vídeo
                        </Link>
                    </Tap>
                    <Link
                        href={secondary.href}
                        className={buttonVariants({ variant: "link", size: "sm" })}
                    >
                        {secondary.label}
                    </Link>
                </div>

                {footnote && (
                    <div className="mt-3 flex flex-col gap-1 font-mono text-2xs text-muted-foreground md:mt-4.5 md:text-xs">
                        {footnote}
                    </div>
                )}
            </Entrance>
        </main>
    )
}
