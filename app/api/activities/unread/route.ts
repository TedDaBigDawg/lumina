import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { createApiResponse, withErrorHandling } from "@/lib/api-utils"

export async function GET() {
  return withErrorHandling(async () => {
    const session = await getSession()

    if (!session) {
      return createApiResponse({
        error: "Unauthorized",
        statusCode: 401,
      })
    }

    // Get unread activities for the user
    const [activities, count] = await Promise.all([
      prisma.activityLog.findMany({
        where: {
          userId: session.id,
          read: false,
          // For admin users, include admin activities
          ...(session.role === "ADMIN" || session.role === "SUPERADMIN" ? {} : { type: "PARISHIONER" }),
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),

      prisma.activityLog.count({
        where: {
          userId: session.id,
          read: false,
          // For admin users, include admin activities
          ...(session.role === "ADMIN" || session.role === "SUPERADMIN" ? {} : { type: "PARISHIONER" }),
        },
      }),
    ])
    // console.log('Activities:', activities)
    // console.log('Count:', count)

    return { activities, count }
  })
}

export async function POST() {
  return withErrorHandling(async () => {
    const session = await getSession()

    if (!session) {
      return createApiResponse({
        error: "Unauthorized",
        statusCode: 401,
      })
    }

    // Mark all activities as read
    const result = await prisma.activityLog.updateMany({
      where: {
        userId: session.id,
        read: false,
      },
      data: {
        read: true,
      },
    })

    return { success: true, count: result.count }
  })
}

