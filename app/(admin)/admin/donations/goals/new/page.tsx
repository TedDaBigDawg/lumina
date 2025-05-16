// This should redirect to the new payment goals page
import { redirect } from "next/navigation"

export default function NewDonationGoalPage() {
  redirect("/admin/payments/goals/new")
  return null
}

