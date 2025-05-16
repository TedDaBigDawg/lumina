"use client"

import { useState } from "react"
import Link from "next/link"
import { createPaymentGoal } from "@/actions/payment-actions"
import { Form, FormField, FormLabel, FormInput, FormTextarea, FormSelect } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function NewPaymentGoalPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)

    const result = await createPaymentGoal(formData)

    if (result?.error) {
      setError(result.error)
    }

    // Handle success or redirection here if needed
    // For example, you might want to redirect to the goals list page
    router.push("/admin/payments/goals")
    router.refresh()
    

  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Fundraising Goal</h1>
          <p className="text-gray-600">Set up a new fundraising goal for the church.</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Fundraising Goal Details</CardTitle>
          </CardHeader>

          <CardContent>
            <Form action={handleSubmit}>
              {error && <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">{error}</div>}

              <FormField>
                <FormLabel htmlFor="title">Title</FormLabel>
                <FormInput id="title" name="title" required placeholder="e.g., Church Renovation Fund" />
              </FormField>

              <FormField>
                <FormLabel htmlFor="description">Description</FormLabel>
                <FormTextarea
                  id="description"
                  name="description"
                  rows={3}
                  required
                  placeholder="Describe the purpose of this fundraising goal"
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
                <FormLabel htmlFor="targetAmount">Target Amount</FormLabel>
                <FormInput id="targetAmount" name="targetAmount" type="number" min="1" step="0.01" required />
              </FormField>

              <FormField>
                <FormLabel htmlFor="startDate">Start Date</FormLabel>
                <FormInput id="startDate" name="startDate" type="date" required />
              </FormField>

              <FormField>
                <FormLabel htmlFor="endDate">End Date (Optional)</FormLabel>
                <FormInput id="endDate" name="endDate" type="date" />
              </FormField>

              <div className="mt-6 flex justify-end space-x-4">
                <Link href="/admin/payments/goals">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit">Create Goal</Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

