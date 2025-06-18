"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { type PaymentType, type PaymentCategory, PaymentStatus, ActivityType } from "@prisma/client"
import { logActivity } from "./activity-actions"
import { z } from "zod"
import { handleZodError, logError } from "@/lib/error-utils"
import { revalidatePath } from "next/cache"

// Validation schema
const paymentSchema = z.object({
  amount: z.string().refine((val) => {
    const num = Number.parseFloat(val)
    return !isNaN(num) && num > 0
  }, "Amount must be a positive number"),
  type: z.enum(["DONATION", "OFFERING"]),
  category: z.string().optional(),
  description: z.string().optional(),
  goalId: z.string().optional(),
})

// export async function createPayment(formData: FormData) {
//   try {
//     const user = await requireAuth()

//     const amountString = formData.get("amount") as string
//     const type = formData.get("type") as PaymentType
//     const category = formData.get("category") as PaymentCategory | undefined
//     const description = formData.get("description") as string
//     let goalId = formData.get("goalId") as string | undefined

//     console.log("goalId: ", goalId);

//     if (goalId === "none") {
//       console.log("goalId is none");
//       goalId = undefined
//     }

//     // Validate input
//     const result = paymentSchema.safeParse({
//       amount: amountString,
//       type,
//       category : type === "DONATION" ? category : undefined,
//       description,
//       goalId : goalId || undefined,
//     })

//     console.log({result});
//     if (!result.success) {
//       return { error: handleZodError(result.error).message }
//     }

//     console.log({result});


//     const amount = Number.parseFloat(amountString)

//     // For donations, category is required
//     if (type === "DONATION" && !category) {
//       return { error: "Category is required for donations" }
//     }

//     // If goalId is provided, verify it exists
//     if (goalId) {
//       const goal = await prisma.paymentGoal.findUnique({
//         where: { id: goalId },
//         select: { id: true },
//       })

//       if (!goal) {
//         return { error: "Payment goal not found" }
//       }
//     }

//     const payment = await prisma.payment.create({
//       data: {
//         amount,
//         type,
//         category: type === "DONATION" ? category : null,
//         description,
//         userId: user.id,
//         status: PaymentStatus.UNPAID,
//         goalId: goalId || null,
//       },
//     })

//     // Log activity
//     await logActivity({
//       userId: user.id,
//       action: `${type === "DONATION" ? "Donation" : "Offering"} created for ${amount} NGN`,
//       type: ActivityType.PARISHIONER,
//       entityId: payment.id,
//       entityType: "Payment",
//     })

//     return { success: true, payment }

//     // // Redirect to the payment page
//     // redirect(`/dashboard/payments/${payment.id}/pay`)
//   } catch (error) {
//     console.error(error);
//     logError(error, "CREATE_PAYMENT")
//     return { error: "Failed to create payment. Please try again." }
//   }
// }


type CreatePaymentData = {
  amount: number
  type: PaymentType
  category?: PaymentCategory
  description?: string
  reference?: string
  goalId?: string
}

export async function createPayment(formData: FormData) {
  const session = await requireAuth()

  if (!session?.id) {
    throw new Error('You must be logged in to create a payment')
  }

  const userId = session.id

  
  
  // Extract data from FormData
  const amount = parseFloat(formData.get('amount') as string)
  const type = formData.get('type') as PaymentType
  const category = (formData.get('category') as PaymentCategory) || undefined
  const description = formData.get('description') as string || undefined
  const reference = formData.get('reference') as string || undefined
  
  // Get goalId, but ignore if it's 'none'
  const rawGoalId = formData.get('goalId') as string
  let goalId = rawGoalId && rawGoalId !== 'none' ? rawGoalId : undefined
  
  // console.log("goalId: ", goalId);

  if (goalId === "none") {
    console.log("goalId is none");
    goalId = undefined
  }
  // Validate required fields
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Valid amount is required')
  }
  
  if (!type) {
    throw new Error('Payment type is required')
  }

  try {
    // Create the payment
    const payment = await prisma.$transaction(async (tx) => {
      // 1. Create the payment record
      const newPayment = await tx.payment.create({
        data: {
          userId,
          amount,
          type,
          category,
          description,
          reference,
          goalId,
          status: PaymentStatus.UNPAID, // Assuming payment is made immediately
        },
      })
      
      // 2. If this is a donation with a goal, update the goal's currentAmount
      if (type === 'DONATION' && goalId) {
        await tx.paymentGoal.update({
          where: { id: goalId },
          data: {
            currentAmount: {
              increment: amount
            }
          }
        })
      }
      
    return { success: true, newPayment }

    })
    
    // revalidatePath('/dashboard/payments')
    // revalidatePath('/goals')
    return { success: true }
  } catch (error) {
    console.error('Failed to create payment:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create payment' 
    }
  }
}



export async function updatePaymentStatus(id: string, status: PaymentStatus, reference?: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!payment) {
      throw new Error("Payment not found")
    }

    // Update payment status
    await prisma.payment.update({
      where: { id },
      data: {
        status,
        reference,
        updatedAt: new Date(),
      },
    })

    // If payment is successful, log activity and update goal if needed
    if (status === PaymentStatus.PAID) {
      // Log activity for the user
      await logActivity({
        userId: payment.userId,
        action: `${payment.type === "DONATION" ? "Donation" : "Offering"} of ${payment.amount} NGN was successful`,
        type: ActivityType.PARISHIONER,
        entityId: payment.id,
        entityType: "Payment",
      })

      // Log activity for admin
      await logActivity({
        userId: payment.userId, // We're using the user's ID but marking it as an admin activity
        action: `${payment.user.name} made a ${payment.type.toLowerCase()} of ${payment.amount} NGN`,
        type: ActivityType.ADMIN,
        entityId: payment.id,
        entityType: "Payment",
      })

      // Update goal if payment is linked to a goal
      if (payment.goalId) {
        await prisma.paymentGoal.update({
          where: { id: payment.goalId },
          data: {
            currentAmount: {
              increment: payment.amount,
            },
          },
        })
      }
    } else if (status === PaymentStatus.FAILED) {
      // Log failed payment
      await logActivity({
        userId: payment.userId,
        action: `${payment.type === "DONATION" ? "Donation" : "Offering"} of ${payment.amount} NGN failed`,
        type: ActivityType.PARISHIONER,
        entityId: payment.id,
        entityType: "Payment",
      })
    }

    return { success: true }
  } catch (error) {
    logError(error, "UPDATE_PAYMENT_STATUS")
    return { error: "Failed to update payment status" }
  }
}

export async function getPaymentById(id: string) {
  try {
    const user = await requireAuth()

    const payment = await prisma.payment.findUnique({
      where: {
        id,
        ...(user.role !== "ADMIN" && user.role !== "SUPERADMIN" ? { userId: user.id } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        goal: true,
      },
    })

    if (!payment) {
      return { error: "Payment not found" }
    }

    return { success: true, data: payment }
  } catch (error) {
    logError(error, "GET_PAYMENT_BY_ID")
    return { error: "Failed to fetch payment" }
  }
}

export async function getUserPayments(userId: string) {
  try {
    const user = await requireAuth()

    // Ensure users can only access their own payments unless admin
    if (user.id !== userId && user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      return []
    }

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return payments
  } catch (error) {
    logError(error, "GET_USER_PAYMENTS")
    return []
  }
}

export async function getAllPayments() {
  try {
    const user = await requireAuth()

    // Only admins can access all payments
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      return []
    }

    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return payments
  } catch (error) {
    logError(error, "GET_ALL_PAYMENTS")
    return []
  }
}

export async function getPaymentGoalById(id: string) {
  if (!id) return null
  
  return prisma.paymentGoal.findUnique({
    where: { id }
  })
}
// Add the missing getActivePaymentGoals function
export async function getActivePaymentGoals() {
  try {
    const now = new Date()

    const goals = await prisma.paymentGoal.findMany()

    console.log("Active payment goals:", goals)

    return goals
  } catch (error) {
    logError(error, "GET_ACTIVE_PAYMENT_GOALS")
    return []
  }
}

// Function to get all payment goals
export async function getAllPaymentGoals() {
  try {
    const user = await requireAuth()

    // Only admins can access all payment goals
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      return []
    }

    const goals = await prisma.paymentGoal.findMany({
      orderBy: [{ endDate: "asc" }, { startDate: "desc" }],
      include: {
        _count: {
          select: { payments: true },
        },
      },
    })

    return goals
  } catch (error) {
    logError(error, "GET_ALL_PAYMENT_GOALS")
    return []
  }
}

// Function to create a payment goal
export async function createPaymentGoal(formData: FormData) {
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

    const goal = await prisma.paymentGoal.create({
      data: {
        title,
        description,
        category: category as any,
        targetAmount,
        startDate,
        endDate,
      },
    })

    // Log activity
    await logActivity({
      userId: admin.id,
      action: `Created payment goal: ${title}`,
      type: ActivityType.ADMIN,
      entityId: goal.id,
      entityType: "PaymentGoal",
    })

    // redirect("/admin/payments/goals")
  } catch (error) {
    logError(error, "CREATE_PAYMENT_GOAL")
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Function to update a payment goal
export async function updatePaymentGoal(id: string, formData: FormData) {
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
    const endDate = endDateString && endDateString.trim() !== "" ? new Date(endDateString) : null

    const goal = await prisma.paymentGoal.update({
      where: { id },
      data: {
        title,
        description,
        category: category as any,
        targetAmount,
        startDate,
        endDate,
      },
    })

    // Log activity
    await logActivity({
      userId: admin.id,
      action: `Updated payment goal: ${title}`,
      type: ActivityType.ADMIN,
      entityId: goal.id,
      entityType: "PaymentGoal",
    })

    redirect("/admin/payments/goals")
  } catch (error) {
    logError(error, "UPDATE_PAYMENT_GOAL")
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Function to delete a payment goal
export async function deletePaymentGoal(id: string) {
  try {
    const admin = await requireAuth()

    if (admin.role !== "ADMIN" && admin.role !== "SUPERADMIN") {
      return { error: "Unauthorized" }
    }

    const goal = await prisma.paymentGoal.findUnique({
      where: { id },
      select: { title: true },
    })

    if (!goal) {
      return { error: "Payment goal not found" }
    }

    await prisma.paymentGoal.delete({
      where: { id },
    })

    // Log activity
    await logActivity({
      userId: admin.id,
      action: `Deleted payment goal: ${goal.title}`,
      type: ActivityType.ADMIN,
      entityId: id,
      entityType: "PaymentGoal",
    })

    redirect("/admin/payments/goals")
  } catch (error) {
    logError(error, "DELETE_PAYMENT_GOAL")
    return { error: "Failed to delete payment goal" }
  }
}

