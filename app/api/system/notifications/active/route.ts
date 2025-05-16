import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { withErrorHandling } from "@/lib/api-utils"

// Interface for system notification
interface SystemNotification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  expiresAt?: string
  userRole?: string[]
  createdAt: Date
}

export async function GET() {
  return withErrorHandling(async () => {
    const session = await getSession()

    // If no session, return null notification
    if (!session) {
      return null
    }

    try {
      // In a real application, you would fetch notifications from the database
      // For now, we'll check if there are any active notifications in the database
      const notification = await prisma.systemNotification.findFirst({
        where: {
          OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
          AND: [
            {
              OR: [{ userRole: null }, { userRole: session.role }],
            },
          ],
          active: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      // If no notification found, return null
      if (!notification) {
        return null
      }

      // Return the notification
      return notification
    } catch (error) {
      // If the SystemNotification table doesn't exist yet, just return null
      // This prevents errors during development
      console.error("Error fetching system notifications:", error)
      return null
    }
  })
}

