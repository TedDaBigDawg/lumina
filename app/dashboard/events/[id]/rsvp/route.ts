import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const eventId = params.id
  const result = await rsvpToEvent(eventId)

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.redirect(new URL("/dashboard/events", request.url))
}

