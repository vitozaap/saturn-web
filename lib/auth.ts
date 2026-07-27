import { anonymousClient } from "better-auth/client/plugins";
// "better-auth/react", not "better-auth/client": same client, plus the React
// hooks (authClient.useSession) the client components need.
import { createAuthClient } from "better-auth/react";


export const authClient = createAuthClient({
    plugins: [anonymousClient()],
})  