"use client"

import { authClient } from "./auth"


export function useIsRegistered() {
    const { data, isPending } = authClient.useSession()
    const user = data?.user as { isAnonymous?: boolean | null } | undefined

    return {
        isRegistered: Boolean(user) && !user?.isAnonymous,
        pending: isPending,
    }
}
