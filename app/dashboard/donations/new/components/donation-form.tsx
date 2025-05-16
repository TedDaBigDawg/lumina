"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Form, FormField, FormLabel, FormInput, FormSelect, FormTextarea } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ErrorMessage } from "@/components/ui/error-message"
import { createDonation } from "@/actions/donation-actions"

export default function DonationForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // For optimistic UI updates
  const [optimisticState, setOptimisticState] = useState<{
    submitted: boolean
    amount: string
    category: string
  }>({
    submitted: false,
    amount: "",
    category: "",
  })

  async function handleSubmit(formData: FormData) {
    setError(null)
    setIsSubmitting(true)

    // Store form data for optimistic update
    const amount = formData.get("amount") as string
    const category = formData.get("category") as string

    // Optimistic update
    setOptimisticState({
      submitted: true,
      amount,
      category,
    })

    try {
      const result = await createDonation(formData)

      if (result.error) {
        setError(result.error)
        setOptimisticState({
          submitted: false,
          amount: "",
          category: "",
        })
      } else {
        // Redirect happens in the server action
      }
    } catch (err) {
      console.error("Error creating donation:", err)
      setError("An unexpected error occurred. Please try again.")
      setOptimisticState({
        submitted: false,
        amount: "",
        category: "",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (optimisticState.submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Your Donation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg font-medium">
              Processing your donation of {optimisticState.amount} for {optimisticState.category.replace("_", " ")}...
            </p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we redirect you to the payment page.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Donation</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <ErrorMessage message={error} className="mb-4" />}

        <Form action={handleSubmit}>
          <FormField>
            <FormLabel htmlFor="amount">Amount (NGN)</FormLabel>
            <FormInput
              id="amount"
              name="amount"
              type="number"
              min="100"
              step="100"
              required
              placeholder="Enter amount"
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="category">Category</FormLabel>
            <FormSelect id="category" name="category" required>
              <option value="">Select a category</option>
              <option value="TITHE">Tithe</option>
              <option value="OFFERING">Offering</option>
              <option value="SPECIAL_PROJECT">Special Project</option>
              <option value="OTHER">Other</option>
            </FormSelect>
          </FormField>

          <FormField>
            <FormLabel htmlFor="description">Description (Optional)</FormLabel>
            <FormTextarea
              id="description"
              name="description"
              rows={3}
              placeholder="Enter a description for your donation"
            />
          </FormField>

          <div className="mt-6">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Processing..." : "Continue to Payment"}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}

