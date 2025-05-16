import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatDate, formatTime } from "@/lib/utils"

export default async function ThanksgivingPage() {
  const user = await requireAuth()

  // Fetch all thanksgiving bookings for the user with mass details
  const thanksgivings = await prisma.thanksgiving.findMany({
    where: { userId: user.id },
    orderBy: { mass: { date: "desc" } },
    include: { mass: true },
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thanksgiving Bookings</h1>
            <p className="text-gray-600">Book thanksgiving services for special occasions.</p>
          </div>
          <Link href="/dashboard/thanksgiving/new">
            <Button>New Booking</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Thanksgiving Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {thanksgivings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Mass
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date & Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {thanksgivings.map((thanksgiving) => (
                      <tr key={thanksgiving.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{thanksgiving.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{thanksgiving.mass.title}</div>
                          <div className="text-sm text-gray-500">{thanksgiving.mass.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(thanksgiving.mass.date)}</div>
                          <div className="text-sm text-gray-500">{formatTime(thanksgiving.mass.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              thanksgiving.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : thanksgiving.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {thanksgiving.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't booked any thanksgiving services yet.</p>
                <Link href="/dashboard/thanksgiving/new">
                  <Button>Book Thanksgiving Service</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

