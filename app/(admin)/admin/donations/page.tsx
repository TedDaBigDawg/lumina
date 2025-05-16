import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth"

export default async function AdminDonationsPage() {
  await requireAdmin()
  redirect("/admin/payments")
}

