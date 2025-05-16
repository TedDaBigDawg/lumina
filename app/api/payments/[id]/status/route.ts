import type { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { createApiResponse, withErrorHandling } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return withErrorHandling(async () => {
    const session = await getSession()

    if (!session) {
      return createApiResponse({
        error: "Unauthorized",
        statusCode: 401,
      })
    }

    // Optimize query by selecting only needed fields
    const payment = await prisma.payment.findUnique({
      where: {
        id: params.id,
        // Ensure users can only access their own payments unless admin
        ...(session.role !== "ADMIN" && session.role !== "SUPERADMIN" ? { userId: session.id } : {}),
      },
      select: {
        id: true,
        status: true,
        reference: true,
        amount: true,
        type: true,
        category: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!payment) {
      return createApiResponse({
        error: "Payment not found",
        statusCode: 404,
      })
    }

    return payment
  })
}

// Add PATCH endpoint to update payment status
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return withErrorHandling(async () => {
    const session = await getSession()

    if (!session) {
      return createApiResponse({
        error: "Unauthorized",
        statusCode: 401,
      })
    }

    // Only admins can update payment status
    if (session.role !== "ADMIN" && session.role !== "SUPERADMIN") {
      return createApiResponse({
        error: "Forbidden",
        statusCode: 403,
      })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !["PAID", "UNPAID", "FAILED"].includes(status)) {
      return createApiResponse({
        error: "Invalid status",
        statusCode: 400,
      })
    }

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
    })

    if (!payment) {
      return createApiResponse({
        error: "Payment not found",
        statusCode: 404,
      })
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: params.id },
      data: { status },
      select: {
        id: true,
        status: true,
        reference: true,
        amount: true,
        type: true,
        category: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return updatedPayment
  })
}

