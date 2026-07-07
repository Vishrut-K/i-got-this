import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { dash } from "@better-auth/infra";
import { anonymous } from "better-auth/plugins";
import { Resend } from "resend";

// Resend initialization (API Key should be in .env)
const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [
        "http://localhost:3000",
        "https://i-got-this-tracker.vercel.app",
    ],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }
    },
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            try {
                await resend.emails.send({
                    from: "onboarding@resend.dev",
                    to: user.email,
                    subject: "Reset your I-got-this password",
                    html: `<p>Click the link below to reset your password:</p><br/><a href="${url}">Reset Password</a>`,
                });
            } catch (err) {
                console.error("Error sending reset password email:", err);
            }
        }
    },
    plugins: [dash(), anonymous()]
});
