"use client"

import { useState, useEffect } from "react"
import { getUserProfile, updateUserProfile } from "@/actions/profile-actions"
import { getChurchInfo, updateChurchInfo } from "@/actions/church-info-actions"
import { Form, FormField, FormLabel, FormInput, FormTextarea } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
}

interface ChurchInfo {
  id: string
  name: string
  address: string
  phone: string
  email: string
  mission: string
  vision: string
  history: string
}

export default function AdminProfilePage() {
    const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [churchInfo, setChurchInfo] = useState<ChurchInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [updatingChurch, setUpdatingChurch] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [churchMessage, setChurchMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileData, churchData] = await Promise.all([getUserProfile(), getChurchInfo()])
        setProfile(profileData)
        setChurchInfo(churchData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  async function handleProfileSubmit(formData: FormData) {
    setUpdatingProfile(true)
    setProfileMessage(null)

    try {
      const result = await updateUserProfile(formData)

      if (result.error) {
        setProfileMessage({ type: "error", text: result.error })
      } else if (result.success) {
        setProfile(result.user)
        setProfileMessage({ type: "success", text: "Profile updated successfully" })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setProfileMessage({ type: "error", text: "Failed to update profile" })
    } finally {
      setUpdatingProfile(false)
    }
  }

  async function handleChurchInfoSubmit(formData: FormData) {
    setUpdatingChurch(true)
    setChurchMessage(null)

    try {
      const result = await updateChurchInfo(formData)

      if (result.error) {
        setChurchMessage({ type: "error", text: result.error })
      } else if (result.success) {
        setChurchInfo(result.churchInfo)
        setChurchMessage({ type: "success", text: "Church information updated successfully" })
      }
      router.refresh();
    } catch (error) {
      console.error("Error updating church info:", error)
      setChurchMessage({ type: "error", text: "Failed to update church information" })
    } finally {
      setUpdatingChurch(false)
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600">Manage your profile and church information.</p>
        </div>

        <Tabs defaultValue="profile" className="max-w-4xl mx-auto">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Personal Profile</TabsTrigger>
            <TabsTrigger value="church">Church Information</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                {profileMessage && (
                  <div
                    className={`mb-4 p-3 rounded-md ${
                      profileMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {profileMessage.text}
                  </div>
                )}

                <Form action={handleProfileSubmit}>
                  <FormField>
                    <FormLabel htmlFor="name">Full Name</FormLabel>
                    <FormInput id="name" name="name" required defaultValue={profile?.name || ""} />
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
                    <Button type="submit" disabled={updatingProfile}>
                      {updatingProfile ? "Updating..." : "Update Profile"}
                    </Button>
                  </div>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="church">
            <Card>
              <CardHeader>
                <CardTitle>Church Information</CardTitle>
              </CardHeader>
              <CardContent>
                {churchMessage && (
                  <div
                    className={`mb-4 p-3 rounded-md ${
                      churchMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {churchMessage.text}
                  </div>
                )}

                <Form action={handleChurchInfoSubmit}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField>
                      <FormLabel htmlFor="name">Church Name</FormLabel>
                      <FormInput id="name" name="name" required defaultValue={churchInfo?.name || ""} />
                    </FormField>

                    <FormField>
                      <FormLabel htmlFor="email">Church Email</FormLabel>
                      <FormInput id="email" name="email" type="email" required defaultValue={churchInfo?.email || ""} />
                    </FormField>

                    <FormField>
                      <FormLabel htmlFor="phone">Church Phone</FormLabel>
                      <FormInput id="phone" name="phone" required defaultValue={churchInfo?.phone || ""} />
                    </FormField>

                    <FormField>
                      <FormLabel htmlFor="address">Church Address</FormLabel>
                      <FormInput id="address" name="address" required defaultValue={churchInfo?.address || ""} />
                    </FormField>
                  </div>

                  <FormField className="mt-6">
                    <FormLabel htmlFor="mission">Mission Statement</FormLabel>
                    <FormTextarea
                      id="mission"
                      name="mission"
                      rows={3}
                      required
                      defaultValue={churchInfo?.mission || ""}
                    />
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="vision">Vision Statement</FormLabel>
                    <FormTextarea id="vision" name="vision" rows={3} required defaultValue={churchInfo?.vision || ""} />
                  </FormField>

                  <FormField>
                    <FormLabel htmlFor="history">Church History</FormLabel>
                    <FormTextarea
                      id="history"
                      name="history"
                      rows={5}
                      required
                      defaultValue={churchInfo?.history || ""}
                    />
                  </FormField>

                  <div className="mt-6">
                    <Button type="submit" disabled={updatingChurch}>
                      {updatingChurch ? "Updating..." : "Update Church Information"}
                    </Button>
                  </div>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

