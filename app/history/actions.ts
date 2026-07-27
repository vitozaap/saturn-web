"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { failure } from "@/lib/api"


export async function deleteCompressionAction(id: string): Promise<{ error?: string }> {
    const cookie = (await cookies()).toString()
    const res = await fetch(`${process.env.API_URL}/compressor/${id}`, {
        method: "DELETE",
        headers: { cookie },
    })
    if (!res.ok) {
        if (res.status === 409) return { error: "Essa compressão ainda está sendo processada." }
        return { error: (await failure(res, "Falha ao apagar compressão.")).message }
    }
    // Re-renders the History server component, so the deleted row disappears
    // from both the table and the cards.
    revalidatePath("/history")
    return {}
}
