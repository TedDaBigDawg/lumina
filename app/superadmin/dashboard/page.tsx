import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { requireSuperadmin } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import { getAdminActivities } from "@/actions/activity-actions"
import { Users, UserCog, CalendarDays, DollarSign, Bell, ShieldAlert } from "lucide-react"

export default async function SuperadminDashboardPage() {
  const user = await requireSuperadmin()

  // Fetch counts for various entities
  const totalUsers = await prisma.user.count()
  const totalAdmins = await prisma.user.count({
    where: { role: "ADMIN" },
  })
  const totalParishioners = await prisma.user.count({
    where: { role: "PARISHIONER" },
  })
  const totalEvents = await prisma.event.count()
  const totalMasses = await prisma.mass.count()

  // Fetch payment statistics
  const totalPayments = await prisma.payment.aggregate({
    where: { status: "PAID" },
    _sum: { amount: true },
  })

  // Fetch recent activities
  const activities = await getAdminActivities(5)

  // Fetch recent admin users
  const recentAdmins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Superadmin Dashboard</h1>
          <p className="text-gray-600">Manage church administrators and monitor system statistics.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-500 mr-2" />
                <div className="text-2xl font-semibold">{totalUsers}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Administrators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <UserCog className="h-5 w-5 text-purple-500 mr-2" />
                <div className="text-2xl font-semibold">{totalAdmins}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Parishioners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-green-500 mr-2" />
                <div className="text-2xl font-semibold">{totalParishioners}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CalendarDays className="h-5 w-5 text-orange-500 mr-2" />
                <div className="text-2xl font-semibold">{totalEvents}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2">
                <Link href="/superadmin/admins">
                  <Button className="w-full">Manage Admins</Button>
                </Link>
                <Link href="/admin/profile">
                  <Button className="w-full">Church Settings</Button>
                </Link>
                <Link href="/admin/events">
                  <Button variant="outline" className="w-full">
                    Manage Events
                  </Button>
                </Link>
                <Link href="/admin/masses">
                  <Button variant="outline" className="w-full">
                    Manage Masses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>System Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <CalendarDays className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-medium">Total Masses</span>
                  </span>
                  <span className="font-bold">{totalMasses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">Total Contributions</span>
                  </span>
                  <span className="font-bold">${(totalPayments._sum.amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activities</CardTitle>
              <Link href="/admin/activities">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <li key={activity.id} className="py-3">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 text-blue-500 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No recent activities.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Administrators</CardTitle>
              <Link href="/superadmin/admins">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentAdmins.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentAdmins.map((admin) => (
                    <li key={admin.id} className="py-3">
                      <div className="flex items-center">
                        <UserCog className="h-5 w-5 text-purple-500 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                          <p className="text-xs text-gray-500">{admin.email}</p>
                        </div>
                        <Link href={`/superadmin/admins/${admin.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <ShieldAlert className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No administrators</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new administrator.</p>
                  <div className="mt-6">
                    <Link href="/superadmin/admins/new">
                      <Button>Add Administrator</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

