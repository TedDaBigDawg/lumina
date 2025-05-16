import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { createErrorResponse, logError } from "@/lib/error-utils"
import { executeDbOperation } from "@/lib/db-utils"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(createErrorResponse("Unauthorized", 401), { status: 401 })
    }

    // Different stats based on user role
    if (session.role === "SUPERADMIN" || session.role === "ADMIN") {
      // Admin stats - all data
      const [stats, error] = await executeDbOperation(async () => {
        const [
          totalUsers,
          totalEvents,
          totalMassIntentions,
          totalThanksgivings,
          totalDonations,
          upcomingMasses,
          recentPayments,
        ] = await Promise.all([
          prisma.user.count({ where: { role: "PARISHIONER" } }),
          prisma.event.count(),
          prisma.massIntention.count(),
          prisma.thanksgiving.count(),
          prisma.payment.aggregate({
            where: { status: "PAID" },
            _sum: { amount: true },
          }),
          prisma.mass.findMany({
            where: {
              date: {
                gte: new Date(),
              },
            },
            orderBy: {
              date: "asc",
            },
            take: 5,
          }),
          prisma.payment.findMany({
            where: {
              status: "PAID",
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          }),
        ])

        return {
          totalUsers,
          totalEvents,
          totalMassIntentions,
          totalThanksgivings,
          totalDonations: totalDonations._sum.amount || 0,
          upcomingMasses,
          recentPayments,
        }
      }, "GET_ADMIN_DASHBOARD_STATS")

      if (error) {
        return NextResponse.json(createErrorResponse("Failed to fetch dashboard stats", 500), { status: 500 })
      }

      return NextResponse.json(stats)
    } else {
      // Parishioner stats - only their data
      const [stats, error] = await executeDbOperation(async () => {
        const [totalEvents, totalMassIntentions, totalThanksgivings, totalDonations, upcomingMasses, userPayments] =
          await Promise.all([
            prisma.event.count(),
            prisma.massIntention.count({ where: { userId: session.id } }),
            prisma.thanksgiving.count({ where: { userId: session.id } }),
            prisma.payment.aggregate({
              where: {
                userId: session.id,
                status: "PAID",
              },
              _sum: { amount: true },
            }),
            prisma.mass.findMany({
              where: {
                date: {
                  gte: new Date(),
                },
              },
              orderBy: {
                date: "asc",
              },
              take: 3,
            }),
            prisma.payment.findMany({
              where: {
                userId: session.id,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 5,
            }),
          ])

        return {
          totalUsers: 0, // Hide from regular users
          totalEvents,
          totalMassIntentions,
          totalThanksgivings,
          totalDonations: totalDonations._sum.amount || 0,
          upcomingMasses,
          userPayments,
        }
      }, "GET_USER_DASHBOARD_STATS")

      if (error) {
        return NextResponse.json(createErrorResponse("Failed to fetch dashboard stats", 500), { status: 500 })
      }

      return NextResponse.json(stats)
    }
  } catch (error) {
    logError(error, "API_DASHBOARD_STATS")
    return NextResponse.json(createErrorResponse("Failed to fetch dashboard stats", 500), { status: 500 })
  }
}

