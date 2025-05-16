"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { requireSuperadmin } from "@/lib/auth"
import { ActivityType } from "@prisma/client"
import { logActivity } from "./activity-actions"
import { handleZodError, logError } from "@/lib/error-utils"
import { z } from "zod"
import bcrypt from "bcryptjs"

// Validation schema for creating/updating admins
const adminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .optional(),
  phone: z.string().optional(),
})

export async function createAdmin(formData: FormData) {
  try {
    const superadmin = await requireSuperadmin()

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const phone = (formData.get("phone") as string) || undefined

    // Validate input
    const result = adminSchema.safeParse({ name, email, password, phone })
    if (!result.success) {
      return { error: handleZodError(result.error).message }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)


    // Create the admin user
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // In a real app, you would hash the password
        phone,
        role: "ADMIN",
      },
    })

    // Log activity
    await logActivity({
      userId: superadmin.id,
      action: `Created new administrator: ${name} (${email})`,
      type: ActivityType.ADMIN,
      entityId: admin.id,
      entityType: "User",
    })

    return { success: true, admin }
  } catch (error) {
    logError(error, "CREATE_ADMIN")
    return { error: "Failed to create administrator" }
  }
}

export async function updateAdmin(id: string, formData: FormData) {
  try {
    const superadmin = await requireSuperadmin()

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = (formData.get("phone") as string) || undefined

    // Validate input
    const result = adminSchema.safeParse({ name, email, phone })
    if (!result.success) {
      return { error: handleZodError(result.error).message }
    }

    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingAdmin) {
      return { error: "Administrator not found" }
    }

    if (existingAdmin.role !== "ADMIN") {
      return { error: "User is not an administrator" }
    }

    // Check if email is being changed and if it's already in use
    if (email !== existingAdmin.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email },
      })

      if (emailInUse) {
        return { error: "Email is already in use" }
      }
    }

    // Update the admin
    const admin = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        updatedAt: new Date(),
      },
    })

    // Log activity
    await logActivity({
      userId: superadmin.id,
      action: `Updated administrator: ${name} (${email})`,
      type: ActivityType.ADMIN,
      entityId: admin.id,
      entityType: "User",
    })

    return { success: true, admin }
  } catch (error) {
    logError(error, "UPDATE_ADMIN")
    return { error: "Failed to update administrator" }
  }
}

export async function deleteAdmin(id: string) {
  try {
    const superadmin = await requireSuperadmin()

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id },
    })

    if (!admin) {
      return { error: "Administrator not found" }
    }

    if (admin.role !== "ADMIN") {
      return { error: "User is not an administrator" }
    }

    // Delete the admin
    await prisma.user.delete({
      where: { id },
    })

    // Log activity
    await logActivity({
      userId: superadmin.id,
      action: `Deleted administrator: ${admin.name} (${admin.email})`,
      type: ActivityType.ADMIN,
      entityId: id,
      entityType: "User",
    })

    redirect("/superadmin/admins")
  } catch (error) {
    logError(error, "DELETE_ADMIN")
    return { error: "Failed to delete administrator" }
  }
}

export async function resetAdminPassword(id: string) {
  try {
    const superadmin = await requireSuperadmin()

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id },
    })

    if (!admin) {
      return { error: "Administrator not found" }
    }

    if (admin.role !== "ADMIN") {
      return { error: "User is not an administrator" }
    }

    // Generate a random password
    const newPassword = generateRandomPassword()

    // Update the admin's password
    await prisma.user.update({
      where: { id },
      data: {
        password: newPassword, // In a real app, you would hash the password
        updatedAt: new Date(),
      },
    })

    // Log activity
    await logActivity({
      userId: superadmin.id,
      action: `Reset password for administrator: ${admin.name} (${admin.email})`,
      type: ActivityType.ADMIN,
      entityId: admin.id,
      entityType: "User",
    })

    return { success: true, newPassword }
  } catch (error) {
    logError(error, "RESET_ADMIN_PASSWORD")
    return { error: "Failed to reset administrator password" }
  }
}

// Helper function to generate a random password
function generateRandomPassword() {
  const length = 12
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""

  // Ensure at least one uppercase, one lowercase, one number, and one special character
  password += "A" // Uppercase
  password += "a" // Lowercase
  password += "1" // Number
  password += "!" // Special character

  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

