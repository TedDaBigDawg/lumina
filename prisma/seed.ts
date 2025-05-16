import { PrismaClient, Role } from "@prisma/client"
import * as bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seed...")

  // Create default superadmin
  const hashedPassword = await bcrypt.hash("SuperAdmin123!", 10)

  const superadmin = await prisma.user.upsert({
    where: { email: "superadmin@church.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@church.com",
      password: hashedPassword,
      role: Role.SUPERADMIN,
    },
  })

  console.log(`Created superadmin: ${superadmin.email}`)

  // Create default church info if it doesn't exist
  const churchInfo = await prisma.churchInfo.findFirst()

  if (!churchInfo) {
    await prisma.churchInfo.create({
      data: {
        name: "St. Mary's Catholic Church",
        address: "123 Faith Street, Lagos",
        phone: "+234 800 123 4567",
        email: "contact@stmarys.com",
        mission: "To spread the love of Christ and serve our community.",
        vision: "A vibrant community of faith, hope, and love.",
        history: "Founded in 1950, St. Mary's has been serving the community for over 70 years.",
      },
    })
    console.log("Created default church information")
  }

  // Create default service times
  const existingServices = await prisma.service.count()

  if (existingServices === 0) {
    await prisma.service.createMany({
      data: [
        {
          title: "Sunday Mass",
          description: "Main Sunday celebration",
          dayOfWeek: 0, // Sunday
          time: "09:00",
        },
        {
          title: "Weekday Mass",
          description: "Daily celebration",
          dayOfWeek: 1, // Monday
          time: "07:30",
        },
        {
          title: "Weekday Mass",
          description: "Daily celebration",
          dayOfWeek: 3, // Wednesday
          time: "07:30",
        },
        {
          title: "Adoration",
          description: "Eucharistic adoration",
          dayOfWeek: 5, // Friday
          time: "17:00",
        },
      ],
    })
    console.log("Created default service times")
  }

  console.log("Database seed completed")
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

