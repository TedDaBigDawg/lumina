import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatDate, formatTime } from "@/lib/utils"
import { deleteMass } from "@/actions/mass-actions"

export default async function AdminMassesPage() {
  await requireAdmin()

  // Fetch all masses
  const masses = await prisma.mass.findMany({
    orderBy: { date: "asc" },
    include: {
      _count: {
        select: {
          massIntentions: true,
          thanksgivings: true,
        },
      },
    },
  })

  // Group masses by upcoming and past
  const now = new Date()
  const upcomingMasses = masses.filter((mass) => mass.date >= now)
  const pastMasses = masses.filter((mass) => mass.date < now)

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Masses</h1>
            <p className="text-gray-600">Create and manage masses with intention and thanksgiving slots.</p>
          </div>
          <Link href="/admin/masses/new">
            <Button>Create Mass</Button>
          </Link>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Masses</h2>

          {upcomingMasses.length > 0 ? (
            <div className="space-y-6">
              {upcomingMasses.map((mass) => (
                <Card key={mass.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{mass.title}</CardTitle>
                      <div className="flex space-x-2">
                        <Link href={`/admin/masses/${mass.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <form action={deleteMass.bind(null, mass.id)}>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">Date:</span>
                            <span>{formatDate(mass.date)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Time:</span>
                            <span>{formatTime(mass.date)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Location:</span>
                            <span>{mass.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Status:</span>
                            <span className={`${mass.status === "AVAILABLE" ? "text-green-600" : "text-red-600"}`}>
                              {mass.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Slot Availability</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Mass Intentions:</span>
                            <div className="flex items-center">
                              <span className="font-medium mr-2">
                                {mass._count.massIntentions} booked /{" "}
                                {mass._count.massIntentions + mass.availableIntentionsSlots} total
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  mass.availableIntentionsSlots > 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {mass.availableIntentionsSlots} available
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Thanksgiving:</span>
                            <div className="flex items-center">
                              <span className="font-medium mr-2">
                                {mass._count.thanksgivings} booked /{" "}
                                {mass._count.thanksgivings + mass.availableThanksgivingsSlots} total
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  mass.availableThanksgivingsSlots > 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {mass.availableThanksgivingsSlots} available
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">No upcoming masses.</p>
                <Link href="/admin/masses/new">
                  <Button>Create Mass</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Past Masses</h2>

          {pastMasses.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
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
                          Location
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Intentions
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Thanksgivings
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pastMasses.map((mass) => (
                        <tr key={mass.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{mass.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(mass.date)}</div>
                            <div className="text-sm text-gray-500">{formatTime(mass.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{mass.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{mass._count.massIntentions} booked</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{mass._count.thanksgivings} booked</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No past masses.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

