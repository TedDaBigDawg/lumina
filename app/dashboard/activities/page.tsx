"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { getUserActivities, markAllActivitiesAsRead } from "@/actions/activity-actions"
import {
  Bell,
  Check,
  DollarSign,
  Calendar,
  BookOpen,
  Heart,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface Activity {
  id: string
  action: string
  type: string
  entityId: string | null
  entityType: string | null
  read: boolean
  createdAt: Date
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    async function fetchActivities() {
      try {
        const data = await getUserActivities()
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

  async function handleMarkAllAsRead() {
    try {
      await markAllActivitiesAsRead()
      setActivities(activities.map((activity) => ({ ...activity, read: true })))
    } catch (error) {
      console.error("Error marking activities as read:", error)
    }
  }

  // Function to get icon based on entity type
  const getActivityIcon = (activity: Activity) => {
    switch (activity.entityType) {
      case "Payment":
        return <DollarSign className="h-5 w-5" />
      case "MassIntention":
        return <BookOpen className="h-5 w-5" />
      case "Thanksgiving":
        return <Heart className="h-5 w-5" />
      case "Event":
        return <Calendar className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  // Function to get color theme based on entity type
  const getActivityTheme = (activity: Activity) => {
    switch (activity.entityType) {
      case "Payment":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          icon: "bg-green-100 text-green-600",
          title: "text-green-800",
        }
      case "MassIntention":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          icon: "bg-blue-100 text-blue-600",
          title: "text-blue-800",
        }
      case "Thanksgiving":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          icon: "bg-red-100 text-red-600",
          title: "text-red-800",
        }
      case "Event":
        return {
          bg: "bg-purple-50",
          border: "border-purple-200",
          icon: "bg-purple-100 text-purple-600",
          title: "text-purple-800",
        }
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          icon: "bg-gray-100 text-gray-600",
          title: "text-gray-800",
        }
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(activities.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentActivities = activities.slice(indexOfFirstItem, indexOfLastItem)

  // Function to change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // Scroll to top of activities section
    document.getElementById("activities-section")?.scrollIntoView({ behavior: "smooth" })
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max to show
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always include current page
      pageNumbers.push(currentPage)

      // Add previous page if not first page
      if (currentPage > 1) {
        pageNumbers.unshift(currentPage - 1)
      }

      // Add next page if not last page
      if (currentPage < totalPages) {
        pageNumbers.push(currentPage + 1)
      }

      // If we still have room and not showing first page, add first page
      if (pageNumbers.length < maxPagesToShow && !pageNumbers.includes(1)) {
        pageNumbers.unshift(1)
      }

      // If we still have room and not showing last page, add last page
      if (pageNumbers.length < maxPagesToShow && !pageNumbers.includes(totalPages)) {
        pageNumbers.push(totalPages)
      }

      // Sort the page numbers
      pageNumbers.sort((a, b) => a - b)

      // Add ellipsis where needed
      const result = []
      let lastNum = 0

      for (const num of pageNumbers) {
        if (lastNum && num - lastNum > 1) {
          result.push("ellipsis")
        }
        result.push(num)
        lastNum = num
      }

      return result
    }

    return pageNumbers
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Activities</h1>
            <p className="text-gray-600 text-sm sm:text-base">Track your recent activities and notifications.</p>
          </div>
          {activities.some((activity) => !activity.read) && (
            <Button
              onClick={handleMarkAllAsRead}
              className="self-start sm:self-auto whitespace-nowrap text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2.5 
              bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md 
              transition-all duration-200 min-h-[40px] min-w-[120px] flex items-center justify-center
              border-0 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Check className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-4 sm:w-4" />
              <span>Mark All as Read</span>
            </Button>
          )}
        </div>

        <div className="mb-6" id="activities-section">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
            {activities.length > 0 && (
              <p className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, activities.length)} of {activities.length}
              </p>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activities.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentActivities.map((activity) => {
                  const theme = getActivityTheme(activity)
                  return (
                    <Card
                      key={activity.id}
                      className={`overflow-hidden transition-all duration-200 hover:shadow-md ${!activity.read ? "ring-2 ring-blue-400 shadow-md" : "shadow-sm"} ${theme.bg} border ${theme.border}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 p-2 rounded-full ${theme.icon}`}>
                            {getActivityIcon(activity)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between items-start">
                                <h3 className={`text-sm font-semibold break-words ${theme.title}`}>
                                  {activity.entityType}
                                </h3>
                                {!activity.read && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 break-words">{activity.action}</p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {formatDate(activity.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex items-center space-x-1" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1 text-sm rounded-md"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="hidden sm:flex items-center space-x-1">
                      {getPageNumbers().map((page, index) =>
                        page === "ellipsis" ? (
                          <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-500">
                            ...
                          </span>
                        ) : (
                          <Button
                            key={`page-${page}`}
                            variant={currentPage === page ? "primary" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(Number(page))}
                            className={`px-3 py-1 text-sm rounded-md ${
                              currentPage === page
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                            aria-current={currentPage === page ? "page" : undefined}
                            aria-label={`Page ${page}`}
                          >
                            {page}
                          </Button>
                        ),
                      )}
                    </div>

                    <div className="sm:hidden flex items-center">
                      <span className="text-sm text-gray-700">
                        {currentPage} / {totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 text-sm rounded-md"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <Card className="bg-white shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <Bell className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No activities</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  You don't have any activities yet. When you perform actions, they will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

