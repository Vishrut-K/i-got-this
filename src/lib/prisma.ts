/**
 * ARCHITECTURE DECISION: Prisma Singleton Pattern
 * - Why it exists: Provides a single, reusable instance of the Prisma Client to interact with the PostgreSQL database.
 * - Why this structure scales well: In serverless environments and local development, Next.js frequently hot-reloads the code. If we instantiated `new PrismaClient()` every time a file reloaded, we would quickly exhaust our database connections. This singleton ensures only one connection pool exists.
 * - Tradeoffs: We have to attach Prisma to the global object in development, which is a slightly dirty workaround, but it's the official recommended practice by Prisma for Next.js.
 * - Avoiding beginner mistakes: Beginners often just do `export const prisma = new PrismaClient()` in random files. This leads to the dreaded "too many clients already" PostgreSQL error. This file safely prevents that.
 */

import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
  return new PrismaClient()
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
