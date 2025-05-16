import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyTransaction } from "@/lib/paystack"
import { PaymentStatus } from "@prisma/client"
import { updatePaymentStatus } from "@/actions/payment-actions"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.redirect(new URL("/dashboard/payments?error=missing-reference", request.url))
    }

    // Find payment by reference
    const payment = await prisma.payment.findFirst({
      where: { reference },
    })

    if (!payment) {
      return NextResponse.redirect(new URL("/dashboard/payments?error=payment-not-found", request.url))
    }

    // Verify transaction with Paystack
    const transaction = await verifyTransaction(reference)

    if (transaction.status === "success") {
      // Update payment status
      await updatePaymentStatus(payment.id, PaymentStatus.PAID, reference)
      return NextResponse.redirect(new URL(`/dashboard/payments?success=true`, request.url))
    } else {
      // Update payment status to failed
      await updatePaymentStatus(payment.id, PaymentStatus.FAILED, reference)
      return NextResponse.redirect(new URL(`/dashboard/payments?error=payment-failed`, request.url))
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.redirect(new URL("/dashboard/payments?error=verification-failed", request.url))
  }
}

