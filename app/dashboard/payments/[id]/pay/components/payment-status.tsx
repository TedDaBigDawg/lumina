"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { useDataFetching } from "@/hooks/use-data-fetching"
import { motion } from "framer-motion"

interface PaymentStatusProps {
  paymentId: string
  reference: string
  initialStatus: "UNPAID" | "PAID" | "FAILED"
}

interface PaymentResponse {
  id: string
  status: "UNPAID" | "PAID" | "FAILED"
  reference: string
  amount: number
}

export default function PaymentStatus({ paymentId, reference, initialStatus }: PaymentStatusProps) {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)

  // Use our improved data fetching hook
  const {
    data: payment,
    error,
    isLoading,
    isValidating,
    refresh,
  } = useDataFetching<PaymentResponse>(`/api/payments/${paymentId}/status?reference=${reference}`, {
    initialData: { id: paymentId, status: initialStatus, reference, amount: 0 },
    refreshInterval: initialStatus === "UNPAID" ? 5000 : undefined, // Poll every 5 seconds if payment is pending
    revalidateOnFocus: initialStatus === "UNPAID",
    revalidateOnReconnect: initialStatus === "UNPAID",
  })

  // Derived state
  const status = payment?.status || initialStatus

  // Effect to refresh the page after payment completes
  useEffect(() => {
    if (status === "PAID" && initialStatus === "UNPAID") {
      // Payment status has changed from the initial status to PAID
      setShowConfetti(true)

      // Redirect after a delay
      const timer = setTimeout(() => {
        router.refresh()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [status, initialStatus, router])

  return (
    <Card className="mt-6 overflow-hidden">
      <CardContent className="pt-6 relative">
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Simple confetti animation */}
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"][i % 5],
                  top: 0,
                  left: `${Math.random() * 100}%`,
                }}
                initial={{ y: -20, opacity: 1 }}
                animate={{
                  y: 400,
                  opacity: 0,
                  x: Math.random() * 100 - 50, // Random horizontal movement
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col items-center justify-center text-center">
          {status === "PAID" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex flex-col items-center"
            >
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-green-700">Payment Successful!</h3>
              <p className="text-gray-600 mt-2">Your payment has been processed successfully.</p>
              <Button className="mt-6" onClick={() => router.push("/dashboard/payments")}>
                View All Payments
              </Button>
            </motion.div>
          )}

          {status === "FAILED" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex flex-col items-center"
            >
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-red-700">Payment Failed</h3>
              <p className="text-gray-600 mt-2">Your payment could not be processed. Please try again.</p>
              <Button className="mt-6" onClick={() => router.push(`/dashboard/payments/${paymentId}/pay`)}>
                Try Again
              </Button>
            </motion.div>
          )}

          {status === "UNPAID" && (
            <motion.div
              animate={{
                y: [0, 5, 0],
                transition: {
                  y: { repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" },
                },
              }}
              className="flex flex-col items-center"
            >
              <Clock className="h-16 w-16 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold text-yellow-700">Payment Processing</h3>
              <p className="text-gray-600 mt-2">
                {isValidating ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-yellow-500 mr-2"></span>
                    Checking payment status...
                  </span>
                ) : (
                  "We're waiting for confirmation from the payment provider."
                )}
              </p>
              {error && (
                <p className="text-red-500 text-sm mt-2">Error checking payment status. We'll try again shortly.</p>
              )}
              <Button className="mt-6" variant="outline" onClick={() => refresh()} disabled={isValidating}>
                Check Status
              </Button>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

