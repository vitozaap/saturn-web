import { Compression } from "@/lib/types"
import { cn } from "@/lib/utils"
import { cva, VariantProps } from "class-variance-authority"
import { average, totalCompressed } from "./helpers"


const cardVariants = cva("flex flex-col items-center py-1.5 px-4 rounded-md border", {
    variants: {
        variant: {
            default: "bg-card dark:bg-muted [&>span]:text-muted-foreground",
            active: "border-primary/50 bg-primary/10 text-primary rotate-3 [&>span]:font-medium [&>h2]:shimmer"
        }
    },
    defaultVariants: {
        variant: "default"
    }
})

interface CardProps extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> {
    info: string | number
    caption: string
}

function Card({ info, caption, variant = "default", className, ...props }: CardProps) {
    return <div className={cn(cardVariants({ variant }))} {...props}>
        <h2 className="font-bold font-heading">{info}</h2>
        <span className="text-xs">{caption}</span>
    </div>
}

export function HistoryCards({ compressions }: { compressions: Compression[] }) {
    const total = totalCompressed(compressions)
    const percent = average(compressions)
    return (
        <div className="flex items-center gap-2 ">
            <Card info={compressions.length} caption="vídeos" />
            <Card variant={"active"} info={total} caption="comprimidos" />
            <Card info={`-${percent}%`} caption="média" />
        </div >
    )
}