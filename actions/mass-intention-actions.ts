"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { ActivityType } from "@prisma/client"
import { logActivity } from "./activity-actions"
import { massIntentionSchema } from "@/lib/validations"
import { handleZodError, logError } from "@/lib/error-utils"
import { broadcastMessage } from "@/app/api/ws/route"

export async function createMassIntention(formData: FormData) {
  try {
    const user = await requireAuth()

    const name = formData.get("name") as string
    const intention = formData.get("intention") as string
    const massId = formData.get("massId") as string

    // Validate input
    const result = massIntentionSchema.safeParse({ name, intention, massId })
    if (!result.success) {
      return { error: handleZodError(result.error).message }
    }

    // Check if mass exists and has available slots
    const mass = await prisma.mass.findUnique({
      where: { id: massId },
      select: {
        id: true,
        availableIntentionsSlots: true,
        availableThanksgivingsSlots: true,
      },
    })

    if (!mass) {
      return { error: "Mass not found" }
    }

    if (mass.availableIntentionsSlots <= 0) {
      return { error: "No available slots for mass intentions for this mass" }
    }

    // Use a transaction to ensure data consistency
    try {
      const [massIntention] = await prisma.$transaction(async (tx) => {
        // Create the mass intention
        const massIntention = await tx.massIntention.create({
          data: {
            name,
            intention,
            userId: user.id,
            massId,
          },
        })

        // Update the available slots
        await tx.mass.update({
          where: { id: massId },
          data: {
            availableIntentionsSlots: mass.availableIntentionsSlots - 1,
            status:
              mass.availableIntentionsSlots - 1 <= 0 && mass.availableThanksgivingsSlots <= 0 ? "FULL" : "AVAILABLE",
          },
        })

        return [massIntention]
      })

      // Log activity for the user
      await logActivity({
        userId: user.id,
        action: `Mass intention submitted for ${name}`,
        type: ActivityType.PARISHIONER,
        entityId: massIntention.id,
        entityType: "MassIntention",
      })

      // Log activity for admin
      await logActivity({
        userId: user.id,
        action: `New mass intention request from ${user.name} for ${name}`,
        type: ActivityType.ADMIN,
        entityId: massIntention.id,
        entityType: "MassIntention",
      })

      // Broadcast the update via WebSocket
      broadcastMessage(
        "MASS_INTENTION_UPDATED",
        {
          id: massIntention.id,
          action: "created",
          massId,
        },
        (_, userRole) => userRole === "ADMIN" || userRole === "SUPERADMIN",
      )
    } catch (error) {
      logError(error, "CREATE_MASS_INTENTION_TRANSACTION")
      return { error: "Failed to create mass intention" }
    }
  } catch (error) {
    logError(error, "CREATE_MASS_INTENTION")
    return { error: "An unexpected error occurred. Please try again." }
  }
}


export async function getUpcomingMassIntentions(page = 1, itemsPerPage = 5) {
    const user = await requireAuth()

    const skip = (page - 1) * itemsPerPage
    // Pagination setup
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Ensures we start from midnight of today

    // Fetch upcoming mass intentions with pagination
    const upcomingMassIntentions = await prisma.massIntention.findMany({
      where: {
        userId: user.id,
        mass: {
          date: {
            gte: today, // Only include masses from today onward
          },
        },
      },
      orderBy: {
        mass: {
          date: "asc", // Closest dates first
        },
      },
      include: {
        mass: true,
      },
      skip,
      take: itemsPerPage,// Skip records based on current page
    })
    return {upcomingMassIntentions};
}



export async function getUpcomingMassIntentionsCount() {
    const user = await requireAuth()
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Ensures we start from midnight of today

    // Fetch upcoming mass intentions with pagination
    // You might want to calculate total pages based on the total count of mass intentions
    const totalUpcoming = await prisma.massIntention.count({
      where: {
        userId: user.id,
        mass: {
          date: {
            gte: today, // Only masses from today onward
          },
        },
      },
    })

    return totalUpcoming;
}


export async function getPastMassIntentions(page = 1, itemsPerPage = 5) {
    const user = await requireAuth()

    // Pagination setup
    const skip = (page - 1) * itemsPerPage

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Ensures we start from midnight of today

    // Fetch past mass intentions with pagination
    const pastMassIntentions = await prisma.massIntention.findMany({
      where: {
        userId: user.id,
        mass: {
          date: {
            lt: today, // Only include masses before today
          },
        },
      },
      orderBy: {
        mass: {
          date: "desc", // Closest past masses first (most recent)
        },
      },
      include: {
        mass: true,
      },
      take: itemsPerPage,
      skip
    })

    if (!pastMassIntentions.length) {
      return { error: "No past mass intentions found" }
    }

    return pastMassIntentions;
}


export async function getPastMassIntentionsCount() {
    const user = await requireAuth()
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Ensures we start from midnight of today

    // Fetch upcoming mass intentions with pagination
    // You might want to calculate total pages based on the total count of mass intentions
    const totalPast = await prisma.massIntention.count({
      where: {
        userId: user.id,
        mass: {
          date: {
            lt: today, // Only masses before today
          },
        },
      },
    })
    return totalPast;
}


export async function updateMassIntentionStatus(id: string, status: "APPROVED" | "REJECTED") {
  try {
    const admin = await requireAuth()

    if (admin.role !== "ADMIN" && admin.role !== "SUPERADMIN") {
      return { error: "Unauthorized" }
    }

    const massIntention = await prisma.massIntention.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mass: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
    })

    if (!massIntention) {
      return { error: "Mass intention not found" }
    }

    const updatedIntention = await prisma.massIntention.update({
      where: { id },
      data: { status },
    })

    // Log activity for the user
    await logActivity({
      userId: massIntention.userId,
      action: `Your mass intention for ${massIntention.name} has been ${status.toLowerCase()}`,
      type: ActivityType.PARISHIONER,
      entityId: massIntention.id,
      entityType: "MassIntention",
    })

    // Log activity for admin
    await logActivity({
      userId: admin.id,
      action: `Mass intention for ${massIntention.name} has been ${status.toLowerCase()}`,
      type: ActivityType.ADMIN,
      entityId: massIntention.id,
      entityType: "MassIntention",
    })

    // Broadcast the update via WebSocket
    broadcastMessage(
      "MASS_INTENTION_UPDATED",
      {
        id: massIntention.id,
        action: "statusUpdated",
        status,
        massId: massIntention.massId,
      },
      (userId, _) => userId === massIntention.userId || userId === admin.id,
    )

    redirect("/admin/mass-intentions")
  } catch (error) {
    logError(error, "UPDATE_MASS_INTENTION_STATUS")
    return { error: "Failed to update mass intention status" }
  }
}

export async function deleteMassIntention(id: string) {
  try {
    const admin = await requireAuth()

    if (admin.role !== "ADMIN" && admin.role !== "SUPERADMIN") {
      return { error: "Unauthorized" }
    }

    // Get the mass intention to find its mass
    const massIntention = await prisma.massIntention.findUnique({
      where: { id },
      include: {
        mass: {
          select: {
            id: true,
            availableIntentionsSlots: true,
          },
        },
      },
    })

    if (!massIntention) {
      return { error: "Mass intention not found" }
    }

    // Use a transaction to ensure data consistency
    try {
      await prisma.$transaction(async (tx) => {
        // Delete the mass intention
        await tx.massIntention.delete({
          where: { id },
        })

        // Update the available slots
        await tx.mass.update({
          where: { id: massIntention.massId },
          data: {
            availableIntentionsSlots: massIntention.mass.availableIntentionsSlots + 1,
            status: "AVAILABLE", // Since we're adding a slot back, it's definitely available
          },
        })
      })

      // Log activity for admin
      await logActivity({
        userId: admin.id,
        action: `Mass intention for ${massIntention.name} has been deleted`,
        type: ActivityType.ADMIN,
        entityId: id,
        entityType: "MassIntention",
      })

      // Broadcast the update via WebSocket
      broadcastMessage(
        "MASS_INTENTION_UPDATED",
        {
          id: massIntention.id,
          action: "deleted",
          massId: massIntention.massId,
        },
        (userId, userRole) => userId === massIntention.userId || userRole === "ADMIN" || userRole === "SUPERADMIN",
      )

      redirect("/admin/mass-intentions")
    } catch (error) {
      logError(error, "DELETE_MASS_INTENTION_TRANSACTION")
      return { error: "Failed to delete mass intention" }
    }
  } catch (error) {
    logError(error, "DELETE_MASS_INTENTION")
    return { error: "Failed to delete mass intention" }
  }
}

// Get mass intentions for a specific mass
export async function getMassIntentionsForMass(massId: string) {
  try {
    const user = await requireAuth()

    const query: any = {
      where: {
        massId,
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
      },
      orderBy: {
        createdAt: "desc",
      },
    }

    const massIntentions = await prisma.massIntention.findMany(query)

    return { success: true, data: massIntentions }
  } catch (error) {
    logError(error, "GET_MASS_INTENTIONS_FOR_MASS")
    return { error: "Failed to fetch mass intentions" }
  }
}

