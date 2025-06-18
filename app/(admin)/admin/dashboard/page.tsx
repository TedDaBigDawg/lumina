import type React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getAdminActivities } from "@/actions/activity-actions"
import { Bell, AlertTriangle, Calendar, DollarSign, Users, PlusCircle, Target, FileText, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function AdminDashboardPage() {
  const user = await requireAdmin()

  // Fetch counts for various entities
  const pendingMassIntentions = await prisma.massIntention.count({
    where: { status: "PENDING" },
  })

  const pendingThanksgivings = await prisma.thanksgiving.count({
    where: { status: "PENDING" },
  })

  const upcomingEvents = await prisma.event.count({
    where: { date: { gte: new Date() } },
  })

  const upcomingMasses = await prisma.mass.count({
    where: { date: { gte: new Date() } },
  })

  // Fetch payment statistics
  const totalPayments = await prisma.payment.aggregate({
    where: { status: "PAID" },
    _sum: { amount: true },
  })

  const paymentsByType = await prisma.$queryRaw<{ type: string; total: number }[]>`
    SELECT "type", SUM("amount") as total
    FROM "Payment"
    WHERE "status" = 'PAID'
    GROUP BY "type"
    ORDER BY total DESC
  `

  // Fetch recent activities
  const activities = await getAdminActivities(5)

  // Fetch recent mass intentions
  const recentMassIntentions = await prisma.massIntention.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  })

  // Fetch recent thanksgivings
  const recentThanksgivings = await prisma.thanksgiving.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  })

  // Fetch recent payments
  const recentPayments = await prisma.payment.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  })

  // Function to check if activity requires action
  const requiresAction = (activity: any) => {
    return (
      activity.action.includes("New") || activity.action.includes("request") || activity.action.includes("registered")
    )
  }

  function formatCompactNumber(value: number): string {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toString()
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Dashboard Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
          <p className="text-gray-600">Manage church activities and monitor statistics.</p>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
          <StatsCard
            title="Pending Mass Intentions"
            value={pendingMassIntentions}
            href="/admin/mass-intentions"
            icon={<FileText className="h-5 w-5 text-[#1a1a1a]" />}
          />

          <StatsCard
            title="Pending Thanksgivings"
            value={pendingThanksgivings}
            href="/admin/thanksgiving"
            icon={<Heart className="h-5 w-5 text-rose-600" />}
          />

          <StatsCard
            title="Upcoming Masses"
            value={upcomingMasses}
            href="/admin/masses"
            icon={<Calendar className="h-5 w-5 text-purple-600" />}
          />

          <StatsCard
            title="Upcoming Events"
            value={upcomingEvents}
            href="/admin/events"
            icon={<Users className="h-5 w-5 text-green-600" />}
          />

          <StatsCard
            title="Total Contributions"
            value={formatCompactNumber(totalPayments._sum.amount || 0)}
            href="/admin/payments"
            icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
            tooltip={formatCurrency(totalPayments._sum.amount || 0)}
          />
        </div>

        {/* Middle Section: Activities and Quick Actions */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 mb-6 md:mb-8">
          {/* Recent Activities Card */}
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-4">
              <div>
                <CardTitle className="text-lg md:text-xl">Recent Activities</CardTitle>
                <CardDescription>Latest actions and notifications</CardDescription>
              </div>
              <Link href="/admin/activities">
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs md:text-sm whitespace-nowrap">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {activities.map((activity) => (
                    <li
                      key={activity.id}
                      className={`py-3 ${requiresAction(activity) ? "bg-amber-50 rounded-md px-3 -mx-3" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <Bell
                          className={`h-5 w-5 mt-0.5 ${requiresAction(activity) ? "text-amber-500" : "text-blue-500"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              requiresAction(activity) ? "font-medium text-amber-900" : "text-gray-900"
                            }`}
                          >
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatDate(activity.createdAt)}</p>
                        </div>
                        {requiresAction(activity) && (
                          <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-800 border-amber-200 whitespace-nowrap text-xs"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No recent activities.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:gap-4">
                {/* First row of actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <QuickActionButton
                    href="/admin/masses/new"
                    icon={<Calendar className="h-4 w-4 mr-2" />}
                    label="Create Mass"
                    primary
                  />
                  <QuickActionButton
                    href="/admin/payments/goals/new"
                    icon={<Target className="h-4 w-4 mr-2" />}
                    label="New Fundraising Goal"
                    primary
                  />
                </div>

                {/* Second row of actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <QuickActionButton
                    href="/admin/mass-intentions"
                    icon={<FileText className="h-4 w-4 mr-2" />}
                    label="Manage Intentions"
                  />
                  <QuickActionButton
                    href="/admin/thanksgiving"
                    icon={<Heart className="h-4 w-4 mr-2" />}
                    label="Manage Thanksgivings"
                  />
                </div>

                {/* Additional actions can be added here */}
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
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section: Recent Data Cards */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Mass Intentions */}
          <RecentDataCard
            title="Recent Mass Intentions"
            emptyMessage="No recent mass intentions."
            data={recentMassIntentions}
            renderItem={(intention) => (
              <li key={intention.id} className="py-3">
                <div>
                  <p className="font-medium truncate">{intention.name}</p>
                  <p className="text-sm text-gray-500 line-clamp-1">{intention.intention}</p>
                </div>
                <div className="mt-1.5 flex justify-between items-center">
                  <span className="text-xs text-gray-500 truncate max-w-[60%]">By {intention.user.name}</span>
                  <StatusBadge status={intention.status} />
                </div>
              </li>
            )}
          />

          {/* Recent Thanksgivings */}
          <RecentDataCard
            title="Recent Thanksgivings"
            emptyMessage="No recent thanksgiving bookings."
            data={recentThanksgivings}
            renderItem={(thanksgiving) => (
              <li key={thanksgiving.id} className="py-3">
                <div>
                  <p className="font-medium line-clamp-2">{thanksgiving.description}</p>
                </div>
                <div className="mt-1.5 flex justify-between items-center">
                  <span className="text-xs text-gray-500 truncate max-w-[60%]">By {thanksgiving.user.name}</span>
                  <StatusBadge status={thanksgiving.status} />
                </div>
              </li>
            )}
          />

          {/* Recent Contributions */}
          <RecentDataCard
            title="Recent Contributions"
            emptyMessage="No recent contributions."
            data={recentPayments}
            renderItem={(payment) => (
              <li key={payment.id} className="py-3">
                <div className="flex justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-medium truncate">
                      {payment.type === "DONATION" ? `Donation (${payment.category?.replace("_", " ")})` : "Offering"}
                    </p>
                    {payment.description && <p className="text-sm text-gray-500 line-clamp-1">{payment.description}</p>}
                  </div>
                  <p className="font-bold whitespace-nowrap">{formatCurrency(payment.amount)}</p>
                </div>
                <div className="mt-1.5 flex justify-between items-center">
                  <span className="text-xs text-gray-500 truncate max-w-[60%]">By {payment.user.name}</span>
                  <StatusBadge status={payment.status} />
                </div>
              </li>
            )}
          />
        </div>
      </div>
    </div>
  )
}

// Component for stats cards
function StatsCard({
  title,
  value,
  href,
  icon,
  tooltip,
}: {
  title: string
  value: number | string
  href: string
  icon?: React.ReactNode
  tooltip?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-semibold" title={tooltip}>
            {value}
          </div>
          <Link href={href}>
            <Button variant="outline" size="sm" className="h-8 px-3 text-xs whitespace-nowrap">
              View All
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// Component for quick action buttons
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
        className="w-full h-auto py-3 px-4 mx-auto flex items-center justify-center text-sm font-medium"
      >
    <Link href={href} className="block">
        {icon}
        <span className="truncate">{label}</span>
    </Link>
      </Button>
  )
}

// Component for recent data cards
function RecentDataCard<T>({
  title,
  emptyMessage,
  data,
  renderItem,
}: {
  title: string
  emptyMessage: string
  data: T[]
  renderItem: (item: T) => React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="pb-2 md:pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ul className="divide-y divide-gray-100 -mt-2">{data.map(renderItem)}</ul>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Component for status badges
function StatusBadge({ status }: { status: string }) {
  let bgColor = "bg-yellow-100 text-yellow-800 border-yellow-200"

  if (status === "APPROVED" || status === "PAID") {
    bgColor = "bg-green-100 text-green-800 border-green-200"
  } else if (status === "REJECTED" || status === "FAILED") {
    bgColor = "bg-red-100 text-red-800 border-red-200"
  }

  return (
    <Badge variant="outline" className={`${bgColor} text-xs whitespace-nowrap`}>
      {status}
    </Badge>
  )
}
