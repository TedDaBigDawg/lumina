"use client"

import { useState, useEffect } from "react"
import { getUserProfile, updateUserProfile } from "@/actions/profile-actions"
import { Form, FormField, FormLabel, FormInput } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ErrorMessage } from "@/components/ui/error-message"
import { SuccessMessage } from "@/components/ui/success-message"
import { profileUpdateSchema } from "@/lib/validations"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getUserProfile()
        setProfile(data)
      } catch (error) {
        console.error("Error fetching profile:", error)
        setMessage({ type: "error", text: "Failed to load profile" })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  async function handleSubmit(formData: FormData) {
    setUpdating(true)
    setMessage(null)

    try {
      // Client-side validation
      const name = formData.get("name") as string
      const phone = (formData.get("phone") as string) || null

      const validationResult = profileUpdateSchema.safeParse({ name, phone })
      if (!validationResult.success) {
        const fieldErrors = validationResult.error.flatten().fieldErrors
        const firstError = fieldErrors.name?.[0] || fieldErrors.phone?.[0] || "Invalid form data"

        setMessage({ type: "error", text: firstError })
        setUpdating(false)
        return
      }

      const updateResult = await updateUserProfile(formData)

      if (updateResult.error) {
        setMessage({ type: "error", text: updateResult.error })
      } else if (updateResult.success) {
        setProfile(updateResult.user)
        setMessage({ type: "success", text: "Profile updated successfully" })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "Failed to update profile" })
    } finally {
      setUpdating(false)
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-gray-600">View and update your personal information.</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            {message &&
              (message.type === "success" ? (
                <SuccessMessage message={message.text} className="mb-4" />
              ) : (
                <ErrorMessage message={message.text} className="mb-4" />
              ))}

            <Form action={handleSubmit}>
              <FormField>
                <FormLabel htmlFor="name">Full Name</FormLabel>
                <FormInput
                  id="name"
                  name="name"
                  required
                  defaultValue={profile?.name || ""}
                  aria-invalid={message?.type === "error" ? "true" : "false"}
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="email">Email Address</FormLabel>
                <FormInput id="email" name="email" type="email" disabled defaultValue={profile?.email || ""} />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed for security reasons.</p>
              </FormField>

              <FormField>
                <FormLabel htmlFor="phone">Phone Number</FormLabel>
                <FormInput id="phone" name="phone" type="tel" defaultValue={profile?.phone || ""} />
              </FormField>

              <div className="mt-6">
                <Button type="submit" disabled={updating}>
                  {updating ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

