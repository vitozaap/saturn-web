import "server-only"
import { cookies } from "next/headers"
import type { Compression } from "./types"
import { failure } from "./api"

// GET /compressor — lists every compression owned by the authenticated user.
// Server-only: talks to the backend directly (bypassing the web-origin rewrite)
// and forwards the better-auth session cookie manually, since server-side fetch
// has no cookie jar and `credentials: "include"` is a no-op here.
export async function listCompressions(): Promise<Compression[]> {
    const cookie = (await cookies()).toString()
    const res = await fetch(`${process.env.API_URL}/compressor`, {
        method: "GET",
        headers: { cookie },
        cache: "no-store",
    })
    if (!res.ok) throw await failure(res, "Falha ao carregar o histórico.")
    return res.json()
}
