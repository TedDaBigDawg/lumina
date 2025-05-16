"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { getChurchInfo } from "./church-info-actions"
import { ActivityType } from "@prisma/client"
import { logActivity } from "./activity-actions"

export async function createMass(formData: FormData) {
  const admin = await requireAdmin()

  const title = formData.get("title") as string
  const dateString = formData.get("date") as string
  const timeString = formData.get("time") as string
  let location = formData.get("location") as string
  const intentionSlotsString = formData.get("intentionSlots") as string
  const thanksgivingSlotsString = formData.get("thanksgivingSlots") as string
  const useDefaultLocation = formData.get("useDefaultLocation") === "true"

  if (!title || !dateString || !timeString || !intentionSlotsString || !thanksgivingSlotsString) {
    return { error: "All fields are required" }
  }

  // If useDefaultLocation is true or location is empty, use the default church address
  if (useDefaultLocation || !location.trim()) {
    try {
      const churchInfo = await getChurchInfo()
      location = churchInfo.address
    } catch (error) {
      console.error("Error fetching church info:", error)
      return { error: "Failed to fetch default church address" }
    }
  }

  const intentionSlots = Number.parseInt(intentionSlotsString, 10)
  const thanksgivingSlots = Number.parseInt(thanksgivingSlotsString, 10)

  if (isNaN(intentionSlots) || isNaN(thanksgivingSlots) || intentionSlots < 0 || thanksgivingSlots < 0) {
    return { error: "Slots must be valid numbers" }
  }

  // Combine date and time
  const [year, month, day] = dateString.split("-").map(Number)
  const [hours, minutes] = timeString.split(":").map(Number)
  const date = new Date(year, month - 1, day, hours, minutes)

  const mass = await prisma.mass.create({
    data: {
      title,
      date,
      location,
      availableIntentionsSlots: intentionSlots,
      availableThanksgivingsSlots: thanksgivingSlots,
      status: intentionSlots > 0 || thanksgivingSlots > 0 ? "AVAILABLE" : "FULL",
    },
  })

  // Log activity
  await logActivity({
    userId: admin.id,
    action: `Created new mass: ${title}`,
    type: ActivityType.ADMIN,
    entityId: mass.id,
    entityType: "Mass",
  })
}


export async function getMassesWithAvailability() {
  try {
    const today = new Date()

    const masses = await prisma.mass.findMany({
      where: {
        date: {
          gte: today, // Only upcoming masses
        },
        status: "AVAILABLE",
      },
      orderBy: {
        date: "asc", // Optional: sort by soonest
      },
      select: {
        id: true,
        title: true,
        date: true,
        location: true,
        availableIntentionsSlots: true,
        availableThanksgivingsSlots: true,
        status: true,
      },
    })

    return { data: masses }
  } catch (error) {
    console.error("Error fetching available masses:", error)
    return { error: "Failed to retrieve available masses" }
  }
}

export async function updateMass(id: string, formData: FormData) {
  await requireAdmin()

  const title = formData.get("title") as string
  const dateString = formData.get("date") as string
  const timeString = formData.get("time") as string
  let location = formData.get("location") as string
  const intentionSlotsString = formData.get("intentionSlots") as string
  const thanksgivingSlotsString = formData.get("thanksgivingSlots") as string
  const useDefaultLocation = formData.get("useDefaultLocation") === "true"

  if (!title || !dateString || !timeString || !intentionSlotsString || !thanksgivingSlotsString) {
    return { error: "All fields are required" }
  }

  // If useDefaultLocation is true or location is empty, use the default church address
  if (useDefaultLocation || !location.trim()) {
    try {
      const churchInfo = await getChurchInfo()
      location = churchInfo.address
    } catch (error) {
      console.error("Error fetching church info:", error)
      return { error: "Failed to fetch default church address" }
    }
  }

  const intentionSlots = Number.parseInt(intentionSlotsString, 10)
  const thanksgivingSlots = Number.parseInt(thanksgivingSlotsString, 10)

  if (isNaN(intentionSlots) || isNaN(thanksgivingSlots) || intentionSlots < 0 || thanksgivingSlots < 0) {
    return { error: "Slots must be valid numbers" }
  }

  // Combine date and time
  const [year, month, day] = dateString.split("-").map(Number)
  const [hours, minutes] = timeString.split(":").map(Number)
  const date = new Date(year, month - 1, day, hours, minutes)

  // Get current mass to check if slots have been reduced
  const currentMass = await prisma.mass.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          massIntentions: true,
          thanksgivings: true,
        },
      },
    },
  })

  if (!currentMass) {
    return { error: "Mass not found" }
  }

  // Check if new intention slots are less than already booked
  if (intentionSlots < currentMass._count.massIntentions) {
    return {
      error: `Cannot reduce intention slots below ${currentMass._count.massIntentions} as they are already booked`,
    }
  }

  // Check if new thanksgiving slots are less than already booked
  if (thanksgivingSlots < currentMass._count.thanksgivings) {
    return {
      error: `Cannot reduce thanksgiving slots below ${currentMass._count.thanksgivings} as they are already booked`,
    }
  }

  const mass = await prisma.mass.update({
    where: { id },
    data: {
      title,
      date,
      location,
      availableIntentionsSlots: intentionSlots - currentMass._count.massIntentions,
      availableThanksgivingsSlots: thanksgivingSlots - currentMass._count.thanksgivings,
      status:
        intentionSlots - currentMass._count.massIntentions > 0 ||
        thanksgivingSlots - currentMass._count.thanksgivings > 0
          ? "AVAILABLE"
          : "FULL",
    },
  })

  // Log activity
  const admin = await requireAdmin()
  await logActivity({
    userId: admin.id,
    action: `Updated mass: ${title}`,
    type: ActivityType.ADMIN,
    entityId: mass.id,
    entityType: "Mass",
  })

  redirect("/admin/masses")
}

export async function deleteMass(massId: string) {
  const admin = await requireAdmin()

  if (!massId) {
    return { error: "Mass ID is required" }
  }

  try {
    const existingMass = await prisma.mass.findUnique({
      where: { id: massId },
    })

    if (!existingMass) {
      return { error: "Mass not found" }
    }

    await prisma.mass.delete({
      where: { id: massId },
    })

    // Log activity
    // await logActivity({
    //   userId: admin.id,
    //   action: `Deleted mass: ${existingMass.title}`,
    //   type: ActivityType.ADMIN,
    //   entityId: massId,
    //   entityType: "Mass",
    // })

    return { success: "Mass deleted successfully" }
  } catch (error) {
    console.error("Error deleting mass:", error)
    return { error: "Failed to delete mass" }
  }
}


// Other existing functions remain unchanged

