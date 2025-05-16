"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { getAdminActivities } from "@/actions/activity-actions"
import { Bell, DollarSign, Calendar, BookOpen, Heart, AlertTriangle, User } from "lucide-react"

interface Activity {
  id: string
  action: string
  type: string
  entityId: string | null
  entityType: string | null
  read: boolean
  createdAt: Date
  user: {
    name: string
    email: string
  }
}

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivities() {
      try {
        const data = await getAdminActivities()
        setActivities(data)
      } catch (error) {
        console.error("Error fetching activities:", error)
        setError("Failed to load activities")
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  // Function to get icon based on entity type
  const getActivityIcon = (activity: Activity) => {
    switch (activity.entityType) {
      case "Payment":
        return <DollarSign className="h-5 w-5 text-green-500" />
      case "MassIntention":
        return <BookOpen className="h-5 w-5 text-blue-500" />
      case "Thanksgiving":
        return <Heart className="h-5 w-5 text-red-500" />
      case "Event":
        return <Calendar className="h-5 w-5 text-purple-500" />
      case "User":
        return <User className="h-5 w-5 text-orange-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // Function to get action link based on entity type
  const getActionLink = (activity: Activity) => {
    if (!activity.entityId) return null

    switch (activity.entityType) {
      case "MassIntention":
        return (
          <Link href="/admin/mass-intentions">
            <Button size="sm" variant="outline">
              View Mass Intentions
            </Button>
          </Link>
        )
      case "Thanksgiving":
        return (
          <Link href="/admin/thanksgiving">
            <Button size="sm" variant="outline">
              View Thanksgivings
            </Button>
          </Link>
        )
      case "Payment":
        return (
          <Link href="/admin/payments">
            <Button size="sm" variant="outline">
              View Payments
            </Button>
          </Link>
        )
      default:
        return null
    }
  }

  // Function to check if activity requires action
  const requiresAction = (activity: Activity) => {
    return (
      activity.action.includes("New") || activity.action.includes("request") || activity.action.includes("registered")
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Activities</h1>
          <p className="text-gray-600">Monitor church activities and notifications.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">{error}</div>}

            {activities.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {activities.map((activity) => (
                  <li key={activity.id} className={`py-4 ${requiresAction(activity) ? "bg-yellow-50" : ""}`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">{getActivityIcon(activity)}</div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm font-medium ${requiresAction(activity) ? "text-yellow-900" : "text-gray-900"}`}
                          >
                            {activity.action}
                          </p>
                          <p className="text-sm text-gray-500">{formatDate(activity.createdAt)}</p>
                        </div>
                        {requiresAction(activity) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Action Required
                          </span>
                        )}
                        <div className="mt-2">{getActionLink(activity)}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No activities</h3>
                <p className="mt-1 text-sm text-gray-500">There are no admin activities yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

