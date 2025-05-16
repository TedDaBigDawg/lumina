"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { ActivityType } from "@prisma/client"
import { logActivity } from "./activity-actions"

export async function createThanksgiving(formData: FormData) {
  const user = await requireAuth()

  const description = formData.get("description") as string
  const massId = formData.get("massId") as string

  if (!description || !massId) {
    return { error: "All fields are required" }
  }

  // Check if mass exists and has available slots
  const mass = await prisma.mass.findUnique({
    where: { id: massId },
  })

  if (!mass) {
    return { error: "Mass not found" }
  }

  if (mass.availableThanksgivingsSlots <= 0) {
    return { error: "No available slots for thanksgiving for this mass" }
  }

  // Use a transaction to ensure data consistency
  try {
    let thanksgiving

    await prisma.$transaction(async (tx) => {
      // Create the thanksgiving
      thanksgiving = await tx.thanksgiving.create({
        data: {
          description,
          userId: user.id,
          massId,
        },
      })

      // Update the available slots
      await tx.mass.update({
        where: { id: massId },
        data: {
          availableThanksgivingsSlots: mass.availableThanksgivingsSlots - 1,
          status:
            mass.availableThanksgivingsSlots - 1 <= 0 && mass.availableIntentionsSlots <= 0 ? "FULL" : "AVAILABLE",
        },
      })
    })

    // Log activity for the user
    await logActivity({
      userId: user.id,
      action: `Thanksgiving service booked for "${description.substring(0, 30)}${description.length > 30 ? "..." : ""}"`,
      type: ActivityType.PARISHIONER,
      entityId: thanksgiving.id,
      entityType: "Thanksgiving",
    })

    // Log activity for admin
    await logActivity({
      userId: user.id,
      action: `New thanksgiving request from ${user.name}`,
      type: ActivityType.ADMIN,
      entityId: thanksgiving.id,
      entityType: "Thanksgiving",
    })
  } catch (error) {
    console.error("Error creating thanksgiving:", error)
    return { error: "Failed to create thanksgiving" }
  }

  // In a real app, you would handle payment here
  // And send a confirmation email

  redirect("/dashboard/thanksgiving")
}

export async function updateThanksgivingStatus(id: string, status: "APPROVED" | "REJECTED") {
  await requireAuth()

  const thanksgiving = await prisma.thanksgiving.findUnique({
    where: { id },
    include: { user: true },
  })

  if (!thanksgiving) {
    return { error: "Thanksgiving not found" }
  }

  await prisma.thanksgiving.update({
    where: { id },
    data: { status },
  })

  // Log activity for the user
  await logActivity({
    userId: thanksgiving.userId,
    action: `Your thanksgiving service has been ${status.toLowerCase()}`,
    type: ActivityType.PARISHIONER,
    entityId: thanksgiving.id,
    entityType: "Thanksgiving",
  })

  // Log activity for admin
  await logActivity({
    userId: thanksgiving.userId,
    action: `Thanksgiving service for ${thanksgiving.user.name} has been ${status.toLowerCase()}`,
    type: ActivityType.ADMIN,
    entityId: thanksgiving.id,
    entityType: "Thanksgiving",
  })

  // In a real app, you would send a notification email here

  redirect("/admin/thanksgiving")
}

export async function deleteThanksgiving(id: string) {
  await requireAuth()

  // Get the thanksgiving to find its mass
  const thanksgiving = await prisma.thanksgiving.findUnique({
    where: { id },
    include: { mass: true },
  })

  if (!thanksgiving) {
    return { error: "Thanksgiving not found" }
  }

  // Use a transaction to ensure data consistency
  try {
    await prisma.$transaction(async (tx) => {
      // Delete the thanksgiving
      await tx.thanksgiving.delete({
        where: { id },
      })

      // Update the available slots
      await tx.mass.update({
        where: { id: thanksgiving.massId },
        data: {
          availableThanksgivingsSlots: thanksgiving.mass.availableThanksgivingsSlots + 1,
          status: "AVAILABLE", // Since we're adding a slot back, it's definitely available
        },
      })
    })

    // Log activity for admin
    await logActivity({
      userId: thanksgiving.userId,
      action: `Thanksgiving service for ${thanksgiving.user.name} has been deleted`,
      type: ActivityType.ADMIN,
      entityId: id,
      entityType: "Thanksgiving",
    })
  } catch (error) {
    console.error("Error deleting thanksgiving:", error)
    return { error: "Failed to delete thanksgiving" }
  }

  redirect("/admin/thanksgiving")
}

