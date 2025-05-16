// This is a manual migration script to be run after applying the schema changes
// Save this file and run it with: npx ts-node prisma/migrations/migration.ts

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting migration from donations to payments...")

  try {
    // 1. Get all existing donations
    const donations = await prisma.$queryRaw`
      SELECT * FROM "Donation"
    `

    console.log(`Found ${donations.length} donations to migrate`)

    // 2. Insert donations into the new payments table
    for (const donation of donations) {
      await prisma.payment.create({
        data: {
          userId: donation.userId,
          amount: donation.amount,
          type: "DONATION",
          category: donation.category,
          description: donation.description || null,
          status: "PAID", // Assuming all existing donations were paid
          createdAt: donation.createdAt,
          updatedAt: donation.updatedAt,
        },
      })
    }

    console.log("Successfully migrated donations to payments")

    // 3. Get all existing donation goals
    const donationGoals = await prisma.$queryRaw`
      SELECT * FROM "DonationGoal"
    `

    console.log(`Found ${donationGoals.length} donation goals to migrate`)

    // 4. Insert donation goals into the new payment goals table
    for (const goal of donationGoals) {
      await prisma.paymentGoal.create({
        data: {
          title: goal.title,
          description: goal.description,
          category: goal.category,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          startDate: goal.startDate,
          endDate: goal.endDate,
          createdAt: goal.createdAt,
          updatedAt: goal.updatedAt,
        },
      })
    }

    console.log("Successfully migrated donation goals to payment goals")

    // 5. Drop the old tables (optional - uncomment if you want to drop the tables)
    // await prisma.$executeRaw`DROP TABLE IF EXISTS "Donation" CASCADE`
    // await prisma.$executeRaw`DROP TABLE IF EXISTS "DonationGoal" CASCADE`
    // console.log('Dropped old donation tables')

    console.log("Migration completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

