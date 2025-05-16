"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { updateEvent } from "@/actions/event-actions"
import { getChurchInfo } from "@/actions/church-info-actions"
import { Form, FormField, FormLabel, FormInput, FormTextarea, FormCheckbox } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ErrorMessage } from "@/components/ui/error-message"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  capacity: number | null
}

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [defaultAddress, setDefaultAddress] = useState<string>("")
  const [useDefaultLocation, setUseDefaultLocation] = useState(false)
  const [customLocation, setCustomLocation] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch event and church info in parallel
        const [eventResponse, churchInfo] = await Promise.all([fetch(`/api/events/${params.id}`), getChurchInfo()])

        if (!eventResponse.ok) {
          throw new Error("Failed to fetch event")
        }

        const eventData = await eventResponse.json()

        // Format date for the input field
        const eventDate = new Date(eventData.date)
        const formattedDate = eventDate.toISOString().split("T")[0]
        const formattedTime = eventDate.toTimeString().slice(0, 5)

        setEvent({
          ...eventData,
          date: formattedDate,
          time: formattedTime,
        })

        setDefaultAddress(churchInfo.address)

        // Check if the event location is the same as the default address
        setUseDefaultLocation(eventData.location === churchInfo.address)

        // If not using default, set the custom location
        if (eventData.location !== churchInfo.address) {
          setCustomLocation(eventData.location)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load event details")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

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
      const result = await updateEvent(params.id as string, formData)

      if (result?.error) {
        setError(result.error)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error updating event:", error)
      setError("Failed to update event")
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Link href="/admin/events">
              <Button>Back to Events</Button>
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
          <p className="text-gray-600">Update event details.</p>
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
                <FormInput id="title" name="title" required defaultValue={event?.title} />
              </FormField>

              <FormField>
                <FormLabel htmlFor="description">Description</FormLabel>
                <FormTextarea id="description" name="description" rows={3} required defaultValue={event?.description} />
              </FormField>

              <FormField>
                <FormLabel htmlFor="date">Date</FormLabel>
                <FormInput id="date" name="date" type="date" required defaultValue={event?.date} />
              </FormField>

              <FormField>
                <FormLabel htmlFor="time">Time</FormLabel>
                <FormInput id="time" name="time" type="time" required defaultValue={event?.time} />
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
                  defaultValue={event?.capacity?.toString() || ""}
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
                  {isSubmitting ? "Updating..." : "Update Event"}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

