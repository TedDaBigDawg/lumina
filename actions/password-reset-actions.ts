"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { logError } from "@/lib/error-utils"
import crypto from "crypto"

// Validation schema for password reset request
const resetRequestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

// Validation schema for password reset
const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

// Request password reset
export async function requestPasswordReset(formData: FormData) {
  try {
    const email = formData.get("email") as string

    // Validate input
    const result = resetRequestSchema.safeParse({ email })
    if (!result.success) {
      return { error: result.error.errors[0].message }
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return { success: true }
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour from now

    // Store token in database
    await prisma.passwordReset.upsert({
      where: { userId: user.id },
      update: {
        token,
        expiresAt,
      },
      create: {
        userId: user.id,
        token,
        expiresAt,
      },
    })

    // In a real app, send email with reset link
    // For now, just log it
    console.log(`Password reset link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`)

    return { success: true }
  } catch (error) {
    logError(error, "REQUEST_PASSWORD_RESET")
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Reset password
export async function resetPassword(formData: FormData) {
  try {
    const token = formData.get("token") as string
    const password = formData.get("password") as string

    // Validate input
    const result = resetPasswordSchema.safeParse({ token, password })
    if (!result.success) {
      return { error: result.error.errors[0].message }
    }

    // Find valid reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    })

    if (!resetRecord) {
      return { error: "Invalid or expired reset token" }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: {
        password: hashedPassword,
      },
    })

    // Delete used token
    await prisma.passwordReset.delete({
      where: { id: resetRecord.id },
    })

    return { success: true }
  } catch (error) {
    logError(error, "RESET_PASSWORD")
    return { error: "An unexpected error occurred. Please try again." }
  }
}

