import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatDate, formatTime } from "@/lib/utils"
import { deleteEvent } from "@/actions/event-actions"

export default async function AdminEventsPage() {
  await requireAdmin()

  // Fetch upcoming events
  const upcomingEvents = await prisma.event.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    include: { rsvps: { include: { user: true } } },
  })

  // Fetch past events
  const pastEvents = await prisma.event.findMany({
    where: { date: { lt: new Date() } },
    orderBy: { date: "desc" },
    take: 10,
    include: { rsvps: { include: { user: true } } },
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
            <p className="text-gray-600">Create and manage church events.</p>
          </div>
          <Link href="/admin/events/new">
            <Button>Create Event</Button>
          </Link>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Events</h2>

          {upcomingEvents.length > 0 ? (
            <div className="space-y-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{event.title}</CardTitle>
                      <div className="flex space-x-2">
                        <Link href={`/admin/events/${event.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <form action={async (formData: FormData) => { await deleteEvent(event.id); }}>
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
                        <p className="text-gray-600 mb-4">{event.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">Date:</span>
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Time:</span>
                            <span>{formatTime(event.date)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Location:</span>
                            <span>{event.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">RSVPs:</span>
                            <span>
                              {event.rsvps.length} {event.capacity ? `/ ${event.capacity}` : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Attendees</h3>
                        {event.rsvps.length > 0 ? (
                          <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                            {event.rsvps.map((rsvp) => (
                              <li key={rsvp.id} className="py-2">
                                <div
                                  className="
flex justify-between"
                                >
                                  <span className="font-medium">{rsvp.user.name}</span>
                                  <span className="text-gray-500">{rsvp.user.email}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No RSVPs yet.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">No upcoming events.</p>
                <Link href="/admin/events/new">
                  <Button>Create Event</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Past Events</h2>

          {pastEvents.length > 0 ? (
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
                          Event
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
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
                          Attendees
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pastEvents.map((event) => (
                        <tr key={event.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-500">{event.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(event.date)}</div>
                            <div className="text-sm text-gray-500">{formatTime(event.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{event.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{event.rsvps.length} attendees</div>
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
                <p className="text-gray-500">No past events.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

