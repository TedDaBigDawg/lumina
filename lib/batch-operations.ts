import { prisma } from "@/lib/db"
import type { PrismaClient } from "@prisma/client"

/**
 * Utility for performing batch operations on the database
 */
export class BatchOperations {
  private operations: Array<() => Promise<any>> = []
  private prismaClient: PrismaClient

  constructor(prismaClient: PrismaClient = prisma) {
    this.prismaClient = prismaClient
  }

  /**
   * Add an operation to the batch
   * @param operation Function that returns a promise
   */
  add(operation: () => Promise<any>): void {
    this.operations.push(operation)
  }

  /**
   * Execute all operations in the batch
   * @param options Configuration options
   * @returns Results of all operations
   */
  async execute(
    options: {
      concurrency?: number
      stopOnError?: boolean
      transaction?: boolean
    } = {},
  ): Promise<any[]> {
    const { concurrency = 5, stopOnError = true, transaction = false } = options

    if (transaction) {
      return this.prismaClient.$transaction(this.operations.map((op) => op()))
    }

    if (concurrency <= 0) {
      throw new Error("Concurrency must be greater than 0")
    }

    const results: any[] = []
    const errors: Error[] = []

    // Process operations in batches based on concurrency
    for (let i = 0; i < this.operations.length; i += concurrency) {
      const batch = this.operations.slice(i, i + concurrency)

      try {
        const batchResults = await Promise.all(
          batch.map(async (op, index) => {
            try {
              return await op()
            } catch (error) {
              if (stopOnError) {
                throw error
              }
              errors.push(error as Error)
              return null
            }
          }),
        )

        results.push(...batchResults)
      } catch (error) {
        if (stopOnError) {
          throw error
        }
        errors.push(error as Error)
      }
    }

    if (errors.length > 0 && !stopOnError) {
      console.error(`Batch operations completed with ${errors.length} errors:`, errors)
    }

    return results
  }

  /**
   * Clear all operations from the batch
   */
  clear(): void {
    this.operations = []
  }

  /**
   * Get the number of operations in the batch
   */
  get size(): number {
    return this.operations.length
  }
}

/**
 * Create a new batch operations instance
 */
export function createBatch(prismaClient?: PrismaClient): BatchOperations {
  return new BatchOperations(prismaClient)
}

