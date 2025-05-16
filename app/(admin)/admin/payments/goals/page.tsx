import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/auth"
import { formatDate, formatCurrency } from "@/lib/utils"
import { getAllPaymentGoals, deletePaymentGoal } from "@/actions/payment-actions"

export default async function AdminPaymentGoalsPage() {
  await requireAdmin()

  // Fetch all payment goals
  const goals = await getAllPaymentGoals()

  // Separate active and completed goals
  const now = new Date()
  const activeGoals = goals.filter((goal) => !goal.endDate || new Date(goal.endDate) >= now)
  const completedGoals = goals.filter((goal) => goal.endDate && new Date(goal.endDate) < now)

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fundraising Goals</h1>
            <p className="text-gray-600">Manage donation and offering goals for the church.</p>
          </div>
          <Link href="/admin/payments/goals/new">
            <Button>Create New Goal</Button>
          </Link>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Active Goals</h2>

          {activeGoals.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeGoals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100
                return (
                  <Card key={goal.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{goal.title}</CardTitle>
                        <div className="flex space-x-2">
                          <Link href={`/admin/payments/goals/${goal.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <form action={deletePaymentGoal.bind(null, goal.id)}>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                              Delete
                            </Button>
                          </form>
                        </div>
                      </div>
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
                      <div className="text-sm text-gray-500 mt-2">
                        <p>Category: {goal.category.replace("_", " ")}</p>
                        <p>Started: {formatDate(goal.startDate)}</p>
                        {goal.endDate && <p>Ends: {formatDate(goal.endDate)}</p>}
                        <p>Contributions: {goal._count.payments}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">No active fundraising goals.</p>
                <Link href="/admin/payments/goals/new">
                  <Button>Create New Goal</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Completed Goals</h2>

          {completedGoals.length > 0 ? (
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
                          Title
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
                          Period
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Target
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Raised
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Progress
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {completedGoals.map((goal) => {
                        const progress = (goal.currentAmount / goal.targetAmount) * 100
                        return (
                          <tr key={goal.id}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{goal.title}</div>
                              <div className="text-sm text-gray-500">{goal.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{goal.category.replace("_", " ")}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{formatDate(goal.startDate)}</div>
                              <div className="text-sm text-gray-500">to {formatDate(goal.endDate!)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(goal.targetAmount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(goal.currentAmount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full ${progress >= 100 ? "bg-green-600" : "bg-blue-600"}`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No completed fundraising goals.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

