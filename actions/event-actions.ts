"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { requireAdmin, requireAuth } from "@/lib/auth"
import { getChurchInfo } from "./church-info-actions"
import { ActivityType } from "@prisma/client"
import { logActivity } from "./activity-actions"

export async function createEvent(formData: FormData) {
  await requireAuth()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const dateString = formData.get("date") as string
  const timeString = formData.get("time") as string
  let location = formData.get("location") as string
  const capacityString = formData.get("capacity") as string
  const useDefaultLocation = formData.get("useDefaultLocation") === "true"

  if (!title || !description || !dateString || !timeString) {
    return { error: "Required fields are missing" }
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

  // const date = new Date(dateString)

  const [year, month, day] = dateString.split("-").map(Number)
  const [hours, minutes] = timeString.split(":").map(Number)
  const date = new Date(year, month - 1, day, hours, minutes)

  const capacity = capacityString ? Number.parseInt(capacityString) : null

  const event = await prisma.event.create({
    data: {
      title,
      description,
      date,
      location,
      capacity,
    },
  })

  // Log activity
  const user = await requireAuth()
  await logActivity({
    userId: user.id,
    action: `Created new event: ${title}`,
    type: ActivityType.ADMIN,
    entityId: event.id,
    entityType: "Event",
  })

  redirect("/admin/events")
}

export async function updateEvent(id: string, formData: FormData) {
  await requireAuth()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const dateString = formData.get("date") as string
  let location = formData.get("location") as string
  const capacityString = formData.get("capacity") as string
  const useDefaultLocation = formData.get("useDefaultLocation") === "true"

  if (!title || !description || !dateString) {
    return { error: "Required fields are missing" }
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

  const date = new Date(dateString)
  const capacity = capacityString ? Number.parseInt(capacityString) : null

  const event = await prisma.event.update({
    where: { id },
    data: {
      title,
      description,
      date,
      location,
      capacity,
    },
  })

  // Log activity
  const user = await requireAuth()
  await logActivity({
    userId: user.id,
    action: `Updated event: ${title}`,
    type: ActivityType.ADMIN,
    entityId: event.id,
    entityType: "Event",
  })

  redirect("/admin/events")
}


export async function deleteEvent(eventId: string) {
  const admin = await requireAdmin()

  if (!eventId) {
    return { error: "Event ID is required" }
  }

  try {
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!existingEvent) {
      return { error: "Event not found" }
    }

    await prisma.event.delete({
      where: { id: eventId },
    })

    // Log activity
    // await logActivity({
    //   userId: admin.id,
    //   action: `Deleted event: ${existingevent.title}`,
    //   type: ActivityType.ADMIN,
    //   entityId: eventId,
    //   entityType: "event",
    // })

    return { success: "Event deleted successfully" }
  } catch (error) {
    console.error("Error deleting event:", error)
    return { error: "Failed to delete event" }
  }
}


export async function getUpcomingEvents(limit = 2) {
  try {
    const events = await prisma.event.findMany({
      where: {
        date: { gte: new Date() },
      },
      orderBy: { date: "asc" },
      take: limit,
    })

    return events
  } catch (error) {
    console.error("Error fetching upcoming events:", error)
    return []
  }
}

export async function getUpcomingMasses(limit = 2) {
  try {
    const masses = await prisma.mass.findMany({
      where: {
        date: { gte: new Date() },
      },
      orderBy: { date: "asc" },
      take: limit,
    })

    return masses
  } catch (error) {
    console.error("Error fetching upcoming masses:", error)
    return []
  }
}

// Other existing functions remain unchanged

