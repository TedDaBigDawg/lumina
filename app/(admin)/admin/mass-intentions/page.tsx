import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatDate, formatTime } from "@/lib/utils"
import { updateMassIntentionStatus, deleteMassIntention } from "@/actions/mass-intention-actions"

export default async function AdminMassIntentionsPage() {
  await requireAdmin()

  // Fetch all mass intentions with mass and user details
  const massIntentions = await prisma.massIntention.findMany({
    orderBy: [
      { status: "asc" }, // PENDING first
      { mass: { date: "asc" } },
    ],
    include: {
      user: true,
      mass: true,
    },
  })

  // Group intentions by status
  const pendingIntentions = massIntentions.filter((intention) => intention.status === "PENDING")
  const approvedIntentions = massIntentions.filter((intention) => intention.status === "APPROVED")
  const rejectedIntentions = massIntentions.filter((intention) => intention.status === "REJECTED")

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage Mass Intentions</h1>
          <p className="text-gray-600">Review and manage mass intention requests.</p>
        </div>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests ({pendingIntentions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingIntentions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Intention
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
                      {pendingIntentions.map((intention) => (
                        <tr key={intention.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{intention.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">{intention.intention}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{intention.user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{intention.mass.title}</div>
                            <div className="text-sm text-gray-500">{intention.mass.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(intention.mass.date)}</div>
                            <div className="text-sm text-gray-500">{formatTime(intention.mass.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <form action={updateMassIntentionStatus.bind(null, intention.id, "APPROVED")}>
                                <Button variant="outline" size="sm" className="text-green-600 hover:text-green-800">
                                  Approve
                                </Button>
                              </form>
                              <form action={updateMassIntentionStatus.bind(null, intention.id, "REJECTED")}>
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
                <p className="text-gray-500 text-center py-4">No pending mass intention requests.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Approved Requests ({approvedIntentions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {approvedIntentions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Intention
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
                      {approvedIntentions.map((intention) => (
                        <tr key={intention.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{intention.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">{intention.intention}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{intention.user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{intention.mass.title}</div>
                            <div className="text-sm text-gray-500">{intention.mass.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(intention.mass.date)}</div>
                            <div className="text-sm text-gray-500">{formatTime(intention.mass.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <form action={deleteMassIntention.bind(null, intention.id)}>
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
                <p className="text-gray-500 text-center py-4">No approved mass intention requests.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Rejected Requests ({rejectedIntentions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {rejectedIntentions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Intention
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
                      {rejectedIntentions.map((intention) => (
                        <tr key={intention.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{intention.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">{intention.intention}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{intention.user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{intention.mass.title}</div>
                            <div className="text-sm text-gray-500">{intention.mass.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(intention.mass.date)}</div>
                            <div className="text-sm text-gray-500">{formatTime(intention.mass.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <form action={updateMassIntentionStatus.bind(null, intention.id, "APPROVED")}>
                                <Button variant="outline" size="sm" className="text-green-600 hover:text-green-800">
                                  Approve
                                </Button>
                              </form>
                              <form action={deleteMassIntention.bind(null, intention.id)}>
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
                <p className="text-gray-500 text-center py-4">No rejected mass intention requests.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

