import type { z } from "zod"

type ErrorContext =
  | "AUTH"
  | "DATABASE"
  | "API"
  | "SERVER_ACTION"
  | "PAYMENT"
  | "VALIDATION"
  | "LOGIN"
  | "REGISTER"
  | "GET_SESSION"
  | "GET_USER_PROFILE"
  | "UPDATE_USER_PROFILE"
  | "CREATE_MASS_INTENTION"
  | "UPDATE_MASS_INTENTION_STATUS"
  | "DELETE_MASS_INTENTION"
  | "LOG_ACTIVITY"
  | "GET_USER_ACTIVITIES"
  | "GET_ADMIN_ACTIVITIES"
  | "GET_SUPERADMIN_ACTIVITIES"
  | "MARK_ACTIVITY_AS_READ"
  | "MARK_ALL_ACTIVITIES_AS_READ"
  | "GET_UNREAD_ACTIVITIES_COUNT"
  | "GET_SYSTEM_STATS"
  | "GET_CHURCH_INFO"
  | "UPDATE_CHURCH_INFO"
  | "GET_CHURCH_SERVICES"
  | "CREATE_CHURCH_SERVICE"
  | "UPDATE_CHURCH_SERVICE"
  | "DELETE_CHURCH_SERVICE"
  | "CREATE_ADMIN"
  | "UPDATE_ADMIN"
  | "DELETE_ADMIN"
  | "RESET_ADMIN_PASSWORD"
  | "MIDDLEWARE"
  | "WEBSOCKET"
  | "CACHE"
  | "BATCH_OPERATION"
  | string

/**
 * Logs an error with context
 * @param error The error object
 * @param context The context in which the error occurred
 */
export function logError(error: unknown, context: ErrorContext): void {
  const timestamp = new Date().toISOString()
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : "No stack trace available"
  const errorName = error instanceof Error ? error.name : "Unknown Error"

  // Include request information if available
  let requestInfo = ""
  if (typeof window === "undefined" && global.requestContext) {
    const { url, method, ip } = global.requestContext
    requestInfo = `\nRequest: ${method} ${url}\nIP: ${ip}`
  }

  // Format the error message for console
  const formattedError = `
[${timestamp}] ERROR in ${context}:
${errorName}: ${errorMessage}
${errorStack}${requestInfo}
  `.trim()

  // Log to console in development
  console.error(formattedError)

  // In production, you might want to log to a service like Sentry
  if (process.env.NODE_ENV === "production") {
    // Implement production logging here
    // e.g., Sentry.captureException(error, { tags: { context } })

    // Also log to server logs or database for persistent error tracking
    logErrorToDatabase(error, context, timestamp).catch((e) => console.error("Failed to log error to database:", e))
  }
}

/**
 * Log error to database for persistent tracking
 * This is a placeholder function - in a real app, implement actual database logging
 */
async function logErrorToDatabase(error: unknown, context: string, timestamp: string): Promise<void> {
  // In a real implementation, you would log to your database
  // For example:
  /*
  await prisma.errorLog.create({
    data: {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      context,
      timestamp: new Date(timestamp),
    },
  })
  */
}

// Add this function to sanitize strings
function sanitizeString(str: string): string {
  if (!str) return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Handles Zod validation errors
 * @param error The Zod error object
 * @returns A formatted error object
 */
export function handleZodError(error: z.ZodError) {
  // Get the first error message
  const firstError = error.errors[0]

  // Format the error path for better readability
  const path = firstError.path.join(".")
  const fieldName = path.split(".").pop() || path

  // Format the field name for display (convert camelCase to Title Case)
  const formattedFieldName = fieldName.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())

  // Sanitize the error message
  const sanitizedMessage = sanitizeString(firstError.message)

  return {
    field: fieldName,
    message: `${formattedFieldName}: ${sanitizedMessage}`,
    errors: error.errors,
  }
}

/**
 * Creates a standardized API error response
 * @param message The error message
 * @param status The HTTP status code
 * @param details Additional error details
 * @returns A formatted error object
 */
export function createErrorResponse(message: string, status = 500, details?: Record<string, any>) {
  return {
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
    },
  }
}

/**
 * Safely parses JSON with error handling
 * @param jsonString The JSON string to parse
 * @returns The parsed object or null if parsing fails
 */
export function safeJsonParse<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    logError(error, "JSON_PARSE")
    return null
  }
}

/**
 * Handles errors in async functions
 * @param fn The async function to execute
 * @param errorHandler The error handler function
 * @returns The result of the function or the error handler
 */
export async function tryCatch<T, E = Error>(fn: () => Promise<T>, errorHandler: (error: E) => T): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    return errorHandler(error as E)
  }
}

/**
 * Groups related errors for better reporting
 * @param errors Array of errors
 * @returns Grouped errors by type
 */
export function groupErrors(errors: Error[]): Record<string, number> {
  return errors.reduce(
    (acc, error) => {
      const errorType = error.name || "Unknown"
      acc[errorType] = (acc[errorType] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
}

/**
 * Formats validation errors for API responses
 * @param errors Object containing validation errors
 * @returns Formatted validation errors
 */
export function formatValidationErrors(errors: Record<string, string[]>): Record<string, string> {
  return Object.entries(errors).reduce(
    (acc, [field, messages]) => {
      acc[field] = messages[0] // Take the first error message for each field
      return acc
    },
    {} as Record<string, string>,
  )
}

