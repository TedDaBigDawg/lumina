"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-red-600">Error</h1>
              <h2 className="mt-4 text-3xl font-bold text-gray-900">Something went wrong</h2>
              <p className="mt-2 text-lg text-gray-600">We apologize for the inconvenience. Please try again later.</p>
              <div className="mt-6">
                <Button onClick={() => this.setState({ hasError: false })}>Try Again</Button>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

