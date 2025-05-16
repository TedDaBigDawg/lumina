"use client"

import { useEffect, useState } from "react"

// Use Prisma's MassStatus type
import type { $Enums } from "@prisma/client"
type MassStatus = $Enums.MassStatus
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, formatTime } from "@/lib/utils"
import {
  getPastMassIntentions,
  getPastMassIntentionsCount,
  getUpcomingMassIntentions,
  getUpcomingMassIntentionsCount,
} from "@/actions/mass-intention-actions"
// Update the Dialog and DialogContent imports to include custom styling
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Loading from "@/app/loading"

// Define a type for the intention object
type Intention = {
  id: string
  name: string
  intention: string
  status: string
  mass: {
    id: string
    createdAt: Date
    updatedAt: Date
    status: MassStatus
    title: string
    date: Date
    location: string
    availableIntentionsSlots: number
    availableThanksgivingsSlots: number
  }
}

// Add this loading skeleton component
const LoadingSkeleton = () => (
    <div className="justify-center items-center bg-gray-200 rounded mb-2 animate-pulse" >
        {/* <Loading /> */}
        <p className="text-gray-500 ">Loading...</p>
    </div>
)

export default function MassIntentionsPage() {
  const itemsPerPage = 5

  // Separate pagination states for upcoming and past intentions
  const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1)
  const [pastCurrentPage, setPastCurrentPage] = useState(1)

  const [upcomingIntentions, setUpcomingIntentions] = useState<Intention[]>([])
  const [pastIntentions, setPastIntentions] = useState<Intention[]>([])

  const [totalUpcoming, setTotalUpcoming] = useState(0)
  const [totalPast, setTotalPast] = useState(0)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedIntention, setSelectedIntention] = useState<Intention | null>(null)


  const [upcomingLoading, setUpcomingLoading] = useState(true)
  const [pastLoading, setPastLoading] = useState(true)

  const totalUpcomingPages = Math.ceil(totalUpcoming / itemsPerPage)
  const totalPastPages = Math.ceil(totalPast / itemsPerPage)

  // Fetch upcoming intentions when upcomingCurrentPage changes
  useEffect(() => {
    async function fetchUpcomingData() {
      setUpcomingLoading(true)
      try {
        const upcoming = await getUpcomingMassIntentions(upcomingCurrentPage)
        const totalUp = await getUpcomingMassIntentionsCount()

        setUpcomingIntentions(upcoming.upcomingMassIntentions)
        setTotalUpcoming(Number(totalUp))
      } catch (error) {
        console.error("Failed to fetch upcoming intentions:", error)
      } finally {
        setUpcomingLoading(false)
      }
    }

    fetchUpcomingData()
  }, [upcomingCurrentPage])

  // Fetch past intentions when pastCurrentPage changes
  useEffect(() => {
    async function fetchPastData() {
      setPastLoading(true)
      try {
        const past = await getPastMassIntentions(pastCurrentPage)
        const totalPastCount = await getPastMassIntentionsCount()

        if (Array.isArray(past)) {
          setPastIntentions(past)
        } else {
          console.error("Failed to fetch past intentions:", past)
          setPastIntentions([]) // Reset to an empty array on error
        }

        setTotalPast(Number(totalPastCount))
      } catch (error) {
        console.error("Failed to fetch past intentions:", error)
        setPastIntentions([])
      } finally {
        setPastLoading(false)
      }
    }

    fetchPastData()
  }, [pastCurrentPage])


  // Pagination handlers for upcoming intentions
  const handleUpcomingPrevious = () => {
    if (upcomingCurrentPage > 1) setUpcomingCurrentPage((prev) => prev - 1)
  }

  const handleUpcomingNext = () => {
    if (upcomingCurrentPage < totalUpcomingPages) setUpcomingCurrentPage((prev) => prev + 1)
  }

  // Pagination handlers for past intentions
  const handlePastPrevious = () => {
    if (pastCurrentPage > 1) setPastCurrentPage((prev) => prev - 1)
  }

  const handlePastNext = () => {
    if (pastCurrentPage < totalPastPages) setPastCurrentPage((prev) => prev + 1)
  }

  // Handler for opening the modal with the selected intention
  const handleIntentionClick = (intention: Intention) => {
    setSelectedIntention(intention)
    setIsModalOpen(true)
  }

  // Function to render intention row with click handler
  const renderIntentionRow = (intention: Intention) => (
    <tr
      key={intention.id}
      onClick={() => handleIntentionClick(intention)}
      className="cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <td className="px-6 py-4">{intention.name}</td>
      {/* <td className="px-6 py-4">{intention.intention}</td> */}
      <td className="px-6 py-4">
        <div>{intention.mass.title}</div>
        {/* <div className="text-sm text-gray-500">{intention.mass.location}</div> */}
      </td>
      <td className="px-6 py-4">
        <div>{formatDate(intention.mass.date)}</div>
        <div className="text-sm text-gray-500">{formatTime(intention.mass.date)}</div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            intention.status === "APPROVED"
              ? "bg-green-100 text-green-800"
              : intention.status === "REJECTED"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {intention.status}
        </span>
      </td>
    </tr>
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mass Intentions</h1>
            <p className="text-gray-600">Request Mass intentions for your loved ones.</p>
          </div>
          <Link href="/dashboard/mass-intentions/new">
            <Button>New Intention</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Upcoming Mass Intentions</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingLoading ? (
            <div className="h-10 flex justify-center items-center py-8">
            <LoadingSkeleton />
          </div>
          ) : upcomingIntentions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Intention
                      </th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mass
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {upcomingIntentions.map(renderIntentionRow)}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You don't have any upcoming Mass intentions yet.</p>
                <Link href="/dashboard/mass-intentions/new">
                  <Button>Request Mass Intention</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination for upcoming intentions */}
        {totalUpcomingPages > 1 && (
          <div className="flex justify-between mt-4">
            <Button disabled={upcomingCurrentPage <= 1} onClick={handleUpcomingPrevious}>
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {upcomingCurrentPage} of {totalUpcomingPages}
            </span>
            <Button disabled={upcomingCurrentPage >= totalUpcomingPages} onClick={handleUpcomingNext}>
              Next
            </Button>
          </div>
        )}

        {/* Past Intentions Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Your Past Mass Intentions</CardTitle>
          </CardHeader>
          <CardContent>
            {pastLoading ? (
              <div className="h-10 flex justify-center items-center py-8">
                <LoadingSkeleton />
              </div>
          ) : pastIntentions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Intention
                      </th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mass
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">{pastIntentions.map(renderIntentionRow)}</tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">You don't have any past Mass intentions.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination for past intentions */}
        {totalPastPages > 1 && (
          <div className="flex justify-between mt-4">
            <Button disabled={pastCurrentPage <= 1} onClick={handlePastPrevious}>
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pastCurrentPage} of {totalPastPages}
            </span>
            <Button disabled={pastCurrentPage >= totalPastPages} onClick={handlePastNext}>
              Next
            </Button>
          </div>
        )}

        {/* Intention Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent
            className="sm:max-w-md md:max-w-lg bg-white border shadow-lg"
            style={{
              opacity: 1,
              zIndex: 50,
              backdropFilter: "blur(4px)",
            }}
          >
            <DialogHeader className="border-b pb-2">
              <DialogTitle className="text-xl font-semibold text-gray-900">Mass Intention Details</DialogTitle>
              <DialogDescription className="text-gray-600">
                Complete information about this mass intention.
              </DialogDescription>
              <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </DialogHeader>

            {selectedIntention && (
              <div className="grid gap-4 py-4 bg-white">
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Name:</span>
                  <span className="col-span-3 text-gray-900">{selectedIntention.name}</span>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <span className="text-sm font-medium text-gray-700">Intention:</span>
                  <span className="col-span-3 text-gray-900">{selectedIntention.intention}</span>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Mass Title:</span>
                  <span className="col-span-3 text-gray-900">{selectedIntention.mass.title}</span>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Location:</span>
                  <span className="col-span-3 text-gray-900">{selectedIntention.mass.location}</span>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Date:</span>
                  <span className="col-span-3 text-gray-900">{formatDate(selectedIntention.mass.date)}</span>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Time:</span>
                  <span className="col-span-3 text-gray-900">{formatTime(selectedIntention.mass.date)}</span>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className="col-span-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedIntention.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : selectedIntention.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedIntention.status}
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Created:</span>
                  <span className="col-span-3 text-gray-900">{formatDate(selectedIntention.mass.createdAt)}</span>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Last Updated:</span>
                  <span className="col-span-3 text-gray-900">{formatDate(selectedIntention.mass.updatedAt)}</span>
                </div>
              </div>
            )}

            <DialogFooter className="border-t pt-4 mt-2">
              <Button onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
