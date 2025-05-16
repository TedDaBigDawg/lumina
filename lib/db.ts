import { PrismaClient } from "@prisma/client"
import { logError } from "./error-utils"

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

// Configure Prisma with connection pooling and logging
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // Add connection pooling configuration
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection timeout configuration is not supported directly in PrismaClient
  })

// Connection management
export async function connectToDatabase() {
  try {
    await prisma.$connect()
    return true
  } catch (error) {
    logError(error, "DATABASE_CONNECTION")
    return false
  }
}

// Graceful shutdown
export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect()
    return true
  } catch (error) {
    logError(error, "DATABASE_DISCONNECT")
    return false
  }
}

// Keep connection alive in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

