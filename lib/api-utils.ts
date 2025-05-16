import { NextResponse } from "next/server"
import { logError } from "./error-utils"

type ApiResponse<T> = {
  data?: T
  error?: string
  message?: string
  statusCode: number
}

/**
 * Creates a standardized API response
 */
export function createApiResponse<T>(options: {
  data?: T
  error?: string | Error
  message?: string
  statusCode?: number
}): NextResponse {
  const { data, error, message, statusCode = 200 } = options

  // Sanitize error messages for production
  let errorMessage = error instanceof Error ? error.message : (error as string)

  // In production, don't expose detailed error messages
  if (process.env.NODE_ENV === "production" && statusCode >= 500) {
    errorMessage = "An unexpected error occurred. Please try again later."
  }

  const response: ApiResponse<T> = {
    statusCode,
    ...(data && { data }),
    ...(message && { message }),
    ...(errorMessage && { error: errorMessage }),
  }

  // Log server errors
  if (statusCode >= 500) {
    logError(error, "API_RESPONSE")
  }

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Wraps an API handler with error handling
 */
export function withErrorHandling<T>(handler: () => Promise<T>, errorStatusCode = 500): Promise<NextResponse> {
  return handler()
    .then((data) => createApiResponse({ data, statusCode: 200 }))
    .catch((error) => {
      logError(error, "API_HANDLER")
      return createApiResponse({
        error,
        statusCode: errorStatusCode,
        message: "An error occurred while processing your request",
      })
    })
}

/**
 * Validates request data against a schema
 */
export function validateRequestData<T>(
  data: unknown,
  validator: (data: unknown) => { success: boolean; error?: any; data?: T },
): { isValid: boolean; data?: T; error?: string } {
  const result = validator(data)

  if (!result.success) {
    return {
      isValid: false,
      error: result.error?.message || "Invalid request data",
    }
  }

  return {
    isValid: true,
    data: result.data,
  }
}

