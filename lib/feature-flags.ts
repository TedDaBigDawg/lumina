"use client"

import React, { useRef } from "react"
import { logError } from "./error-utils"
import { getFromCache, setInCache } from "./cache"

// Cache time in seconds (5 minutes)
const CACHE_TIME = 300

// Interface for feature flag
export interface FeatureFlag {
  id: string
  name: string
  description: string
  enabled: boolean
  percentage: number // For percentage rollouts (0-100)
  rules: Record<string, any> // Custom rules for enabling the feature
}

// Function to check if a feature is enabled
export async function isFeatureEnabled(
  featureName: string,
  context: {
    userId?: string
    role?: string
    [key: string]: any
  } = {},
): Promise<boolean> {
  try {
    // Try to get from cache first
    const cacheKey = `feature:${featureName}`
    const cachedFeature = await getFromCache<FeatureFlag>(cacheKey)

    let feature: FeatureFlag | null = cachedFeature

    if (!feature) {
      // If not in cache, fetch from database
      // In a real application, you would have a FeatureFlag model in your Prisma schema
      // For now, we'll just return a hardcoded feature flag
      feature = {
        id: featureName,
        name: featureName,
        description: `Feature flag for ${featureName}`,
        enabled: true,
        percentage: 100,
        rules: {},
      }

      // Store in cache for future use
      await setInCache(cacheKey, feature, CACHE_TIME)
    }

    // If the feature is not enabled, return false
    if (!feature.enabled) {
      return false
    }

    // Check percentage rollout
    if (feature.percentage < 100) {
      // Use userId for consistent rollout
      if (context.userId) {
        // Generate a hash of the userId + featureName
        const hash = await generateHash(context.userId + featureName)
        // Convert the hash to a number between 0 and 100
        const hashNumber = Number.parseInt(hash.substring(0, 2), 16) % 100
        // If the hash number is greater than the percentage, return false
        if (hashNumber >= feature.percentage) {
          return false
        }
      } else {
        // If no userId, use random percentage
        if (Math.random() * 100 >= feature.percentage) {
          return false
        }
      }
    }

    // Check custom rules
    if (Object.keys(feature.rules).length > 0) {
      // Implement custom rule checking logic here
      // For example, check if the user's role is in the allowed roles
      if (feature.rules.roles && context.role) {
        if (!feature.rules.roles.includes(context.role)) {
          return false
        }
      }
    }

    // If we've passed all checks, the feature is enabled
    return true
  } catch (error) {
    logError(error, "IS_FEATURE_ENABLED")
    // Default to disabled if there's an error
    return false
  }
}

// Function to generate a hash
async function generateHash(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Function to get all feature flags
export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    // In a real application, you would fetch from the database
    // For now, we'll just return hardcoded feature flags
    return [
      {
        id: "new_dashboard",
        name: "new_dashboard",
        description: "Enable the new dashboard UI",
        enabled: true,
        percentage: 100,
        rules: {},
      },
      {
        id: "websocket_notifications",
        name: "websocket_notifications",
        description: "Enable real-time notifications via WebSockets",
        enabled: true,
        percentage: 100,
        rules: {},
      },
      {
        id: "advanced_analytics",
        name: "advanced_analytics",
        description: "Enable advanced analytics features",
        enabled: true,
        percentage: 100,
        rules: {
          roles: ["ADMIN", "SUPERADMIN"],
        },
      },
    ]
  } catch (error) {
    logError(error, "GET_ALL_FEATURE_FLAGS")
    return []
  }
}

// React hook for checking if a feature is enabled
export function useFeatureFlag(featureName: string, context: Record<string, any> = {}): boolean {
  const [isEnabled, setIsEnabled] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const isMounted = useRef(true)
  const contextString = JSON.stringify(context)

  React.useEffect(() => {
    isMounted.current = true

    const checkFeature = async () => {
      if (!isMounted.current) return

      setIsLoading(true)
      try {
        const enabled = await isFeatureEnabled(featureName, context)
        if (isMounted.current) {
          setIsEnabled(enabled)
        }
      } catch (error) {
        console.error(`Error checking feature flag ${featureName}:`, error)
      } finally {
        if (isMounted.current) {
          setIsLoading(false)
        }
      }
    }

    checkFeature()

    return () => {
      isMounted.current = false
    }
  }, [featureName, contextString])

  return isEnabled
}

