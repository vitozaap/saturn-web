import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

const PROTECTED = ['/history']

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const session = getSessionCookie(request)
    const protectedRoute = PROTECTED.some((route) => pathname.startsWith(route))
    if (protectedRoute && !session) {
        NextResponse.redirect(new URL("/register", request.url))
    }

    return NextResponse.next()
}

// This is an optimistic check only
export const config = {
    matcher: ['/history/:path*'],
}
