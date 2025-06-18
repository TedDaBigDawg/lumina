import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const awaitedParams = await params;
    const payment = await prisma.payment.findUnique({
      where: { id: awaitedParams.id },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Enhanced authorization check
    if (payment.userId !== session.id && session.role !== "ADMIN" && session.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "You do not have permission to access this payment" }, { status: 403 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error fetching payment:", error)
    return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 })
  }
}

