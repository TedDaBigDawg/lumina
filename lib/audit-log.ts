import { prisma } from "./db"
import { logError } from "./error-utils"
import { ActivityType } from "@prisma/client"

// Interface for audit log entry
export interface AuditLogEntry {
  userId: string
  action: string
  entityId?: string
  entityType?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

// Function to create an audit log entry
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        entityId: entry.entityId,
        entityType: entry.entityType,
        type: ActivityType.ADMIN, // Audit logs are always admin type
        // Store additional details as JSON in the action field
        // In a real application, you might want to add a 'details' field to the ActivityLog model
      },
    })
  } catch (error) {
    logError(error, "CREATE_AUDIT_LOG")
  }
}

// Function to get audit logs for a specific entity
export async function getEntityAuditLogs(entityId: string, entityType: string): Promise<any[]> {
  try {
    return await prisma.activityLog.findMany({
      where: {
        entityId,
        entityType,
        type: ActivityType.ADMIN,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (error) {
    logError(error, "GET_ENTITY_AUDIT_LOGS")
    return []
  }
}

// Function to get audit logs for a specific user
export async function getUserAuditLogs(userId: string): Promise<any[]> {
  try {
    return await prisma.activityLog.findMany({
      where: {
        userId,
        type: ActivityType.ADMIN,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (error) {
    logError(error, "GET_USER_AUDIT_LOGS")
    return []
  }
}

// Function to get all audit logs
export async function getAllAuditLogs(page = 1, pageSize = 20): Promise<{ logs: any[]; total: number }> {
  try {
    const skip = (page - 1) * pageSize

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: {
          type: ActivityType.ADMIN,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.activityLog.count({
        where: {
          type: ActivityType.ADMIN,
        },
      }),
    ])

    return { logs, total }
  } catch (error) {
    logError(error, "GET_ALL_AUDIT_LOGS")
    return { logs: [], total: 0 }
  }
}

