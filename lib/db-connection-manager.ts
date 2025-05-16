import { PrismaClient } from "@prisma/client"
import { logError } from "./error-utils"

// Singleton class to manage database connections
class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager
  private prisma: PrismaClient
  private isConnected = false
  private connectionPromise: Promise<boolean> | null = null
  private disconnectionPromise: Promise<boolean> | null = null
  private connectionAttempts = 0
  private readonly MAX_CONNECTION_ATTEMPTS = 3

  private constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  }

  public static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager()
    }
    return DatabaseConnectionManager.instance
  }

  public getPrisma(): PrismaClient {
    return this.prisma
  }

  public isConnectedToDatabase(): boolean {
    return this.isConnected
  }

  public async connect(): Promise<boolean> {
    if (this.isConnected) {
      return true
    }

    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.connectionAttempts++

    this.connectionPromise = new Promise<boolean>(async (resolve) => {
      try {
        await this.prisma.$connect()
        this.isConnected = true
        this.connectionAttempts = 0
        resolve(true)
      } catch (error) {
        logError(error, "DATABASE_CONNECTION")

        if (this.connectionAttempts < this.MAX_CONNECTION_ATTEMPTS) {
          // Retry connection with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts), 10000)
          setTimeout(async () => {
            this.connectionPromise = null
            resolve(await this.connect())
          }, delay)
        } else {
          this.connectionAttempts = 0
          resolve(false)
        }
      } finally {
        this.connectionPromise = null
      }
    })

    return this.connectionPromise
  }

  public async disconnect(): Promise<boolean> {
    if (!this.isConnected) {
      return true
    }

    if (this.disconnectionPromise) {
      return this.disconnectionPromise
    }

    this.disconnectionPromise = new Promise<boolean>(async (resolve) => {
      try {
        await this.prisma.$disconnect()
        this.isConnected = false
        resolve(true)
      } catch (error) {
        logError(error, "DATABASE_DISCONNECTION")
        resolve(false)
      } finally {
        this.disconnectionPromise = null
      }
    })

    return this.disconnectionPromise
  }

  public async executeWithConnection<T>(operation: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    const wasConnected = this.isConnected

    if (!wasConnected) {
      await this.connect()
    }

    try {
      return await operation(this.prisma)
    } finally {
      if (!wasConnected) {
        await this.disconnect()
      }
    }
  }
}

// Export the singleton instance
export const dbManager = DatabaseConnectionManager.getInstance()

// Export the Prisma client for convenience
export const prisma = dbManager.getPrisma()

