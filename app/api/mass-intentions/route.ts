import type { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { createApiResponse, validateRequestData, withErrorHandling } from "@/lib/api-utils"

// Schema for creating a mass intention
const createMassIntentionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  intention: z.string().min(1, "Intention is required"),
  massId: z.string().uuid("Invalid mass ID"),
})

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const session = await getSession()

    if (!session) {
      return createApiResponse({
        error: "Unauthorized",
        statusCode: 401,
      })
    }

    const searchParams = request.nextUrl.searchParams
    const massId = searchParams.get("massId")
    const status = searchParams.get("status")

    // Build query with filters
    const query: any = {
      where: {
        userId: session.role === "ADMIN" || session.role === "SUPERADMIN" ? undefined : session.id,
        ...(massId && { massId }),
        ...(status && { status: status.toUpperCase() }),
      },
      include: {
        mass: true,
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

    // Execute query with proper error handling
    const massIntentions = await prisma.massIntention.findMany(query)

    return massIntentions
  })
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const session = await getSession()

    if (!session) {
      return createApiResponse({
        error: "Unauthorized",
        statusCode: 401,
      })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequestData(body, (data) => {
      const result = createMassIntentionSchema.safeParse(data)
      return {
        success: result.success,
        error: result.success ? undefined : result.error,
        data: result.success ? result.data : undefined,
      }
    })

    if (!validation.isValid) {
      return createApiResponse({
        error: validation.error,
        statusCode: 400,
      })
    }

    const { name, intention, massId } = validation.data!

    // Check if mass exists and has available slots
    const mass = await prisma.mass.findUnique({
      where: { id: massId },
    })

    if (!mass) {
      return createApiResponse({
        error: "Mass not found",
        statusCode: 404,
      })
    }

    if (mass.availableIntentionsSlots <= 0) {
      return createApiResponse({
        error: "No available slots for mass intentions for this mass",
        statusCode: 400,
      })
    }

    // Use a transaction to ensure data consistency
    const [massIntention, error] = await prisma.$transaction(async (tx) => {
      try {
        // Create the mass intention
        const massIntention = await tx.massIntention.create({
          data: {
            name,
            intention,
            userId: session.id,
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

        return [massIntention, null]
      } catch (error) {
        return [null, error]
      }
    })

    if (error) {
      throw error
    }

    return massIntention
  })
}

