"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createEvent } from "@/actions/event-actions"
import { getChurchInfo } from "@/actions/church-info-actions"
import { Form, FormField, FormLabel, FormInput, FormTextarea, FormCheckbox } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ErrorMessage } from "@/components/ui/error-message"

export default function NewEventPage() {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [defaultAddress, setDefaultAddress] = useState<string>("")
  const [useDefaultLocation, setUseDefaultLocation] = useState(true)
  const [customLocation, setCustomLocation] = useState("")

  useEffect(() => {
    async function fetchChurchInfo() {
      try {
        const churchInfo = await getChurchInfo()
        setDefaultAddress(churchInfo.address)
      } catch (error) {
        console.error("Error fetching church info:", error)
        setError("Failed to fetch church information")
      }
    }

    fetchChurchInfo()
  }, [])

  async function handleSubmit(formData: FormData) {
    setError(null)
    setIsSubmitting(true)

    // Add the useDefaultLocation flag to the form data
    formData.set("useDefaultLocation", useDefaultLocation.toString())

    // If using default location, clear any custom location to ensure default is used
    if (useDefaultLocation) {
      formData.set("location", "")
    }

    try {
      const result = await createEvent(formData)

      if (result?.error) {
        setError(result.error)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error creating event:", error)
      setError("Failed to create event")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
          <p className="text-gray-600">Create a new church event.</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>

          <CardContent>
            <Form action={handleSubmit}>
              {error && <ErrorMessage message={error} className="mb-4" />}

              <FormField>
                <FormLabel htmlFor="title">Event Title</FormLabel>
                <FormInput id="title" name="title" required placeholder="e.g., Christmas Carol Service" />
              </FormField>

              <FormField>
                <FormLabel htmlFor="description">Description</FormLabel>
                <FormTextarea id="description" name="description" rows={3} required placeholder="Describe the event" />
              </FormField>

              <FormField>
                <FormLabel htmlFor="date">Date</FormLabel>
                <FormInput id="date" name="date" type="date" min={new Date().toISOString().split("T")[0]} required />
              </FormField>

              <FormField>
                <FormLabel htmlFor="time">Time</FormLabel>
                <FormInput id="time" name="time" type="time" required />
              </FormField>

      

              <FormField>
                <div className="flex items-center space-x-2 mb-2">
                  <FormCheckbox
                    id="useDefaultLocation"
                    checked={useDefaultLocation}
                    onCheckedChange={(checked) => {
                      setUseDefaultLocation(checked === true)
                    }}
                  />
                  <FormLabel htmlFor="useDefaultLocation" className="cursor-pointer">
                    Use default church address
                  </FormLabel>
                </div>
                {useDefaultLocation ? (
                  <div className="p-3 bg-gray-100 rounded-md">
                    <p className="text-gray-700">{defaultAddress || "Loading default address..."}</p>
                  </div>
                ) : (
                  <FormInput
                    id="location"
                    name="location"
                    required={!useDefaultLocation}
                    placeholder="e.g., Main Church Hall"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                  />
                )}
              </FormField>

              <FormField>
                <FormLabel htmlFor="capacity">Capacity (Optional)</FormLabel>
                <FormInput
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  placeholder="Leave blank for unlimited"
                />
              </FormField>

              <div className="mt-6 flex justify-end space-x-4">
                <Link href="/admin/events">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

