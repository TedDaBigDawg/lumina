// This is a manual migration script to be run after applying the schema changes
// Save this file and run it with: npx ts-node prisma/migrations/add-phone-field.ts

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting migration to add phone field to User model...")

  try {
    // Check if the column already exists
    const hasPhoneColumn = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'phone'
    `

    if (Array.isArray(hasPhoneColumn) && hasPhoneColumn.length === 0) {
      // Add the phone column if it doesn't exist
      await prisma.$executeRaw`
        ALTER TABLE "User" ADD COLUMN "phone" TEXT
      `
      console.log("Successfully added phone field to User model")
    } else {
      console.log("Phone field already exists in User model")
    }

    console.log("Migration completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

