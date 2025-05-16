import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateWebhook } from "@/lib/paystack"
import { PaymentStatus } from "@prisma/client"
import { updatePaymentStatus } from "@/actions/payment-actions"

export async function POST(request: NextRequest) {
  try {
    // Get the signature from the header
    const paystackSignature = request.headers.get("x-paystack-signature")

    if (!paystackSignature) {
      return NextResponse.json({ error: "Missing Paystack signature" }, { status: 400 })
    }

    // Get the request body
    const body = await request.json()

    // Validate the webhook
    const isValid = validateWebhook(body, paystackSignature)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Process the webhook event
    const { event, data } = body

    if (event === "charge.success") {
      const { reference } = data

      // Find payment by reference
      const payment = await prisma.payment.findFirst({
        where: { reference },
      })

      if (payment) {
        // Update payment status
        await updatePaymentStatus(payment.id, PaymentStatus.PAID, reference)
      }
    }

    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

