import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatDate, formatCurrency } from "@/lib/utils"
import { getActivePaymentGoals } from "@/actions/payment-actions"

export default async function DonationsPage() {
  const user = await requireAuth()

  // Fetch all payments for the user (filtered by type)
  const donations = await prisma.payment.findMany({
    where: {
      userId: user.id,
      type: "DONATION",
    },
    orderBy: { createdAt: "desc" },
    include: { goal: true },
  })

  // Fetch active payment goals
  const paymentGoals = await getActivePaymentGoals()

  // Calculate total by category for donations
  const totalByCategory = donations.reduce(
    (acc, payment) => {
      if (payment.status === "PAID" && payment.category) {
        const category = payment.category
        if (!acc[category]) {
          acc[category] = 0
        }
        acc[category] += payment.amount
      }
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
            <p className="text-gray-600">Support our church through various donations.</p>
          </div>
          <Link href="/dashboard/payments/new?type=DONATION">
            <Button>Make Donation</Button>
          </Link>
        </div>

        {paymentGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Current Fundraising Goals</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paymentGoals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100
                return (
                  <Card key={goal.id}>
                    <CardHeader>
                      <CardTitle>{goal.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{goal.description}</p>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{formatCurrency(goal.currentAmount)}</span>
                          <span>{formatCurrency(goal.targetAmount)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <Link href={`/dashboard/payments/new?type=DONATION&category=${goal.category}&goalId=${goal.id}`}>
                        <Button variant="outline" className="w-full">
                          Donate to this Cause
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Donation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(totalByCategory).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(totalByCategory).map(([category, total]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="font-medium">{category.replace("_", " ")}</span>
                      <span className="font-bold">{formatCurrency(total)}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-medium">Total Donations</span>
                    <span className="font-bold">
                      {formatCurrency(Object.values(totalByCategory).reduce((sum, amount) => sum + amount, 0))}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">You haven't made any donations yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
            </CardHeader>
            <CardContent>
              {donations.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {donations.slice(0, 5).map((donation) => (
                    <li key={donation.id} className="py-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{donation.category?.replace("_", " ") || "Donation"}</p>
                          {donation.description && <p className="text-sm text-gray-500">{donation.description}</p>}
                          {donation.goal && <p className="text-sm text-gray-500">For: {donation.goal.title}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(donation.amount)}</p>
                          <p className="text-sm text-gray-500">{formatDate(donation.createdAt)}</p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              donation.status === "PAID"
                                ? "bg-green-100 text-green-800"
                                : donation.status === "FAILED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {donation.status}
                          </span>
                        </div>
                      </div>
                      {donation.status === "UNPAID" && (
                        <div className="mt-2">
                          <Link href={`/dashboard/payments/${donation.id}/pay`}>
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
            </CardContent>
          </Card>
        </div>

        {donations.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                        Category
                      </th>
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
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donations.map((donation) => (
                      <tr key={donation.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(donation.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {donation.category?.replace("_", " ") || "-"}
                          </div>
                          {donation.goal && <div className="text-xs text-gray-500">For: {donation.goal.title}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{donation.description || "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(donation.amount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              donation.status === "PAID"
                                ? "bg-green-100 text-green-800"
                                : donation.status === "FAILED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {donation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {donation.status === "UNPAID" && (
                            <Link href={`/dashboard/payments/${donation.id}/pay`}>
                              <Button size="sm" variant="outline">
                                Complete Payment
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

