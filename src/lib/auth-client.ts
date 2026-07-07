import { createAuthClient } from "better-auth/react"

import { anonymousClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: typeof window !== "undefined" ? window.location.origin : process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    plugins: [anonymousClient()]
})

export const { signIn, signUp, signOut, useSession } = authClient;

type AuthClientExt = {
    forgetPassword: (opts: { email: string; redirectTo: string }) => Promise<{ data: unknown; error: unknown }>;
    resetPassword: (opts: { newPassword: string }) => Promise<{ data: unknown; error: unknown }>;
};

export const forgetPassword = (authClient as unknown as AuthClientExt).forgetPassword;
export const resetPassword = (authClient as unknown as AuthClientExt).resetPassword;
