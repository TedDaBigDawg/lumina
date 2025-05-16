"use client"

import { useState, useEffect, useRef, useCallback } from "react"

// Type for the return value of our custom hook
export type UseDataFetchingResponse<Data, Error = unknown> = {
  data: Data | undefined
  error: Error | null
  isLoading: boolean
  isValidating: boolean
  mutate: (newData?: Data | ((currentData: Data | undefined) => Data)) => void
  refresh: () => Promise<void>
}

// Options for the useDataFetching hook
export interface UseDataFetchingOptions<Data> {
  initialData?: Data
  refreshInterval?: number
  dedupingInterval?: number
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
  onSuccess?: (data: Data) => void
  onError?: (error: unknown) => void
  headers?: HeadersInit
  method?: string
  body?: BodyInit | null
  cache?: RequestCache
  credentials?: RequestCredentials
  keepPreviousData?: boolean
  retry?: number | boolean
  retryDelay?: number | ((retryCount: number) => number)
  suspense?: boolean
}

// Custom hook for data fetching with proper state management and performance optimizations
export function useDataFetching<Data = any, Error = unknown>(
  url: string | null,
  options: UseDataFetchingOptions<Data> = {},
): UseDataFetchingResponse<Data, Error> {
  // State for data, error, loading, and validating
  const [data, setData] = useState<Data | undefined>(options.initialData)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(!options.initialData)
  const [isValidating, setIsValidating] = useState<boolean>(false)

  // Refs for tracking component mount state, fetch time, and intervals
  const isMounted = useRef(true)
  const lastFetchTime = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const controller = useRef<AbortController | null>(null)
  const retryCount = useRef<number>(0)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dataRef = useRef<Data | undefined>(options.initialData)

  // Cache for storing fetched data
  const cache = useRef<Map<string, { data: Data; timestamp: number }>>(new Map())

  // Default options
  const {
    refreshInterval,
    dedupingInterval = 2000, // Default deduping interval of 2 seconds
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    onSuccess,
    onError,
    headers,
    method = "GET",
    body = null,
    cache: cacheOption,
    credentials,
    keepPreviousData = true,
    retry = 3,
    retryDelay = (count: number) => Math.min(1000 * 2 ** count, 30000), // Exponential backoff
    suspense = false,
  } = options

  // Update dataRef when data changes
  useEffect(() => {
    dataRef.current = data
  }, [data])

  // Function to determine if we should retry
  const shouldRetry = useCallback(
    (attemptCount: number): boolean => {
      if (typeof retry === "boolean") return retry
      if (typeof retry === "number") return attemptCount < retry
      return false
    },
    [retry],
  )

  // Function to calculate retry delay
  const getRetryDelay = useCallback(
    (attemptCount: number): number => {
      if (typeof retryDelay === "function") return retryDelay(attemptCount)
      return retryDelay
    },
    [retryDelay],
  )

  // Create stable fetch function with optimizations
  const fetchData = useCallback(
    async (shouldSetLoading = true, isRetry = false) => {
      if (!url) return

      // Check deduping interval to prevent duplicate requests
      const now = Date.now()
      if (!isRetry && dedupingInterval && now - lastFetchTime.current < dedupingInterval) {
        return
      }

      // Check cache first
      const cacheKey = `${url}:${method}:${body ? JSON.stringify(body) : ""}`
      const cachedData = cache.current.get(cacheKey)

      if (cachedData && now - cachedData.timestamp < 30000) {
        // 30 seconds cache
        if (isMounted.current) {
          setData(cachedData.data)
          setError(null)
          setIsLoading(false)
          setIsValidating(false)
        }
        return
      }

      // Abort previous request if it exists
      if (controller.current) {
        controller.current.abort()
      }

      // Create new abort controller
      controller.current = new AbortController()

      // Set loading state if needed
      if (shouldSetLoading && (!keepPreviousData || !dataRef.current)) {
        setIsLoading(true)
      }

      setIsValidating(true)
      setError(null)

      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body,
          cache: cacheOption,
          credentials,
          signal: controller.current.signal,
          // Add priority for important requests
          ...(method === "GET" && { priority: "high" }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const result = await response.json()

        if (isMounted.current) {
          setData(result)
          setError(null)
          setIsLoading(false)
          setIsValidating(false)
          lastFetchTime.current = now
          retryCount.current = 0 // Reset retry count on success

          // Update cache
          cache.current.set(cacheKey, { data: result, timestamp: now })

          if (onSuccess) {
            onSuccess(result)
          }
        }
      } catch (err) {
        if (err.name === "AbortError") {
          // Request was aborted, do nothing
          return
        }

        if (isMounted.current) {
          // Only set error if not retrying or if we've exhausted retries
          if (!shouldRetry(retryCount.current)) {
            setError(err as Error)
            setIsLoading(false)
            setIsValidating(false)

            if (onError) {
              onError(err)
            }
          } else {
            // Retry the request
            retryCount.current += 1
            const delay = getRetryDelay(retryCount.current)

            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current)
            }

            retryTimeoutRef.current = setTimeout(() => {
              if (isMounted.current) {
                fetchData(shouldSetLoading, true)
              }
            }, delay)
          }
        }
      } finally {
        if (controller.current?.signal.aborted) {
          controller.current = null
        }
      }
    },
    [
      url,
      keepPreviousData,
      dedupingInterval,
      method,
      headers,
      body,
      cacheOption,
      credentials,
      onSuccess,
      onError,
      shouldRetry,
      getRetryDelay,
    ],
  )

  // Function to manually refresh data
  const refresh = useCallback(async () => {
    retryCount.current = 0 // Reset retry count on manual refresh
    await fetchData(true, false)
  }, [fetchData])

  // Function to manually update data
  const mutate = useCallback(
    (newData?: Data | ((currentData: Data | undefined) => Data)) => {
      if (typeof newData === "function") {
        // If newData is a function, call it with the current data
        const updaterFn = newData as (currentData: Data | undefined) => Data
        setData((prevData) => {
          const updatedData = updaterFn(prevData)
          // Update cache with the new data
          if (url) {
            const cacheKey = `${url}:${method}:${body ? JSON.stringify(body) : ""}`
            cache.current.set(cacheKey, { data: updatedData, timestamp: Date.now() })
          }
          return updatedData
        })
      } else if (newData !== undefined) {
        // If newData is provided, update the data
        setData(newData)
        // Update cache with the new data
        if (url) {
          const cacheKey = `${url}:${method}:${body ? JSON.stringify(body) : ""}`
          cache.current.set(cacheKey, { data: newData, timestamp: Date.now() })
        }
      } else {
        // If no newData is provided, refresh the data
        refresh()
      }
    },
    [refresh, url, method, body],
  )

  // Set up initial fetch and polling
  useEffect(() => {
    isMounted.current = true

    if (url) {
      fetchData()

      // Set up polling if refreshInterval is provided
      if (refreshInterval && refreshInterval > 0) {
        intervalRef.current = setInterval(() => {
          if (isMounted.current && document.visibilityState !== "hidden") {
            fetchData(false)
          }
        }, refreshInterval)
      }
    }

    return () => {
      isMounted.current = false

      // Clean up intervals and timeouts
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }

      // Abort any in-flight requests
      if (controller.current) {
        controller.current.abort()
        controller.current = null
      }
    }
  }, [url, fetchData, refreshInterval])

  // Set up revalidation on focus
  useEffect(() => {
    if (!revalidateOnFocus) return

    const onFocus = () => {
      if (isMounted.current) {
        fetchData(false)
      }
    }

    window.addEventListener("focus", onFocus)

    return () => {
      window.removeEventListener("focus", onFocus)
    }
  }, [fetchData, revalidateOnFocus])

  // Set up revalidation on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return

    const onOnline = () => {
      if (isMounted.current) {
        fetchData(false)
      }
    }

    window.addEventListener("online", onOnline)

    return () => {
      window.removeEventListener("online", onOnline)
    }
  }, [fetchData, revalidateOnReconnect])

  // Set up visibility change handling to pause polling when tab is not visible
  useEffect(() => {
    if (!refreshInterval) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isMounted.current) {
        fetchData(false)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [fetchData, refreshInterval])

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    refresh,
  }
}

// Hook for optimistic mutations
export function useOptimisticMutation<Data = any, Variables = any>(
  url: string,
  options: {
    onSuccess?: (data: Data, variables: Variables) => void
    onError?: (error: unknown, variables: Variables) => void
    onSettled?: (data: Data | undefined, error: unknown | null, variables: Variables) => void
    rollbackOnError?: boolean
    headers?: HeadersInit
    method?: string
  } = {},
) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<unknown | null>(null)
  const [data, setData] = useState<Data | undefined>(undefined)
  const isMounted = useRef(true)
  const previousDataRef = useRef<Data | undefined>(undefined)
  const controller = useRef<AbortController | null>(null)

  const { onSuccess, onError, onSettled, rollbackOnError = true, headers, method = "POST" } = options

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if (controller.current) {
        controller.current.abort()
      }
    }
  }, [])

  const mutate = async (
    variables: Variables,
    optimisticUpdate?: (currentData: Data | undefined) => Data,
  ): Promise<Data | undefined> => {
    if (isMounted.current) {
      setIsSubmitting(true)
      setError(null)
    }

    // Abort previous request if it exists
    if (controller.current) {
      controller.current.abort()
    }

    // Create new abort controller
    controller.current = new AbortController()

    // Store previous data for rollback
    previousDataRef.current = data

    try {
      // Apply optimistic update if provided
      if (optimisticUpdate && data !== undefined) {
        const optimisticData = optimisticUpdate(data)
        setData(optimisticData)
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(variables),
        signal: controller.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `HTTP error! Status: ${response.status}`)
      }

      const result = await response.json()

      if (isMounted.current) {
        setData(result)
        setError(null)

        if (onSuccess) {
          onSuccess(result, variables)
        }
      }

      if (isMounted.current && onSettled) {
        onSettled(result, null, variables)
      }

      return result
    } catch (err) {
      if (err.name === "AbortError") {
        // Request was aborted, do nothing
        return undefined
      }

      if (isMounted.current) {
        setError(err)

        // Rollback to previous data if needed
        if (rollbackOnError && previousDataRef.current !== undefined) {
          setData(previousDataRef.current)
        }

        if (onError) {
          onError(err, variables)
        }
      }

      if (isMounted.current && onSettled) {
        onSettled(undefined, err, variables)
      }

      throw err
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false)
      }
      controller.current = null
    }
  }

  return {
    mutate,
    isSubmitting,
    error,
    data,
    reset: () => {
      setData(undefined)
      setError(null)
      setIsSubmitting(false)
    },
  }
}

