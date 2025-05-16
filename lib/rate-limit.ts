import { Redis } from "@upstash/redis"
import { logError } from "./error-utils"

// Update Redis client initialization to better handle missing credentials
let redis: Redis | null = null
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
} catch (error) {
  console.error("Failed to initialize Redis client:", error)
  redis = null
}

// Interface for rate limit options
interface RateLimitOptions {
  limit: number
  window: number // in seconds
}

// Function to check if a request is rate limited
export async function isRateLimited(
  key: string,
  options: RateLimitOptions,
): Promise<{ limited: boolean; remaining: number; reset: number }> {
  if (!redis) {
    // If Redis is not available, implement a simple in-memory rate limiter
    return inMemoryRateLimit(key, options)
  }

  try {
    const now = Math.floor(Date.now() / 1000)
    const windowStart = now - (now % options.window)
    const windowEnd = windowStart + options.window
    const rateLimitKey = `ratelimit:${key}:${windowStart}`

    // Use Redis pipeline for better performance
    const pipeline = redis.pipeline()
    pipeline.incr(rateLimitKey)
    pipeline.ttl(rateLimitKey)
    const [countResult, ttlResult] = await pipeline.exec()

    const count = countResult as number
    const ttl = ttlResult as number

    // Set the expiry for the counter if it's new
    if (ttl === -1) {
      await redis.expire(rateLimitKey, options.window)
    }

    const remaining = Math.max(0, options.limit - count)
    const limited = count > options.limit

    return {
      limited,
      remaining,
      reset: windowEnd,
    }
  } catch (error) {
    logError(error, "RATE_LIMIT_CHECK")
    // If there's an error, don't rate limit
    return { limited: false, remaining: options.limit, reset: 0 }
  }
}

// Add a simple in-memory rate limiter as fallback
const inMemoryLimits = new Map<string, { count: number; reset: number }>()

function inMemoryRateLimit(
  key: string,
  options: RateLimitOptions,
): { limited: boolean; remaining: number; reset: number } {
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - (now % options.window)
  const windowEnd = windowStart + options.window
  const rateLimitKey = `ratelimit:${key}:${windowStart}`

  // Clean up expired entries
  for (const [k, v] of inMemoryLimits.entries()) {
    if (v.reset < now) {
      inMemoryLimits.delete(k)
    }
  }

  // Get or create limit entry
  let limitEntry = inMemoryLimits.get(rateLimitKey)
  if (!limitEntry) {
    limitEntry = { count: 0, reset: windowEnd }
    inMemoryLimits.set(rateLimitKey, limitEntry)
  }

  // Increment count
  limitEntry.count++

  const remaining = Math.max(0, options.limit - limitEntry.count)
  const limited = limitEntry.count > options.limit

  return {
    limited,
    remaining,
    reset: windowEnd,
  }
}

// Middleware for rate limiting API routes
export async function rateLimitMiddleware(
  req: Request,
  options: RateLimitOptions & { identifierFn?: (req: Request) => string },
): Promise<Response | null> {
  try {
    // Get the identifier for this request (default to IP address)
    const identifier = options.identifierFn
      ? options.identifierFn(req)
      : req.headers.get("x-forwarded-for") || "unknown"

    const { limited, remaining, reset } = await isRateLimited(identifier, options)

    if (limited) {
      return new Response(
        JSON.stringify({
          error: "Too many requests",
          message: "You have exceeded the rate limit",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": options.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      )
    }

    // Not rate limited, continue with the request
    return null
  } catch (error) {
    logError(error, "RATE_LIMIT_MIDDLEWARE")
    // If there's an error, don't rate limit
    return null
  }
}

