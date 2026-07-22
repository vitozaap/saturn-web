import 'server-only'

import { createAuthClient } from "better-auth/client";
import { anonymousClient } from "better-auth/client/plugins";
import { headers } from "next/headers";
import { cache } from "react";


const authServer = createAuthClient({
    plugins: [anonymousClient()],
    baseURL: process.env.API_URL
})

export const getSession = cache(async () => await authServer.getSession({
    fetchOptions: {
        headers: await headers()
    }
})
)