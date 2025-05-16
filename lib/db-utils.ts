import { PrismaClient } from "@prisma/client"
import { logError } from "./error-utils"
import { cache } from "react"

/**
 * Execute a database operation with proper error handling
 * @param operation The database operation to execute
 * @param context A string identifying the context of the operation for error logging
 * @returns A tuple with the result and error (if any)
 */
export async function executeDbOperation<T>(
  operation: () => Promise<T>,
  context: string,
): Promise<[T | null, Error | null]> {
  try {
    const result = await operation()
    return [result, null]
  } catch (error) {
    logError(error, context)
    return [null, error instanceof Error ? error : new Error(String(error))]
  }
}

/**
 * Handles database errors and returns appropriate error messages
 * @param error The error object
 * @returns A user-friendly error message
 */
export function handleDbError(error: unknown): string {
  if (!error) return "An unknown database error occurred"

  // Convert error to string for analysis
  const errorString = String(error)

  // Handle Prisma-specific errors
  if (errorString.includes("P2002")) {
    return "A record with this information already exists"
  }

  if (errorString.includes("P2003")) {
    return "This operation references a record that doesn't exist"
  }

  if (errorString.includes("P2025")) {
    return "Record not found"
  }

  if (errorString.includes("P2016") || errorString.includes("P2017")) {
    return "Required relation not found"
  }

  // Handle connection errors
  if (errorString.includes("connection") || errorString.includes("timeout") || errorString.includes("ECONNREFUSED")) {
    return "Database connection error. Please try again later"
  }

  // Handle constraint violations
  if (errorString.includes("constraint")) {
    return "This operation violates database constraints"
  }

  // Default error message
  return "An error occurred while accessing the database"
}

/**
 * Checks if a record exists in the database (cached for performance)
 * @param model The model to check
 * @param where The where condition
 * @returns Boolean indicating if the record exists
 */
export const recordExists = cache(async <T extends keyof PrismaClient>(model: T, where: any): Promise<boolean> => {
  try {
    const prisma = new PrismaClient()
    // @ts-ignore - Dynamic access to Prisma models
    const count = await prisma[model].count({ where })
    await prisma.$disconnect()
    return count > 0
  } catch (error) {
    logError(error, `CHECK_RECORD_EXISTS_${String(model).toUpperCase()}`)
    return false
  }
})

/**
 * Batch database operations for better performance
 * @param operations Array of database operations to execute
 * @param batchSize Size of each batch
 * @returns Results of all operations
 */
export async function batchDbOperations<T>(operations: Array<() => Promise<T>>, batchSize = 10): Promise<T[]> {
  const results: T[] = []

  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map((op) => op()))
    results.push(...batchResults)
  }

  return results
}

/**
 * Execute a database transaction with proper error handling
 * @param operations Array of operations to execute in a transaction
 * @param context A string identifying the context of the transaction for error logging
 * @returns A tuple with the results and error (if any)
 */
export async function executeDbTransaction<T>(
  operations: Array<() => Promise<T>>,
  context: string,
): Promise<[T[] | null, Error | null]> {
  const prisma = new PrismaClient()

  try {
    const results = await prisma.$transaction(operations.map((op) => op()))

    return [results, null]
  } catch (error) {
    logError(error, `TRANSACTION_${context}`)
    return [null, error instanceof Error ? error : new Error(String(error))]
  } finally {
    await prisma.$disconnect()
  }
}

