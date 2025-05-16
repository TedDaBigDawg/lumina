"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { updateMass } from "@/actions/mass-actions"
import { getChurchInfo } from "@/actions/church-info-actions"
import { Form, FormField, FormLabel, FormInput, FormCheckbox } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ErrorMessage } from "@/components/ui/error-message"

interface Mass {
  id: string
  title: string
  date: string
  time: string
  location: string
  availableIntentionsSlots: number
  availableThanksgivingsSlots: number
  _count: {
    massIntentions: number
    thanksgivings: number
  }
}

export default function EditMassPage() {
  const params = useParams()
  const router = useRouter()
  const [mass, setMass] = useState<Mass | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [defaultAddress, setDefaultAddress] = useState<string>("")
  const [useDefaultLocation, setUseDefaultLocation] = useState(false)
  const [customLocation, setCustomLocation] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch mass and church info in parallel
        const [massResponse, churchInfo] = await Promise.all([fetch(`/api/masses/${params.id}`), getChurchInfo()])

        if (!massResponse.ok) {
          throw new Error("Failed to fetch mass")
        }

        const massData = await massResponse.json()

        // Format date and time for the input fields
        const massDate = new Date(massData.date)
        const formattedDate = massDate.toISOString().split("T")[0]
        const formattedTime = massDate.toTimeString().slice(0, 5)

        setMass({
          ...massData,
          date: formattedDate,
          time: formattedTime,
        })

        setDefaultAddress(churchInfo.address)

        // Check if the mass location is the same as the default address
        setUseDefaultLocation(massData.location === churchInfo.address)

        // If not using default, set the custom location
        if (massData.location !== churchInfo.address) {
          setCustomLocation(massData.location)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load mass details")
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
      const result = await updateMass(params.id as string, formData)

      if (result?.error) {
        setError(result.error)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error updating mass:", error)
      setError("Failed to update mass")
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center">Loading mass details...</p>
        </div>
      </div>
    )
  }

  if (error && !mass) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Link href="/admin/masses">
              <Button>Back to Masses</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Calculate total slots (available + booked)
  const totalIntentionSlots = mass ? mass.availableIntentionsSlots + mass._count.massIntentions : 0
  const totalThanksgivingSlots = mass ? mass.availableThanksgivingsSlots + mass._count.thanksgivings : 0

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Mass</h1>
          <p className="text-gray-600">Update mass details and slot availability.</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Mass Details</CardTitle>
          </CardHeader>

          <CardContent>
            <Form action={handleSubmit}>
              {error && <ErrorMessage message={error} className="mb-4" />}

              <FormField>
                <FormLabel htmlFor="title">Mass Title</FormLabel>
                <FormInput id="title" name="title" required defaultValue={mass?.title} />
              </FormField>

              <FormField>
                <FormLabel htmlFor="date">Date</FormLabel>
                <FormInput id="date" name="date" type="date" required defaultValue={mass?.date} />
              </FormField>

              <FormField>
                <FormLabel htmlFor="time">Time</FormLabel>
                <FormInput id="time" name="time" type="time" required defaultValue={mass?.time} />
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
                    placeholder="e.g., Main Church"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                  />
                )}
              </FormField>

              <FormField>
                <FormLabel htmlFor="intentionSlots">
                  Mass Intention Slots (Currently {mass?._count.massIntentions} booked)
                </FormLabel>
                <FormInput
                  id="intentionSlots"
                  name="intentionSlots"
                  type="number"
                  min={mass?._count.massIntentions || 0}
                  required
                  defaultValue={totalIntentionSlots}
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="thanksgivingSlots">
                  Thanksgiving Slots (Currently {mass?._count.thanksgivings} booked)
                </FormLabel>
                <FormInput
                  id="thanksgivingSlots"
                  name="thanksgivingSlots"
                  type="number"
                  min={mass?._count.thanksgivings || 0}
                  required
                  defaultValue={totalThanksgivingSlots}
                />
              </FormField>

              <div className="mt-6 flex justify-end space-x-4">
                <Link href="/admin/masses">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Mass"}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

