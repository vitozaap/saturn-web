import { authClient } from "./auth";

// Checks if the user has session.
// If not, creates an anonymous one.
export async function ensureSession() {
    const { data, error: getSessionError } = await authClient.getSession()
    if (data?.session) return data
    const { data: anonymous, error } = await authClient.signIn.anonymous()
    if (error || getSessionError) {
        throw new Error("Falha ao validar acesso ao servidor. Tente novamente mais tarde.")
    }
    return anonymous
}