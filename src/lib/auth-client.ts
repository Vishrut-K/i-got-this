import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
})

export const { signIn, signUp, signOut, useSession } = authClient;
export const forgetPassword = (authClient as any).forgetPassword;
export const resetPassword = (authClient as any).resetPassword;
