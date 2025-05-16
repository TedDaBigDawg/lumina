// This is a manual migration script to be run after applying the schema changes
// Save this file and run it with: npx ts-node prisma/migrations/add-superadmin.ts

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting migration to add superadmin user...")

  try {
    // Check if a superadmin already exists
    const existingSuperadmin = await prisma.user.findFirst({
      where: { role: "SUPERADMIN" },
    })

    if (existingSuperadmin) {
      console.log("Superadmin user already exists:", existingSuperadmin.email)
    } else {
      // Create a superadmin user
      const superadmin = await prisma.user.create({
        data: {
          name: "Super Admin",
          email: "superadmin@church.com",
          // In a real app, you would hash this password
          password: "SuperAdmin123!",
          role: "SUPERADMIN",
        },
      })

      console.log("Successfully created superadmin user:", superadmin.email)
    }

    console.log("Migration completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

