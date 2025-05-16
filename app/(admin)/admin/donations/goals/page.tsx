import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth"

export default async function AdminDonationGoalsPage() {
  await requireAdmin()
  redirect("/admin/payments/goals")
  return null
}

