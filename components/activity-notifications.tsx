"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDate } from "@/lib/utils"
import { markAllActivitiesAsRead } from "@/actions/activity-actions"
import { useDataFetching } from "@/hooks/use-data-fetching"
import { motion, AnimatePresence } from "framer-motion"

interface Activity {
  id: string
  action: string
  read: boolean
  createdAt: string
}

interface ActivitiesResponse {
  data: {
    activities: Activity[]
    count: number
  }
  error?: string
}

export default function ActivityNotifications() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const prevCountRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Use our improved data fetching hook
  const {
    data: activitiesData,
    error,
    isLoading,
    isValidating,
    mutate,
    refresh,
  } = useDataFetching<ActivitiesResponse>("/api/activities/unread", {
    refreshInterval: 30000, // Poll every 30 seconds
    revalidateOnFocus: true,
    initialData: { data: { activities: [], count: 0 } },
  })

  // Derived state
  const activities = activitiesData?.data?.activities || []
  const unreadCount = activitiesData?.data?.count || 0

  // Check if there are new notifications
  useEffect(() => {
    // Check if there are new notifications
    if (unreadCount > prevCountRef.current && !isOpen) {
      setHasNewNotification(true)

      // Clear previous timeout if it exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Auto-clear the notification indicator after 5 seconds
      timeoutRef.current = setTimeout(() => {
        if (!isOpen) {
          // Only clear if popover is still closed
          setHasNewNotification(false)
        }
      }, 5000)
    }

    // Always update the previous count reference
    prevCountRef.current = unreadCount

    // Cleanup function to clear timeout when component unmounts or dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [unreadCount, isOpen])

  // Also add a new effect to handle clearing the indicator when the popover closes
  useEffect(() => {
    // If popover was open and is now closed, and there are unread notifications
    if (!isOpen && unreadCount > 0 && hasNewNotification) {
      // Set a timeout to clear the notification indicator
      timeoutRef.current = setTimeout(() => {
        setHasNewNotification(false)
      }, 5000)

      // Cleanup function
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    }
  }, [isOpen, unreadCount, hasNewNotification])

  // Handle opening the popover - fetch fresh data
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      if (open) {
        refresh()
        setHasNewNotification(false)
      }
    },
    [refresh],
  )

  // Handle marking all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      mutate((prev) => {
        if (!prev) return { data: { activities: [], count: 0 } }

        return {
          data: {
            activities: prev.data.activities.map((activity) => ({ ...activity, read: true })),
            count: 0,
          },
          error: prev.error,
        }
      })

      // Perform the server action
      const result = await markAllActivitiesAsRead()

      if (result?.error) {
        // Revert on error by refreshing
        refresh()
        console.error("Error marking activities as read:", result.error)
      }
    } catch (error) {
      // Revert on error by refreshing
      refresh()
      console.error("Error marking activities as read:", error)
    }
  }, [mutate, refresh])

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative hover:bg-primary rounded-full py-2 focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <Bell className="h-5 w-5 outline-secondary" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white ${
                  hasNewNotification ? "bg-red-600 ring-2 ring-white dark:ring-gray-800" : "bg-secondary"
                }`}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 max-h-[80vh] flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg" 
        align="end"
      >
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead} 
              disabled={isValidating}
              className="text-[#1a1a1a] hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[calc(80vh-48px)] overflow-auto">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
              Error loading notifications. Please try again.
            </div>
          ) : activities.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {activities.map((activity) => (
                <motion.li
                  key={activity.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`p-3 ${!activity.read ? "bg-blue-50 dark:bg-blue-900/30" : "bg-white dark:bg-gray-800"}`}
                >
                  <p className={`text-sm ${!activity.read ? "font-medium text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(new Date(activity.createdAt))}
                  </p>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
              No new notifications
            </div>
          )}

          {isValidating && activities.length > 0 && (
            <div className="flex justify-center p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}