"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <main className="flex flex-col flex-1 w-full mt-6 sm:mt-12 items-center">
            <div className="flex flex-col gap-4 w-full max-w-110 px-5 pb-8 sm:px-0">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Algo quebrou por aqui</CardTitle>
                        <CardDescription>
                            Não foi você. Tente de novo — se continuar, recarregue a página.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button size={"lg"} className="w-full" onClick={reset}>Tentar de novo</Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
