import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatDate, formatTime } from "@/lib/utils"

export default async function EventsPage() {
  const user = await requireAuth()

  // Fetch upcoming events
  const events = await prisma.event.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    include: {
      rsvps: {
        where: { userId: user.id },
      },
    },
  })

  // Fetch past events the user has RSVP'd to
  const pastEvents = await prisma.event.findMany({
    where: {
      date: { lt: new Date() },
      rsvps: { some: { userId: user.id } },
    },
    orderBy: { date: "desc" },
    include: {
      rsvps: {
        where: { userId: user.id },
      },
    },
    take: 5,
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Church Events</h1>
          <p className="text-gray-600">View and RSVP to upcoming church events.</p>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Events</h2>

          {events.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => {
                const hasRsvp = event.rsvps.length > 0
                return (
                  <Card key={event.id} className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle>{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="mb-4">
                        <p className="text-gray-600">{event.description}</p>
                      </div>
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
                        {event.capacity && (
                          <div className="flex justify-between">
                            <span className="font-medium">Capacity:</span>
                            <span>{event.capacity}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-6">
                        {hasRsvp ? (
                          <form action={`/dashboard/events/${event.id}/cancel-rsvp`}>
                            <Button variant="outline" className="w-full" type="submit">
                              Cancel RSVP
                            </Button>
                          </form>
                        ) : (
                          <form action={`/dashboard/events/${event.id}/rsvp`}>
                            <Button className="w-full" type="submit">
                              RSVP
                            </Button>
                          </form>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">No upcoming events at this time.</p>
                <p className="text-gray-500">Check back later for new events.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Past Events You Attended</h2>

            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-gray-200">
                  {pastEvents.map((event) => (
                    <li key={event.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                          <p className="text-gray-600 mt-1">{event.description}</p>
                          <div className="mt-2 text-sm text-gray-500">
                            <p>
                              {formatDate(event.date)} at {formatTime(event.date)}
                            </p>
                            <p>{event.location}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

