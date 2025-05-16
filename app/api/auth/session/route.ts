import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createErrorResponse, logError } from "@/lib/error-utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user: session })
  } catch (error) {
    logError(error, "API_SESSION")
    return NextResponse.json(createErrorResponse("Failed to get session", 500), { status: 500 })
  }
}

