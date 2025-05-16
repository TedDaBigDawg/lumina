"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { updatePaymentGoal } from "@/actions/payment-actions"
import { Form, FormField, FormLabel, FormInput, FormTextarea, FormSelect } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface PaymentGoal {
  id: string
  title: string
  description: string
  category: string
  targetAmount: number
  currentAmount: number
  startDate: string
  endDate: string | null
}

export default function EditPaymentGoalPage() {
  const params = useParams()
  const [goal, setGoal] = useState<PaymentGoal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGoal() {
      try {
        const response = await fetch(`/api/payments/goals/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch goal")
        }
        const data = await response.json()

        // Format dates for the input fields
        const startDate = new Date(data.startDate)
        const formattedStartDate = startDate.toISOString().split("T")[0]

        let formattedEndDate = null
        if (data.endDate) {
          const endDate = new Date(data.endDate)
          formattedEndDate = endDate.toISOString().split("T")[0]
        }

        setGoal({
          ...data,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        })
      } catch (error) {
        console.error("Error fetching goal:", error)
        setError("Failed to load goal details")
      } finally {
        setLoading(false)
      }
    }

    fetchGoal()
  }, [params.id])

  async function handleSubmit(formData: FormData) {
    setError(null)

    const result = await updatePaymentGoal(params.id as string, formData)

    if (result?.error) {
      setError(result.error)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center">Loading goal details...</p>
        </div>
      </div>
    )
  }

  if (error && !goal) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Link href="/admin/payments/goals">
              <Button>Back to Goals</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Fundraising Goal</h1>
          <p className="text-gray-600">Update the details of this fundraising goal.</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Goal Details</CardTitle>
          </CardHeader>

          <CardContent>
            <Form action={handleSubmit}>
              {error && <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">{error}</div>}

              <FormField>
                <FormLabel htmlFor="title">Title</FormLabel>
                <FormInput id="title" name="title" required defaultValue={goal?.title} />
              </FormField>

              <FormField>
                <FormLabel htmlFor="description">Description</FormLabel>
                <FormTextarea id="description" name="description" rows={3} required defaultValue={goal?.description} />
              </FormField>

              <FormField>
                <FormLabel htmlFor="category">Category</FormLabel>
                <FormSelect id="category" name="category" required defaultValue={goal?.category}>
                  <option value="">Select a category</option>
                  <option value="TITHE">Tithe</option>
                  <option value="OFFERING">Offering</option>
                  <option value="SPECIAL_PROJECT">Special Project</option>
                  <option value="OTHER">Other</option>
                </FormSelect>
              </FormField>

              <FormField>
                <FormLabel htmlFor="targetAmount">Target Amount</FormLabel>
                <FormInput
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  defaultValue={goal?.targetAmount}
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="startDate">Start Date</FormLabel>
                <FormInput id="startDate" name="startDate" type="date" required defaultValue={goal?.startDate} />
              </FormField>

              <FormField>
                <FormLabel htmlFor="endDate">End Date (Optional)</FormLabel>
                <FormInput id="endDate" name="endDate" type="date" defaultValue={goal?.endDate || ""} />
              </FormField>

              <div className="mt-6 flex justify-end space-x-4">
                <Link href="/admin/payments/goals">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit">Update Goal</Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

