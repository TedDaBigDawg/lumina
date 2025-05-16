"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createThanksgiving } from "@/actions/thanksgiving-actions"
import { Form, FormField, FormLabel, FormTextarea, FormSelect } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { getMassesWithAvailability } from "@/actions/mass-actions"
import { formatDate, formatTime } from "@/lib/utils"

interface Mass {
  id: string
  title: string
  date: Date
  location: string
  availableThanksgivingsSlots: number
}

export default function NewThanksgivingPage() {
  const [error, setError] = useState<string | null>(null)
  const [masses, setMasses] = useState<Mass[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMasses() {
      try {
        const massesData = await getMassesWithAvailability()
        // Filter masses that have available thanksgiving slots
        setMasses(massesData.data?.filter((mass) => mass.availableThanksgivingsSlots > 0) ?? [])
      } catch (error) {
        console.error("Error fetching masses:", error)
        setError("Failed to load available masses")
      } finally {
        setLoading(false)
      }
    }

    fetchMasses()
  }, [])

  async function handleSubmit(formData: FormData) {
    setError(null)

    const result = await createThanksgiving(formData)

    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Book Thanksgiving Service</h1>
          <p className="text-gray-600">Fill out the form below to book a thanksgiving service.</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Thanksgiving Service Details</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="text-center py-4">Loading available masses...</p>
            ) : masses.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">No masses with available thanksgiving slots at this time.</p>
                <p className="text-gray-500">Please check back later or contact the church office.</p>
              </div>
            ) : (
              <Form action={handleSubmit}>
                {error && <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">{error}</div>}

                <FormField>
                  <FormLabel htmlFor="massId">Select Mass</FormLabel>
                  <FormSelect id="massId" name="massId" required>
                    <option value="">Select a mass</option>
                    {masses.map((mass) => (
                      <option key={mass.id} value={mass.id}>
                        {mass.title} - {formatDate(mass.date)} at {formatTime(mass.date)}(
                        {mass.availableThanksgivingsSlots} slots available)
                      </option>
                    ))}
                  </FormSelect>
                </FormField>

                <FormField>
                  <FormLabel htmlFor="description">Reason for Thanksgiving</FormLabel>
                  <FormTextarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="e.g., Birthday, Anniversary, New Job, etc."
                    required
                  />
                </FormField>

                <div className="mt-6 flex justify-end space-x-4">
                  <Link href="/dashboard/thanksgiving">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit">Submit Request</Button>
                </div>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

