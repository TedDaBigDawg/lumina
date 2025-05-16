import { PrismaClient } from "@prisma/client"
import { logError } from "./error-utils"

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") global.prisma = prisma

// Helper function to safely execute database operations with proper error handling
export async function executeDbOperation<T>(
  operation: () => Promise<T>,
  errorContext: string,
): Promise<[T | null, Error | null]> {
  try {
    const result = await operation()
    return [result, null]
  } catch (error) {
    logError(error, errorContext)
    return [null, error instanceof Error ? error : new Error(String(error))]
  }
}

// Function to handle database connection issues
export async function checkDbConnection(): Promise<boolean> {
  try {
    // Simple query to check if the database is accessible
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    logError(error, "DATABASE_CONNECTION_CHECK")
    return false
  }
}

