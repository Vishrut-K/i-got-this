import { createAuthClient } from "better-auth/react"

import { anonymousClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: typeof window !== "undefined" ? window.location.origin : process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    plugins: [anonymousClient()]
})

export const { signIn, signUp, signOut, useSession } = authClient;
export const forgetPassword = (authClient as any).forgetPassword;
export const resetPassword = (authClient as any).resetPassword;
