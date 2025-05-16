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

// Default TTL in seconds (1 hour)
const DEFAULT_TTL = 3600

// Check if Redis is available
export const isCacheAvailable = !!redis

// Memory cache for fallback when Redis is unavailable
const memoryCache = new Map<string, { value: any; expiry: number }>()

/**
 * Get a value from the cache
 * @param key Cache key
 * @returns Cached value or null if not found
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    if (redis) {
      // Try Redis first
      const value = await redis.get(key)
      return value as T
    } else {
      // Fall back to memory cache
      const cached = memoryCache.get(key)
      if (cached && cached.expiry > Date.now()) {
        return cached.value as T
      }
      return null
    }
  } catch (error) {
    logError(error, "CACHE_GET")
    // If Redis fails, try memory cache as fallback
    const cached = memoryCache.get(key)
    if (cached && cached.expiry > Date.now()) {
      return cached.value as T
    }
    return null
  }
}

/**
 * Set a value in the cache
 * @param key Cache key
 * @param value Value to cache
 * @param ttl Time to live in seconds
 * @returns Success status
 */
export async function setInCache(key: string, value: any, ttl: number = DEFAULT_TTL): Promise<boolean> {
  try {
    if (redis) {
      // Try Redis first
      await redis.set(key, value, { ex: ttl })
    }

    // Always update memory cache as fallback
    memoryCache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    })

    return true
  } catch (error) {
    logError(error, "CACHE_SET")

    // If Redis fails, still update memory cache
    memoryCache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    })

    return true
  }
}

/**
 * Delete a value from the cache
 * @param key Cache key
 * @returns Success status
 */
export async function deleteFromCache(key: string): Promise<boolean> {
  try {
    if (redis) {
      // Try Redis first
      await redis.del(key)
    }

    // Always update memory cache
    memoryCache.delete(key)

    return true
  } catch (error) {
    logError(error, "CACHE_DELETE")

    // If Redis fails, still update memory cache
    memoryCache.delete(key)

    return true
  }
}

/**
 * Delete multiple values from the cache using a pattern
 * @param pattern Key pattern
 * @returns Success status
 */
export async function deleteByPattern(pattern: string): Promise<boolean> {
  try {
    if (redis) {
      // Try Redis first
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    }

    // For memory cache, use regex to match pattern
    const regex = new RegExp(pattern.replace("*", ".*"))
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key)
      }
    }

    return true
  } catch (error) {
    logError(error, "CACHE_DELETE_PATTERN")

    // If Redis fails, still update memory cache
    const regex = new RegExp(pattern.replace("*", ".*"))
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key)
      }
    }

    return true
  }
}

/**
 * Cache wrapper for async functions
 * @param key Cache key
 * @param fn Function to execute if cache miss
 * @param ttl Time to live in seconds
 * @returns Function result
 */
export async function cachedFunction<T>(key: string, fn: () => Promise<T>, ttl: number = DEFAULT_TTL): Promise<T> {
  try {
    // Try to get from cache first
    const cached = await getFromCache<T>(key)
    if (cached !== null) {
      return cached
    }

    // If not in cache, execute the function
    const result = await fn()

    // Store in cache for future use
    await setInCache(key, result, ttl)

    return result
  } catch (error) {
    logError(error, "CACHED_FUNCTION")
    // If there's an error with the cache, just execute the function
    return fn()
  }
}

/**
 * Clear all cache entries
 * @returns Success status
 */
export async function clearCache(): Promise<boolean> {
  try {
    if (redis) {
      // Clear Redis cache
      await redis.flushall()
    }

    // Clear memory cache
    memoryCache.clear()

    return true
  } catch (error) {
    logError(error, "CACHE_CLEAR")

    // If Redis fails, still clear memory cache
    memoryCache.clear()

    return false
  }
}

/**
 * Get cache health status
 * @returns Cache health information
 */
export async function getCacheHealth(): Promise<{ available: boolean; type: string; size?: number }> {
  if (redis) {
    try {
      // Test Redis connection
      await redis.ping()

      // Get cache info
      const info = await redis.info()

      return {
        available: true,
        type: "Redis",
        size: info.includes("keys=") ? Number.parseInt(info.split("keys=")[1]) : undefined,
      }
    } catch (error) {
      logError(error, "CACHE_HEALTH_CHECK")

      // Fall back to memory cache info
      return {
        available: true,
        type: "Memory",
        size: memoryCache.size,
      }
    }
  } else {
    // Only memory cache is available
    return {
      available: true,
      type: "Memory",
      size: memoryCache.size,
    }
  }
}

