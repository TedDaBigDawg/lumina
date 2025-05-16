import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatDate, formatTime } from "@/lib/utils"
import { updateThanksgivingStatus, deleteThanksgiving } from "@/actions/thanksgiving-actions"

export default async function AdminThanksgivingPage() {
  await requireAdmin()

  // Fetch all thanksgiving bookings with mass and user details
  const thanksgivings = await prisma.thanksgiving.findMany({
    orderBy: [
      { status: "asc" }, // PENDING first
      { mass: { date: "asc" } },
    ],
    include: {
      user: true,
      mass: true,
    },
  })

  // Group thanksgivings by status
  const pendingThanksgivings = thanksgivings.filter((thanksgiving) => thanksgiving.status === "PENDING")
  const approvedThanksgivings = thanksgivings.filter((thanksgiving) => thanksgiving.status === "APPROVED")
  const rejectedThanksgivings = thanksgivings.filter((thanksgiving) => thanksgiving.status === "REJECTED")

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage Thanksgiving Bookings</h1>
          <p className="text-gray-600">Review and manage thanksgiving service requests.</p>
        </div>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests ({pendingThanksgivings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingThanksgivings.length > 0 ? (
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
                          Requested By
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
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingThanksgivings.map((thanksgiving) => (
                        <tr key={thanksgiving.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{thanksgiving.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{thanksgiving.user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{thanksgiving.mass.title}</div>
                            <div className="text-sm text-gray-500">{thanksgiving.mass.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(thanksgiving.mass.date)}</div>
                            <div className="text-sm text-gray-500">{formatTime(thanksgiving.mass.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <form action={updateThanksgivingStatus.bind(null, thanksgiving.id, "APPROVED")}>
                                <Button variant="outline" size="sm" className="text-green-600 hover:text-green-800">
                                  Approve
                                </Button>
                              </form>
                              <form action={updateThanksgivingStatus.bind(null, thanksgiving.id, "REJECTED")}>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                                  Reject
                                </Button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No pending thanksgiving requests.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Approved Requests ({approvedThanksgivings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {approvedThanksgivings.length > 0 ? (
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
                          Requested By
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
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {approvedThanksgivings.map((thanksgiving) => (
                        <tr key={thanksgiving.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{thanksgiving.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{thanksgiving.user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{thanksgiving.mass.title}</div>
                            <div className="text-sm text-gray-500">{thanksgiving.mass.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(thanksgiving.mass.date)}</div>
                            <div className="text-sm text-gray-500">{formatTime(thanksgiving.mass.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <form action={deleteThanksgiving.bind(null, thanksgiving.id)}>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                                Delete
                              </Button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No approved thanksgiving requests.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Rejected Requests ({rejectedThanksgivings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {rejectedThanksgivings.length > 0 ? (
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
                          Requested By
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
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rejectedThanksgivings.map((thanksgiving) => (
                        <tr key={thanksgiving.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{thanksgiving.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{thanksgiving.user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{thanksgiving.mass.title}</div>
                            <div className="text-sm text-gray-500">{thanksgiving.mass.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(thanksgiving.mass.date)}</div>
                            <div className="text-sm text-gray-500">{formatTime(thanksgiving.mass.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <form action={updateThanksgivingStatus.bind(null, thanksgiving.id, "APPROVED")}>
                                <Button variant="outline" size="sm" className="text-green-600 hover:text-green-800">
                                  Approve
                                </Button>
                              </form>
                              <form action={deleteThanksgiving.bind(null, thanksgiving.id)}>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                                  Delete
                                </Button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No rejected thanksgiving requests.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

