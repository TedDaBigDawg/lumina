"use client"

import { useState, useEffect, useCallback } from "react"
import { X } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useDataFetching } from "@/hooks/use-data-fetching"

interface SystemNotification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  expiresAt?: string
  userRole?: string[]
  createdAt: Date
}

// Local storage key for dismissed notifications
const DISMISSED_NOTIFICATIONS_KEY = "dismissedNotifications"

export function SystemNotification() {
  const [visible, setVisible] = useState(false)

  // Use our improved data fetching hook
  const {
    data: notification,
    error,
    isLoading,
  } = useDataFetching<SystemNotification | null>("/api/system/notifications/active", {
    refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    // Add error handling to prevent repeated failed requests
    onError: (err) => {
      console.error("Error fetching notifications:", err)
      // Return null to prevent further requests for a while
      return null
    },
  })

  // Check if notification has been dismissed
  useEffect(() => {
    if (!notification || !notification.id) {
      setVisible(false)
      return
    }

    try {
      // Check if notification is already dismissed
      const dismissedNotifications = JSON.parse(localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY) || "[]") as string[]

      const isDismissed = dismissedNotifications.includes(notification.id)
      setVisible(!isDismissed)
    } catch (error) {
      console.error("Error checking dismissed notifications:", error)
      setVisible(true)
    }
  }, [notification])

  // Check if notification has expired
  useEffect(() => {
    if (!notification?.expiresAt) return

    const expiryDate = new Date(notification.expiresAt)
    const now = new Date()

    if (expiryDate < now) {
      setVisible(false)
    }
  }, [notification])

  // Handle dismissing notification
  const dismissNotification = useCallback(() => {
    if (!notification) return

    try {
      // Store in localStorage to avoid showing again
      const dismissedNotifications = JSON.parse(localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY) || "[]") as string[]

      if (!dismissedNotifications.includes(notification.id)) {
        dismissedNotifications.push(notification.id)
        localStorage.setItem(DISMISSED_NOTIFICATIONS_KEY, JSON.stringify(dismissedNotifications))
      }

      setVisible(false)
    } catch (error) {
      console.error("Error dismissing notification:", error)
    }
  }, [notification])

  if (isLoading || !visible || !notification) {
    return null
  }

  // Determine alert variant based on notification type
  const alertVariant =
    notification.type === "error"
      ? "destructive"
      : notification.type === "warning"
        ? "warning"
        : notification.type === "success"
          ? "success"
          : "default"

  return (
    <Alert variant={alertVariant} className="mb-4 relative">
      <AlertTitle>{notification.title}</AlertTitle>
      <AlertDescription>{notification.message}</AlertDescription>
      <button
        onClick={dismissNotification}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  )
}

