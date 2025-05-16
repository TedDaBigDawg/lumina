"use client"

import { useEffect, useState, useRef, useCallback } from "react"

// WebSocket connection URL
const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `wss://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/ws`
    : "ws://localhost:3000/api/ws")

// Event types for the WebSocket
export enum WebSocketEventType {
  PAYMENT_UPDATED = "PAYMENT_UPDATED",
  MASS_INTENTION_UPDATED = "MASS_INTENTION_UPDATED",
  THANKSGIVING_UPDATED = "THANKSGIVING_UPDATED",
  EVENT_UPDATED = "EVENT_UPDATED",
  NOTIFICATION = "NOTIFICATION",
}

// Interface for WebSocket messages
export interface WebSocketMessage {
  type: WebSocketEventType
  data: any
}

// Class to manage WebSocket connections
class WebSocketService {
  private socket: WebSocket | null = null
  private listeners: Map<WebSocketEventType, Set<(data: any) => void>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private connectionStatus: "connecting" | "connected" | "disconnected" = "disconnected"
  private statusListeners: Set<(status: string) => void> = new Set()
  private messageQueue: WebSocketMessage[] = []
  private isReconnecting = false

  // Connect to the WebSocket server
  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return
    if (this.isReconnecting) return

    this.updateConnectionStatus("connecting")

    try {
      this.socket = new WebSocket(WS_URL)

      this.socket.onopen = this.handleOpen.bind(this)
      this.socket.onmessage = this.handleMessage.bind(this)
      this.socket.onclose = this.handleClose.bind(this)
      this.socket.onerror = this.handleError.bind(this)
    } catch (error) {
      console.error("Error creating WebSocket:", error)
      this.updateConnectionStatus("disconnected")
      this.attemptReconnect()
    }
  }

  // Handle WebSocket open event
  private handleOpen() {
    console.log("WebSocket connected")
    this.reconnectAttempts = 0
    this.isReconnecting = false
    this.updateConnectionStatus("connected")
    this.startHeartbeat()
    this.flushMessageQueue()
  }

  // Handle WebSocket message event
  private handleMessage(event: MessageEvent) {
    try {
      // Handle heartbeat response
      if (event.data === "pong") {
        return
      }

      const message: WebSocketMessage = JSON.parse(event.data)
      this.notifyListeners(message.type, message.data)
    } catch (error) {
      console.error("Error parsing WebSocket message:", error)
    }
  }

  // Handle WebSocket close event
  private handleClose(event: CloseEvent) {
    console.log(`WebSocket disconnected: ${event.code} ${event.reason}`)
    this.updateConnectionStatus("disconnected")
    this.stopHeartbeat()

    // Don't attempt to reconnect if the close was clean (code 1000)
    if (event.code !== 1000) {
      this.attemptReconnect()
    }
  }

  // Handle WebSocket error event
  private handleError(error: Event) {
    console.error("WebSocket error:", error)
    // Don't close the socket here, let the onclose handler deal with reconnection
  }

  // Flush queued messages after reconnection
  private flushMessageQueue() {
    if (this.socket?.readyState !== WebSocket.OPEN) return

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (message) {
        this.sendMessage(message.type, message.data)
      }
    }
  }

  // Start heartbeat to keep connection
  private startHeartbeat() {
    this.stopHeartbeat() // Clear any existing interval

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send("ping")
      } else {
        this.stopHeartbeat()
      }
    }, 30000) // Send heartbeat every 30 seconds
  }

  // Stop heartbeat interval
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // Update connection status and notify listeners
  private updateConnectionStatus(status: "connecting" | "connected" | "disconnected") {
    if (this.connectionStatus === status) return

    this.connectionStatus = status
    this.statusListeners.forEach((listener) => {
      try {
        listener(status)
      } catch (error) {
        console.error("Error in status listener:", error)
      }
    })
  }

  // Attempt to reconnect to the WebSocket server
  private attemptReconnect() {
    if (this.isReconnecting) return
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnect attempts reached")
      return
    }

    this.isReconnecting = true
    this.reconnectAttempts++
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000)

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    this.reconnectTimeout = setTimeout(() => {
      this.isReconnecting = false
      this.connect()
    }, delay)
  }

  // Disconnect from the WebSocket server
  disconnect() {
    this.isReconnecting = false

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    this.stopHeartbeat()

    if (this.socket) {
      // Use code 1000 for clean closure
      this.socket.close(1000, "Client disconnected")
      this.socket = null
    }

    this.updateConnectionStatus("disconnected")
  }

  // Subscribe to a specific event type
  subscribe(eventType: WebSocketEventType, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }

    this.listeners.get(eventType)!.add(callback)

    // Connect if not already connected
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.connect()
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.listeners.delete(eventType)
        }
      }

      // Disconnect if no more listeners
      if (this.listeners.size === 0) {
        this.disconnect()
      }
    }
  }

  // Subscribe to connection status changes
  subscribeToStatus(callback: (status: string) => void) {
    this.statusListeners.add(callback)

    // Immediately notify with current status
    callback(this.connectionStatus)

    // Return unsubscribe function
    return () => {
      this.statusListeners.delete(callback)
    }
  }

  // Notify all listeners of an event
  private notifyListeners(eventType: WebSocketEventType, data: any) {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error("Error in WebSocket listener callback:", error)
        }
      })
    }
  }

  // Send a message through the WebSocket
  sendMessage(type: WebSocketEventType, data: any): boolean {
    const message: WebSocketMessage = { type, data }

    if (this.socket?.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(message))
        return true
      } catch (error) {
        console.error("Error sending WebSocket message:", error)
        this.messageQueue.push(message)
        return false
      }
    } else {
      // Queue message for when connection is established
      this.messageQueue.push(message)
      this.connect()
      return false
    }
  }

  // Get current connection status
  getStatus() {
    return this.connectionStatus
  }
}

// Singleton instance
export const webSocketService = new WebSocketService()

// React hook for using the WebSocket service
export function useWebSocket(eventType: WebSocketEventType) {
  const [data, setData] = useState<any>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // Use useRef to store the latest callback to avoid unnecessary re-renders
  const callbackRef = useRef<(data: any) => void>()

  // Update the callback ref when data changes
  useEffect(() => {
    callbackRef.current = (newData: any) => {
      setData(newData)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Subscribe to connection status
    const statusUnsubscribe = webSocketService.subscribeToStatus((status) => {
      setIsConnected(status === "connected")

      // Reset loading state if disconnected
      if (status === "disconnected") {
        setIsLoading(true)
      }
    })

    // Subscribe to event
    const eventUnsubscribe = webSocketService.subscribe(eventType, (newData) => {
      if (callbackRef.current) {
        try {
          callbackRef.current(newData)
        } catch (err) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      }
    })

    // Cleanup subscriptions on unmount
    return () => {
      statusUnsubscribe()
      eventUnsubscribe()
    }
  }, [eventType])

  // Function to manually refresh data
  const refresh = useCallback(() => {
    setIsLoading(true)
    setError(null)

    // Request a refresh via WebSocket
    webSocketService.sendMessage(WebSocketEventType.NOTIFICATION, {
      action: "refresh",
      eventType,
    })
  }, [eventType])

  return {
    data,
    isConnected,
    isLoading,
    error,
    refresh,
  }
}

// Hook for sending WebSocket messages
export function useSendWebSocketMessage() {
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isSending, setIsSending] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const unsubscribe = webSocketService.subscribeToStatus((status) => {
      setIsConnected(status === "connected")
    })

    return unsubscribe
  }, [])

  const sendMessage = useCallback(async (type: WebSocketEventType, data: any): Promise<boolean> => {
    setIsSending(true)
    setError(null)

    try {
      const result = webSocketService.sendMessage(type, data)
      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    } finally {
      setIsSending(false)
    }
  }, [])

  return {
    sendMessage,
    isConnected,
    isSending,
    error,
  }
}

