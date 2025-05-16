"use server"

import { prisma } from "@/lib/db"
import { requireAuth, requireAdmin, getSession } from "@/lib/auth"
import { ActivityType } from "@prisma/client"
import { logError } from "@/lib/error-utils"
import { cache } from "react"

// Interface for activity log entry
interface ActivityLogEntry {
  userId: string
  action: string
  type: ActivityType
  entityId?: string
  entityType?: string
}

// Function to create an activity log entry
export async function logActivity(entry: ActivityLogEntry) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        type: entry.type,
        entityId: entry.entityId,
        entityType: entry.entityType,
      },
    })
    return { success: true }
  } catch (error) {
    logError(error, "LOG_ACTIVITY")
    return { error: "Failed to log activity" }
  }
}

// Function to get user activities with caching for better performance
export const getUserActivities = cache(async (limit?: number) => {
  try {
    const user = await requireAuth()

    const activities = await prisma.activityLog.findMany({
      where: {
        userId: user.id,
        type: ActivityType.PARISHIONER,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    return activities
  } catch (error) {
    logError(error, "GET_USER_ACTIVITIES")
    return []
  }
})

// Function to get admin activities
export async function getAdminActivities(limit?: number) {
  try {
    const admin = await requireAdmin()

    const activities = await prisma.activityLog.findMany({
      where: {
        type: ActivityType.ADMIN,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return activities
  } catch (error) {
    logError(error, "GET_ADMIN_ACTIVITIES")
    throw new Error("Failed to fetch activities")
  }
}

// Function to get superadmin activities
export async function getSuperadminActivities(limit?: number) {
  try {
    // Ensure user is superadmin
    const user = await requireAuth()
    if (user.role !== "SUPERADMIN") {
      throw new Error("Unauthorized")
    }

    const activities = await prisma.activityLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return activities
  } catch (error) {
    logError(error, "GET_SUPERADMIN_ACTIVITIES")
    throw new Error("Failed to fetch activities")
  }
}

// Function to mark an activity as read
export async function markActivityAsRead(id: string) {
  try {
    const user = await requireAuth()

    // Ensure the activity belongs to the user
    const activity = await prisma.activityLog.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!activity || activity.userId !== user.id) {
      return { error: "Unauthorized" }
    }

    await prisma.activityLog.update({
      where: { id },
      data: { read: true },
    })

    return { success: true }
  } catch (error) {
    logError(error, "MARK_ACTIVITY_AS_READ")
    return { error: "Failed to mark activity as read" }
  }
}

// Function to mark all activities as read
export async function markAllActivitiesAsRead() {
  try {
    const user = await requireAuth()

    await prisma.activityLog.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    })

    return { success: true }
  } catch (error) {
    logError(error, "MARK_ALL_ACTIVITIES_AS_READ")
    return { error: "Failed to mark activities as read" }
  }
}

// Function to get unread activities count with caching
export const getUnreadActivitiesCount = cache(async () => {
  try {
    const session = await getSession()

    if (!session) {
      return 0
    }

    const count = await prisma.activityLog.count({
      where: {
        userId: session.id,
        read: false,
      },
    })

    return count
  } catch (error) {
    logError(error, "GET_UNREAD_ACTIVITIES_COUNT")
    return 0
  }
})

// Function to get system statistics
export async function getSystemStats() {
  try {
    // Ensure user is admin or superadmin
    const user = await requireAuth()
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      throw new Error("Unauthorized")
    }

    const [
      totalUsers,
      totalAdmins,
      totalParishioners,
      totalEvents,
      totalMasses,
      totalPayments,
      totalMassIntentions,
      totalThanksgivings,
      recentActivities,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "PARISHIONER" } }),
      prisma.event.count(),
      prisma.mass.count(),
      prisma.payment.count(),
      prisma.massIntention.count(),
      prisma.thanksgiving.count(),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ])

    return {
      totalUsers,
      totalAdmins,
      totalParishioners,
      totalEvents,
      totalMasses,
      totalPayments,
      totalMassIntentions,
      totalThanksgivings,
      recentActivities,
    }
  } catch (error) {
    logError(error, "GET_SYSTEM_STATS")
    throw new Error("Failed to fetch system statistics")
  }
}

