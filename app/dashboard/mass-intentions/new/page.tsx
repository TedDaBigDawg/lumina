"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createMassIntention } from "@/actions/mass-intention-actions"
import {
  FormField,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { getMassesWithAvailability } from "@/actions/mass-actions"
import { formatDate, formatTime } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Loader } from "lucide-react"

interface Mass {
  id: string
  title: string
  date: Date
  location: string
  availableIntentionsSlots: number
}

export default function NewMassIntentionPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [masses, setMasses] = useState<Mass[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchMasses() {
      try {
        const massesData = await getMassesWithAvailability()
        setMasses(
          (massesData.data ?? []).filter(
            (mass) => mass.availableIntentionsSlots > 0
          )
        )
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
    setIsSubmitting(true)
    console.log("Submitting state triggered")
    setError(null)

    try {
      const result = await createMassIntention(formData)

      if (result?.error) {
        setError(result.error)
        console.log("Error creating mass intention:", result.error)
        setIsSubmitting(false)
        return
      }

      router.push("/dashboard/mass-intentions")
      router.refresh()
    } catch (error) {
      console.error("Unexpected error:", error)
      setError("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Request Mass Intention
          </h1>
          <p className="text-gray-600">
            Fill out the form below to request a Mass intention.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Mass Intention Details</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="text-center py-4">Loading available masses...</p>
            ) : masses.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">
                  No masses with available intention slots at this time.
                </p>
                <p className="text-gray-500">
                  Please check back later or contact the church office.
                </p>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  console.log("About to call handleSubmit")
                  await handleSubmit(formData)
                }}
                aria-busy={isSubmitting}
              >
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
                    {error}
                  </div>
                )}

                <FormField>
                  <FormLabel htmlFor="massId">Select Mass</FormLabel>
                  <FormSelect id="massId" name="massId" required>
                    <option value="">Select a mass</option>
                    {masses.map((mass) => (
                      <option key={mass.id} value={mass.id}>
                        {mass.title} - {formatDate(mass.date)} at{" "}
                        {formatTime(mass.date)} (
                        {mass.availableIntentionsSlots} slots available)
                      </option>
                    ))}
                  </FormSelect>
                </FormField>

                <FormField>
                  <FormLabel htmlFor="name">
                    Name (for whom the Mass is offered)
                  </FormLabel>
                  <FormInput id="name" name="name" required />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="intention">Intention</FormLabel>
                  <FormTextarea
                    id="intention"
                    name="intention"
                    rows={3}
                    placeholder="e.g., For the repose of the soul, For healing, etc."
                    required
                  />
                </FormField>

                <div className="mt-6 flex justify-end space-x-4">
                  <Link href="/dashboard/mass-intentions">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "🌀 Submitting..." : "Submit Request"}
                  </Button>

                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
