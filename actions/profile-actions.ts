"use server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { profileUpdateSchema } from "@/lib/validations"
import { handleZodError, logError } from "@/lib/error-utils"
import { ActivityType } from "@prisma/client"
import { logActivity } from "./activity-actions"

export async function getUserProfile() {
  try {
    const user = await requireAuth()

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    })

    if (!profile) {
      throw new Error("Profile not found")
    }

    return profile
  } catch (error) {
    logError(error, "GET_USER_PROFILE")
    throw error
  }
}

export async function updateUserProfile(formData: FormData) {
  try {
    const user = await requireAuth()

    const name = formData.get("name") as string
    const phone = formData.get("phone") as string | null

    // Validate input
    const result = profileUpdateSchema.safeParse({ name, phone })
    if (!result.success) {
      return { error: handleZodError(result.error).message }
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          phone,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      })

      // Log activity
      await logActivity({
        userId: user.id,
        action: "Updated profile information",
        type: ActivityType.PARISHIONER,
      })

      return { success: true, user: updatedUser }
    } catch (error) {
      logError(error, "UPDATE_USER_PROFILE")
      return { error: "Failed to update profile" }
    }
  } catch (error) {
    logError(error, "UPDATE_USER_PROFILE")
    return { error: "An unexpected error occurred. Please try again." }
  }
}

