"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600">Error</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Something went wrong</h2>
        <p className="mt-2 text-lg text-gray-600">We apologize for the inconvenience. Please try again later.</p>
        <div className="mt-6 flex justify-center space-x-4">
          <Button onClick={reset}>Try Again</Button>
          <Link href="/">
            <Button variant="outline">Go Back Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

