import { auth } from "@/lib/auth"; // We are importing the blueprint we made earlier
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);