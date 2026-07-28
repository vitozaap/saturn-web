import { Logo } from "./logo";
import { Skeleton } from "./ui/skeleton";

// Suspense fallback for <Header />, which awaits the session on the server.
// The brand side is rendered for real — it doesn't depend on the session, so
// showing it avoids a pointless flash. Only the session-dependent actions are
// placeholders, sized to match the default Button variant (h-10, rounded-lg)
// so swapping in <HeaderActions /> doesn't shift the layout.
export function HeaderSkeleton() {
    return (
        <header className="flex w-full py-4 px-5 sm:py-5 sm:px-9 items-center-safe justify-between">
            <div className="flex gap-2 items-center">
                <Logo className="size-8 sm:size-9.5" />
                <h1 className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight">
                    squish
                </h1>
            </div>
            <div className="hidden gap-1 items-center md:flex" role="status" aria-label="Loading">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-10 w-28 rounded-lg" />
                <Skeleton className="h-10 w-28 rounded-lg" />
                <Skeleton className="h-10 w-20 rounded-lg" />
            </div>
             <div className="flex gap-2 items-center md:hidden" role="status" aria-label="Loading">
                <Skeleton className="h-8 w-18 rounded-lg" />
                <Skeleton className="size-9 rounded-lg" />
            </div>
        </header>
    );
}
