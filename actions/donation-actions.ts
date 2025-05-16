"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { executeDbOperation } from "@/lib/db-utils"
import { logError } from "@/lib/error-utils"
import { ActivityType } from "@prisma/client"
import { logActivity } from "./activity-actions"
import { z } from "zod"

// Validation schema for donations
const donationSchema = z.object({
  amount: z.string().refine((val) => {
    const num = Number.parseFloat(val)
    return !isNaN(num) && num > 0
  }, "Amount must be a positive number"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
})

export async function createDonation(formData: FormData) {
  try {
    const user = await requireAuth()

    const amountString = formData.get("amount") as string
    const category = formData.get("category") as string
    const description = formData.get("description") as string

    // Validate input
    const result = donationSchema.safeParse({
      amount: amountString,
      category,
      description,
    })

    if (!result.success) {
      return { error: result.error.errors[0].message }
    }

    const amount = Number.parseFloat(amountString)

    const [payment, error] = await executeDbOperation(async () => {
      return await prisma.payment.create({
        data: {
          amount,
          type: "DONATION",
          category: category as any,
          description,
          userId: user.id,
          status: "UNPAID",
        },
      })
    }, "CREATE_DONATION")

    if (error || !payment) {
      return { error: "Failed to create donation" }
    }

    // Log activity
    await logActivity({
      userId: user.id,
      action: `Created donation of ${amount} NGN`,
      type: ActivityType.PARISHIONER,
      entityId: payment.id,
      entityType: "Payment",
    })

    redirect(`/dashboard/payments/${payment.id}/pay`)
  } catch (error) {
    logError(error, "CREATE_DONATION")
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function createDonationGoal(formData: FormData) {
  try {
    const admin = await requireAuth()

    if (admin.role !== "ADMIN" && admin.role !== "SUPERADMIN") {
      return { error: "Unauthorized" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const targetAmountString = formData.get("targetAmount") as string
    const startDateString = formData.get("startDate") as string
    const endDateString = formData.get("endDate") as string

    if (!title || !description || !category || !targetAmountString || !startDateString) {
      return { error: "Required fields are missing" }
    }

    const targetAmount = Number.parseFloat(targetAmountString)

    if (isNaN(targetAmount) || targetAmount <= 0) {
      return { error: "Invalid target amount" }
    }

    const startDate = new Date(startDateString)
    const endDate = endDateString ? new Date(endDateString) : undefined

    const [goal, error] = await executeDbOperation(async () => {
      return await prisma.paymentGoal.create({
        data: {
          title,
          description,
          category: category as any,
          targetAmount,
          startDate,
          endDate,
        },
      })
    }, "CREATE_DONATION_GOAL")

    if (error || !goal) {
      return { error: "Failed to create donation goal" }
    }

    // Log activity
    await logActivity({
      userId: admin.id,
      action: `Created donation goal: ${title}`,
      type: ActivityType.ADMIN,
      entityId: goal.id,
      entityType: "PaymentGoal",
    })

    redirect("/admin/donations/goals")
  } catch (error) {
    logError(error, "CREATE_DONATION_GOAL")
    return { error: "An unexpected error occurred. Please try again." }
  }
}

