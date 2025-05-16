"use server"

import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { logActivity } from "./activity-actions"
import { ActivityType } from "@prisma/client"
import { logError } from "@/lib/error-utils"
import { z } from "zod"
import { handleZodError } from "@/lib/error-utils"

// Validation schema for church info
const churchInfoSchema = z.object({
  name: z.string().min(2, "Church name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(5, "Phone number must be at least 5 characters"),
  email: z.string().email("Please enter a valid email address"),
  mission: z.string().optional(),
  vision: z.string().optional(),
  history: z.string().optional(),
})

export async function getChurchInfo() {
  try {
    // Get the first church info record or create one if it doesn't exist
    let churchInfo = await prisma.churchInfo.findFirst()

    if (!churchInfo) {
      // Create a default church info record if none exists
      churchInfo = await prisma.churchInfo.create({
        data: {
          name: "Church Name",
          address: "Church Address",
          phone: "Church Phone",
          email: "church@example.com",
          mission: "Our mission...",
          vision: "Our vision...",
          history: "Our history...",
        },
      })
    }

    return churchInfo
  } catch (error) {
    logError(error, "GET_CHURCH_INFO")
    throw new Error("Failed to fetch church information")
  }
}

export async function updateChurchInfo(formData: FormData) {
  try {
    const session = await getSession()

    if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
      return { error: "Unauthorized" }
    }

    const name = formData.get("name") as string
    const address = formData.get("address") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const mission = formData.get("mission") as string
    const vision = formData.get("vision") as string
    const history = formData.get("history") as string

    // Validate input
    const result = churchInfoSchema.safeParse({
      name,
      address,
      phone,
      email,
      mission,
      vision,
      history,
    })

    if (!result.success) {
      return { error: handleZodError(result.error).message }
    }

    // Get the first church info record or create one if it doesn't exist
    let churchInfo = await prisma.churchInfo.findFirst()

    if (churchInfo) {
      // Update existing record
      churchInfo = await prisma.churchInfo.update({
        where: { id: churchInfo.id },
        data: {
          name,
          address,
          phone,
          email,
          mission,
          vision,
          history,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new record
      churchInfo = await prisma.churchInfo.create({
        data: {
          name,
          address,
          phone,
          email,
          mission,
          vision,
          history,
        },
      })
    }

    // Log activity
    await logActivity({
      userId: session.id,
      action: `Updated church information`,
      type: ActivityType.ADMIN,
      entityId: churchInfo.id,
      entityType: "ChurchInfo",
    })

    return { success: true, churchInfo }
  } catch (error) {
    logError(error, "UPDATE_CHURCH_INFO")
    return { error: "Failed to update church information" }
  }
}

export async function getChurchServices() {
  try {
    const services = await prisma.service.findMany({
      orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
    })

    return services
  } catch (error) {
    logError(error, "GET_CHURCH_SERVICES")
    throw new Error("Failed to fetch church services")
  }
}

export async function createChurchService(formData: FormData) {
  try {
    const session = await getSession()

    if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
      return { error: "Unauthorized" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const dayOfWeekStr = formData.get("dayOfWeek") as string
    const time = formData.get("time") as string

    if (!title || !dayOfWeekStr || !time) {
      return { error: "Required fields are missing" }
    }

    const dayOfWeek = Number.parseInt(dayOfWeekStr, 10)

    if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return { error: "Invalid day of week" }
    }

    const service = await prisma.service.create({
      data: {
        title,
        description,
        dayOfWeek,
        time,
      },
    })

    // Log activity
    await logActivity({
      userId: session.id,
      action: `Created new church service: ${title}`,
      type: ActivityType.ADMIN,
      entityId: service.id,
      entityType: "Service",
    })

    return { success: true, service }
  } catch (error) {
    logError(error, "CREATE_CHURCH_SERVICE")
    return { error: "Failed to create church service" }
  }
}

export async function updateChurchService(id: string, formData: FormData) {
  try {
    const session = await getSession()

    if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
      return { error: "Unauthorized" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const dayOfWeekStr = formData.get("dayOfWeek") as string
    const time = formData.get("time") as string

    if (!title || !dayOfWeekStr || !time) {
      return { error: "Required fields are missing" }
    }

    const dayOfWeek = Number.parseInt(dayOfWeekStr, 10)

    if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return { error: "Invalid day of week" }
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        title,
        description,
        dayOfWeek,
        time,
      },
    })

    // Log activity
    await logActivity({
      userId: session.id,
      action: `Updated church service: ${title}`,
      type: ActivityType.ADMIN,
      entityId: service.id,
      entityType: "Service",
    })

    return { success: true, service }
  } catch (error) {
    logError(error, "UPDATE_CHURCH_SERVICE")
    return { error: "Failed to update church service" }
  }
}

export async function deleteChurchService(id: string) {
  try {
    const session = await getSession()

    if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
      return { error: "Unauthorized" }
    }

    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      return { error: "Service not found" }
    }

    await prisma.service.delete({
      where: { id },
    })

    // Log activity
    await logActivity({
      userId: session.id,
      action: `Deleted church service: ${service.title}`,
      type: ActivityType.ADMIN,
      entityId: id,
      entityType: "Service",
    })

    return { success: true }
  } catch (error) {
    logError(error, "DELETE_CHURCH_SERVICE")
    return { error: "Failed to delete church service" }
  }
}

