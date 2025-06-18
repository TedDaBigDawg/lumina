import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import { getUserActivities } from "@/actions/activity-actions"
import { Bell, Calendar, FileText, Heart, PlusCircle, Target, Users } from "lucide-react"

export default async function DashboardPage() {
  const user = await requireAuth()

  // Fetch recent mass intentions
  const massIntentions = await prisma.massIntention.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { mass: true },
  })

  // Fetch recent thanksgiving bookings
  const thanksgivings = await prisma.thanksgiving.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { mass: true },
  })

  // Fetch recent payments
  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { goal: true },
  })

  // Fetch upcoming events
  const events = await prisma.event.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 3,
  })

  // Fetch recent activities
  const activities = await getUserActivities(5)

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600">Manage your church activities and contributions.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/mass-intentions" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Mass Intentions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Request Mass intentions for your loved ones.</p>
                <Button variant="outline" className="w-full">
                  View All
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/thanksgiving" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Thanksgiving</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Book thanksgiving services for special occasions.</p>
                <Button variant="outline" className="w-full">
                  View All
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/payments" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Support our church through donations and offerings.</p>
                <Button variant="outline" className="w-full">
                  View All
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/events" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">View and RSVP to upcoming church events.</p>
                <Button variant="outline" className="w-full">
                  View All
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activities</CardTitle>
              <Link href="/dashboard/activities">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <li key={activity.id} className={`py-3 ${!activity.read ? "bg-blue-50 rounded-md px-2" : ""}`}>
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 text-blue-500 mr-3" />
                        <div className="flex-1">
                          <p className={`text-sm ${!activity.read ? "font-medium text-[#1a1a1a]" : "text-gray-900"}`}>
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                        </div>
                        {!activity.read && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No recent activities.</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
            <Card>
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
                <CardDescription>Common parishioner tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:gap-4">
                  {/* First row of actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <QuickActionButton
                      href="/dashboard/mass-intentions/new"
                      icon={<Calendar className="h-4 w-4 mr-2" />}
                      label="Book Intentions"
                      primary
                    />
                    <QuickActionButton
                      href="/dashboard/thanksgiving/new"
                      icon={<Target className="h-4 w-4 mr-2" />}
                      label="Book Thanksgiving"
                      primary
                    />
                  </div>
  
                  {/* Second row of actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <QuickActionButton
                      href="/dashboard/donations/new"
                      icon={<FileText className="h-4 w-4 mr-2" />}
                      label="Make Donation"
                    />
                    <QuickActionButton
                      href="/dashboard/thanksgiving"
                      icon={<Heart className="h-4 w-4 mr-2" />}
                      label="Manage Thanksgivings"
                    />
                  </div>
  
                  {/* Additional actions can be added here
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <QuickActionButton
                      href="/admin/events/new"
                      icon={<PlusCircle className="h-4 w-4 mr-2" />}
                      label="Create Event"
                    />
                    <QuickActionButton
                      href="/admin/users"
                      icon={<Users className="h-4 w-4 mr-2" />}
                      label="Manage Users"
                    />
                  </div> */}
                </div>
              </CardContent>
            </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Mass Intentions</CardTitle>
            </CardHeader>
            <CardContent>
              {massIntentions.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {massIntentions.map((intention) => (
                    <li key={intention.id} className="py-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{intention.name}</p>
                          <p className="text-sm text-gray-500">{intention.intention}</p>
                        </div>
                        <div className="text-sm text-gray-500">{formatDate(intention.mass.date)}</div>
                      </div>
                      <div className="mt-1">
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
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No recent mass intentions.</p>
              )}

              <div className="mt-4">
                <Link href="/dashboard/mass-intentions">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <li key={payment.id} className="py-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">
                            {payment.type === "DONATION"
                              ? `Donation (${payment.category?.replace("_", " ")})`
                              : "Offering"}
                          </p>
                          {payment.description && <p className="text-sm text-gray-500">{payment.description}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${payment.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{formatDate(payment.createdAt)}</p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payment.status === "PAID"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "FAILED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                      </div>
                      {payment.status === "UNPAID" && (
                        <div className="mt-2">
                          <Link href={`/dashboard/payments/${payment.id}/pay`}>
                            <Button size="sm" variant="outline" className="w-full">
                              Complete Payment
                            </Button>
                          </Link>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No recent donations.</p>
              )}

              <div className="mt-4">
                <Link href="/dashboard/payments">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <li key={event.id} className="py-3">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                        <p className="text-sm text-gray-500">{event.location}</p>
                      </div>
                      <div className="mt-2">
                        <Link href={`/dashboard/events/${event.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No upcoming events.</p>
              )}

              <div className="mt-4">
                <Link href="/dashboard/events">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function QuickActionButton({
  href,
  icon,
  label,
  primary = false,
}: {
  href: string
  icon: React.ReactNode
  label: string
  primary?: boolean
}) {
  return (
    <Button
        variant={primary ? "default" : "outline"}
        className="w-full h-auto py-3 px-4 flex items-center justify-center text-sm font-medium"
      >
    <Link href={href} className="flex mx-auto items-center justify-center">
        {icon}
        <span className="truncate">{label}</span>
    </Link>
      </Button>
  )
}


