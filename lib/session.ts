import { authClient } from "./auth";

// Checks if the user has session.
// If not, creates an anonymous one.
export async function ensureSession() {
    const { data } = await authClient.getSession()
    if (data?.session) return data
    const { data: anonymous } = await authClient.signIn.anonymous()
    return anonymous
}