import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { createErrorResponse, logError } from "@/lib/error-utils"
import { executeDbOperation } from "@/lib/db-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(createErrorResponse("Unauthorized", 401), { status: 401 })
    }

    const [event, error] = await executeDbOperation(async () => {
      return await prisma.event.findUnique({
        where: { id: params.id },
        include: {
          rsvps: {
            where: { userId: session.id },
            select: { id: true },
          },
          _count: {
            select: { rsvps: true },
          },
        },
      })
    }, "GET_EVENT")

    if (error) {
      return NextResponse.json(createErrorResponse("Failed to fetch event", 500), { status: 500 })
    }

    if (!event) {
      return NextResponse.json(createErrorResponse("Event not found", 404), { status: 404 })
    }

    // Add a hasRsvp field for the current user
    const eventWithRsvpStatus = {
      ...event,
      hasRsvp: event.rsvps.length > 0,
      rsvps: undefined, // Remove the rsvps array from the response
    }

    return NextResponse.json(eventWithRsvpStatus)
  } catch (error) {
    logError(error, "API_GET_EVENT")
    return NextResponse.json(createErrorResponse("Failed to fetch event", 500), { status: 500 })
  }
}

