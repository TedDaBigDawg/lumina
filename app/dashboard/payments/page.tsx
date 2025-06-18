import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { requireAuth } from "@/lib/auth"
import { formatDate, formatCurrency } from "@/lib/utils"
import { getUserPayments, getActivePaymentGoals } from "@/actions/payment-actions"
import { PrettyAmount } from "@/components/ui/PrettyAmount"
import { PaymentHistoryTable } from "@/components/payment-history-table"

export default async function DonationsPage({ searchParams }: { searchParams: { success?: string; error?: string } }) {
  const user = await requireAuth()

  searchParams = await searchParams
  // Fetch all payments for the user
  const payments = await getUserPayments(user.id)

  // Separate donations and offerings
  const donations = payments.filter((payment) => payment.type === "DONATION")
  const offerings = payments.filter((payment) => payment.type === "OFFERING")

  // console.log("Payments:", payments)
  // console.log("Donations:", donations)
  // Calculate totals
  const totalDonations = donations.reduce((sum, payment) => {
    return payment.status === "PAID" ? sum + payment.amount : sum
  }, 0)

  // console.log("Total donations:", totalDonations)

  const totalOfferings = offerings.reduce((sum, payment) => {
    return payment.status === "PAID" ? sum + payment.amount : sum
  }, 0)

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

  // console.log("Total by category:", totalByCategory)
  // Fetch donation goals
  const paymentGoals = await getActivePaymentGoals()

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
            <p className="text-gray-600">Manage your donations and offerings to support our church.</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Link href="/dashboard/payments/new?type=DONATION" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Make Donation</Button>
            </Link>
            <Link href="/dashboard/payments/new?type=OFFERING" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                Make Offering
              </Button>
            </Link>
          </div>
        </div>

        {/* Status messages */}
        {searchParams.success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
            Payment completed successfully! Thank you for your contribution.
          </div>
        )}
        {searchParams.error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {searchParams.error === "payment-failed"
              ? "Payment failed. Please try again."
              : searchParams.error === "verification-failed"
                ? "Payment verification failed. Please contact support."
                : "An error occurred with your payment. Please try again."}
          </div>
        )}

        {paymentGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Current Fundraising Goals</h2>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
                          <span>
                            <PrettyAmount value={goal.currentAmount} />
                          </span>
                          <span>
                            <PrettyAmount value={goal.targetAmount} />
                          </span>
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

        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Donation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Donations</h3>
                  {Object.keys(totalByCategory).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(totalByCategory).map(([category, total]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="font-medium">{category.replace("_", " ")}</span>
                          <span className="font-bold">{formatCurrency(total)}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-medium">Total Donations</span>
                        <span className="font-bold">{formatCurrency(totalDonations)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">You haven't made any donations yet.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Offerings</h3>
                  {offerings.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Offerings</span>
                        <span className="font-bold">{formatCurrency(totalOfferings)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">You haven't made any offerings yet.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {payments.slice(0, 5).map((payment) => (
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
                          <p className="font-bold">{formatCurrency(payment.amount)}</p>
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
                <p className="text-gray-500">No recent contributions.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {payments.length > 0 && (
          <div className="mt-8 grid gap-8 sm:grid-cols-1 md:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Donations History</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-0">
                {donations.length > 0 ? (
                  <PaymentHistoryTable
                    payments={donations.map((donation) => ({
                      ...donation,
                      category: donation.category ?? undefined,
                      description: donation.description ?? undefined,
                      goal: donation.goal ?? undefined,
                    }))}
                    type="DONATION"
                  />
                ) : (
                  <p className="text-gray-500 text-center py-4">No donation history.</p>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Offerings History</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-0">
                {offerings.length > 0 ? (
                  <PaymentHistoryTable
                    payments={offerings.map((offering) => ({
                      ...offering,
                      category: offering.category ?? undefined,
                      description: offering.description ?? undefined,
                      goal: offering.goal ?? undefined,
                    }))}
                    type="OFFERING"
                  />
                ) : (
                  <p className="text-gray-500 text-center py-4">No offering history.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

