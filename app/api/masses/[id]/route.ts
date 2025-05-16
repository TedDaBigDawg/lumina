import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const mass = await prisma.mass.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            massIntentions: true,
            thanksgivings: true,
          },
        },
      },
    })

    if (!mass) {
      return NextResponse.json({ error: "Mass not found" }, { status: 404 })
    }

    return NextResponse.json(mass)
  } catch (error) {
    console.error("Error fetching mass:", error)
    return NextResponse.json({ error: "Failed to fetch mass" }, { status: 500 })
  }
}

