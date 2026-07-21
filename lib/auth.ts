import { anonymousClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";


export const authClient = createAuthClient({
    plugins: [anonymousClient()],
    baseURL: process.env.API_URL
})  