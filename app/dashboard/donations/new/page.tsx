import { redirect } from "next/navigation"

export default function NewDonationPage() {
  redirect("/dashboard/payments/new?type=DONATION")
  return null
}

