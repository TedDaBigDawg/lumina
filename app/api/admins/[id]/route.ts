import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const admin = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!admin) {
      return NextResponse.json({ error: "Administrator not found" }, { status: 404 })
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json({ error: "User is not an administrator" }, { status: 400 })
    }

    return NextResponse.json(admin)
  } catch (error) {
    console.error("Error fetching administrator:", error)
    return NextResponse.json({ error: "Failed to fetch administrator" }, { status: 500 })
  }
}

