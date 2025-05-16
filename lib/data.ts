// lib/data.ts
import { prisma } from "@/lib/db"

export async function getChurchInfo() {
  return await prisma.churchInfo.findFirst()
}
