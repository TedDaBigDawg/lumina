"use client"

import { useEffect, type RefObject, useCallback } from "react"

type Event = MouseEvent | TouchEvent

/**
 * Hook to detect clicks outside of a specified element
 * @param ref Reference to the element to detect clicks outside of
 * @param handler Function to call when a click outside is detected
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void,
) {
  // Memoize the event listener to prevent unnecessary re-renders
  const memoizedHandler = useCallback(
    (event: Event) => {
      const el = ref?.current

      // Do nothing if the ref is not set or if the click is inside the element
      if (!el || el.contains((event.target as Node) || null)) {
        return
      }

      handler(event)
    },
    [ref, handler],
  )

  useEffect(() => {
    // Add event listeners
    document.addEventListener("mousedown", memoizedHandler)
    document.addEventListener("touchstart", memoizedHandler)

    // Clean up event listeners
    return () => {
      document.removeEventListener("mousedown", memoizedHandler)
      document.removeEventListener("touchstart", memoizedHandler)
    }
  }, [memoizedHandler]) // Only re-run if memoizedHandler changes
}

/**
 * Hook to detect clicks outside of multiple elements
 * @param refs Array of references to elements
 * @param handler Function to call when a click outside all elements is detected
 */
export function useClickOutsideMultiple<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T>[],
  handler: (event: Event) => void,
) {
  // Memoize the event listener to prevent unnecessary re-renders
  const memoizedHandler = useCallback(
    (event: Event) => {
      // Check if the click is inside any of the elements
      const isInside = refs.some((ref) => {
        const el = ref?.current
        return el && el.contains((event.target as Node) || null)
      })

      // Do nothing if the click is inside any of the elements
      if (isInside) {
        return
      }

      handler(event)
    },
    [refs, handler],
  )

  useEffect(() => {
    // Add event listeners
    document.addEventListener("mousedown", memoizedHandler)
    document.addEventListener("touchstart", memoizedHandler)

    // Clean up event listeners
    return () => {
      document.removeEventListener("mousedown", memoizedHandler)
      document.removeEventListener("touchstart", memoizedHandler)
    }
  }, [memoizedHandler]) // Only re-run if memoizedHandler changes
}

