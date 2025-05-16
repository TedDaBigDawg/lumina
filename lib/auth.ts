import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "./db"
import { logError } from "./error-utils"
import { executeDbOperation } from "./db-utils"
import { cache } from "react"
import jwt from "jsonwebtoken"


/**
 * Gets the current user session (cached for performance)
 * @returns The user session or null if not authenticated
 */

export const getSession = async () => {
  const sessionId = (await cookies()).get("userId")?.value
  const sessionRole = (await cookies()).get("role")?.value
  const sessionName = (await cookies()).get("name")?.value
  const sessionEmail = (await cookies()).get("email")?.value

  const Cookies = await cookies()
  console.log(Cookies.getAll())
  if (!sessionId) return null

  return {role: sessionRole, id: sessionId, name: sessionName, email: sessionEmail}
}


/**
 * Requires authentication for a route
 * @returns The authenticated user
 */
export async function requireAuth() {
  const user = await getSession()

  if (!user) {
    const currentPath = (await cookies()).get("path")?.value || "/"
    const redirectUrl = new URL(currentPath, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").pathname

    redirect(`/login?error=unauthenticated&redirectTo=${encodeURIComponent(redirectUrl)}`)
  }

  return user
}

/**
 * Requires admin role for a route
 * @returns The authenticated admin user
 */
export async function requireAdmin() {
  const user = await getSession()

  if (!user) {
    const currentPath = (await cookies()).get("path")?.value || "/"
    const redirectUrl = new URL(currentPath, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").pathname

    redirect(`/login?error=unauthenticated&redirectTo=${encodeURIComponent(redirectUrl)}`)
  }

  if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
    redirect("/not-authorized")
  }

  return user
}

/**
 * Requires superadmin role for a route
 * @returns The authenticated superadmin user
 */
export async function requireSuperadmin() {
  const user = await getSession()

  if (!user) {
    const currentPath = (await cookies()).get("path")?.value || "/"
    const redirectUrl = new URL(currentPath, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").pathname

    redirect(`/login?error=unauthenticated&redirectTo=${encodeURIComponent(redirectUrl)}`)
  }

  console.log("ROLE", user.role);
  if (user.role !== "SUPERADMIN") {
    redirect("/not-authorized")
  }

  return user
}

/**
 * Checks if the current user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getSession()
  return !!user
}

/**
 * Checks if the current user has admin privileges
 * @returns Boolean indicating if user has admin privileges
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getSession()
  return !!user && (user.role === "ADMIN" || user.role === "SUPERADMIN")
}

/**
 * Checks if the current user has superadmin privileges
 * @returns Boolean indicating if user has superadmin privileges
 */
export async function isSuperadmin(): Promise<boolean> {
  const user = await getSession()
  return !!user && user.role === "SUPERADMIN"
}

