import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { initializeTransaction } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { paymentId } = await request.json()

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    // Get payment details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.userId !== session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (payment.status === "PAID") {
      return NextResponse.json({ error: "Payment already completed" }, { status: 400 })
    }

    // Generate a unique reference
    const reference = `${payment.type.toLowerCase()}_${payment.id}_${Date.now()}`

    // Update payment with reference
    await prisma.payment.update({
      where: { id: payment.id },
      data: { reference },
    })

    // Initialize Paystack transaction
    const metadata = {
      payment_id: payment.id,
      payment_type: payment.type,
      user_id: payment.userId,
    }

    const transaction = await initializeTransaction(payment.user.email, payment.amount, reference, metadata)

    return NextResponse.json({
      authorization_url: transaction.authorization_url,
      reference: transaction.reference,
    })
  } catch (error) {
    console.error("Error initiating payment:", error)
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 })
  }
}

