/**
 * ARCHITECTURE DECISION: Minimal DB Connection Test
 * - Why it exists: Provides a simple, isolated script to verify that Prisma can successfully connect to the Neon PostgreSQL database without needing a full UI or API route.
 * - Why this structure scales well: Having isolated test scripts helps pinpoint infrastructure issues quickly before they surface as cryptic UI errors.
 * - Tradeoffs: It's a manual script you have to run. For automated scaling, this logic would typically live in health check endpoints.
 * - Avoiding beginner mistakes: Beginners often try to test DB connections by building a full page, form, and server action. If it fails, they don't know if the issue is React, Next.js routing, or the database. This script strictly isolates the database layer.
 */

import { prisma } from "../lib/prisma"

export async function testDatabaseConnection() {
  try {
    console.log("Attempting to connect to Neon PostgreSQL...")
    // We execute a raw query that simply asks the database for the current time.
    // This doesn't require any tables to exist, making it the perfect initial test.
    const result = await prisma.$queryRaw`SELECT NOW()`
    
    console.log("✅ Successfully connected to the database!")
    console.log("Database time:", result)
    
    return { success: true, data: result }
  } catch (error) {
    console.error("❌ Failed to connect to the database.")
    console.error(error)
    return { success: false, error }
  }
}
