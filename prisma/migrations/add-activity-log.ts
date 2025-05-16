// This is a manual migration script to be run after applying the schema changes
// Save this file and run it with: npx ts-node prisma/migrations/add-activity-log.ts

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting migration to add ActivityLog model...")

  try {
    // Check if the ActivityType enum type exists
    const hasActivityTypeEnum = await prisma.$queryRaw`
      SELECT typname FROM pg_type WHERE typname = 'activitytype'
    `

    if (Array.isArray(hasActivityTypeEnum) && hasActivityTypeEnum.length === 0) {
      // Create the ActivityType enum if it doesn't exist
      await prisma.$executeRaw`
        CREATE TYPE "ActivityType" AS ENUM ('PARISHIONER', 'ADMIN')
      `
      console.log("Successfully created ActivityType enum")
    } else {
      console.log("ActivityType enum already exists")
    }

    // Check if the ActivityLog table exists
    const hasActivityLogTable = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'ActivityLog'
    `

    if (Array.isArray(hasActivityLogTable) && hasActivityLogTable.length === 0) {
      // Create the ActivityLog table if it doesn't exist
      await prisma.$executeRaw`
        CREATE TABLE "ActivityLog" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "action" TEXT NOT NULL,
          "type" "ActivityType" NOT NULL,
          "entityId" TEXT,
          "entityType" TEXT,
          "read" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          
          CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `
      console.log("Successfully created ActivityLog table")
    } else {
      console.log("ActivityLog table already exists")
    }

    console.log("Migration completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

