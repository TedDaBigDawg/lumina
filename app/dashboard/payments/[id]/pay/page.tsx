"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initiating, setInitiating] = useState(false)

  useEffect(() => {
    async function fetchPayment() {
      try {
        const response = await fetch(`/api/payments/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch payment")
        }
        const data = await response.json()
        setPayment(data)
      } catch (error) {
        console.error("Error fetching payment:", error)
        setError("Failed to load payment details")
      } finally {
        setLoading(false)
      }
    }

    fetchPayment()
  }, [params.id])

  async function initiatePayment() {
    setInitiating(true)
    setError(null)

    try {
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentId: params.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to initiate payment")
      }

      const data = await response.json()

      // Redirect to Paystack payment page
      window.location.href = data.authorization_url
    } catch (error: any) {
      console.error("Error initiating payment:", error)
      setError(error.message || "Failed to initiate payment")
      setInitiating(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !payment) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Link href="/dashboard/payments">
              <Button>Back to Donations</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (payment?.status === "PAID") {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Payment Already Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="mb-4 text-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg mb-4">
                  This {payment.type === "DONATION" ? "donation" : "offering"} has already been paid. Thank you for your
                  contribution!
                </p>
                <Link href="/dashboard/payments">
                  <Button>Back to Donations</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600">
            Review your {payment?.type === "DONATION" ? "donation" : "offering"} details and proceed to payment.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">{error}</div>}

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Type:</span>
                <span>
                  {payment?.type === "DONATION" ? "Donation" : "Offering"}
                  {payment?.category && ` (${payment.category.replace("_", " ")})`}
                </span>
              </div>
              {payment?.description && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Description:</span>
                  <span>{payment.description}</span>
                </div>
              )}
              {payment?.goal && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">For Goal:</span>
                  <span>{payment.goal.title}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-medium">Amount:</span>
                <span className="text-xl font-bold">{formatCurrency(payment?.amount || 0)}</span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">
                  You will be redirected to Paystack to complete your payment securely.
                </p>
                <div className="flex justify-end space-x-4">
                  <Link href="/dashboard/payments">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button onClick={initiatePayment} disabled={initiating}>
                    {initiating ? "Processing..." : "Pay Now"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

