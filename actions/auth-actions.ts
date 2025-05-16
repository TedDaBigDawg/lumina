"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { ActivityType } from "@prisma/client"
import { logActivity } from "./activity-actions"
import { loginSchema, registerSchema } from "@/lib/validations"
import { handleZodError, logError } from "@/lib/error-utils"
import * as bcrypt from "bcrypt"

// import bcrypt from "bcrypt";
// import { prisma } from "./prisma"; // Assuming prisma is imported from somewhere
// import { loginSchema } from "./validations"; // Assuming validation is already handled in a separate file
// import { logError, logActivity } from "./logger"; // Logger functions
// import { cookies } from "next/headers"; // If using cookies from Next.js
// import { redirect } from "next/navigation"; // If using Next.js redirect function
// import { ActivityType } from "./types"; // Assuming ActivityType is imported from a types file

export async function login(formData: { email: string; password: string }) {
  
  // console.log("Form data:", formData);
  // console.log("Form data keys:", Array.from(formData.keys()));
  // console.log("Hello");
  // console.log("Form data entries:", Array.from(formData.entries()));
  try {
    const { email, password } = formData;

    // console.log("Starting login process...");
    // console.log("Email:", email);
    // console.log("Password:", password);

    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    // Step 2: Validate form data using Zod schema
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errorMessage = handleZodError(result.error).message;
      return { error: errorMessage };
    }

    // Step 3: Find user in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Step 4: Check if the user exists
    if (!user) {
      logError({ message: "Invalid login attempt - User not found", email }, "AUTH");
      return { error: "Invalid email or password" };
    }

    // Step 5: Check if the password matches
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      logError({ message: "Invalid login attempt - Incorrect password", email }, "AUTH");
      return { error: "Invalid email or password" };
    }

    // // Step 6: Set cookie for the user
    // const cookieStore = await cookies();
    // cookieStore.set("userId", user.id, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: 60 * 60 * 24 * 7, // 1 week
    //   path: "/",
    // });

    // Step 7: Log user activity (Successful login)
    await logActivity({
      userId: user.id,
      action: "Logged in successfully",
      type: ActivityType.PARISHIONER,
    });

    // Step 8: Redirect the user
    let redirectUrl: string;

    switch (user.role) {
      case "SUPERADMIN":
        redirectUrl = "/superadmin/dashboard";
        break;
      case "ADMIN":
        redirectUrl = "/admin/dashboard";
        break;
      case "PARISHIONER":
        redirectUrl = "/dashboard"; // or maybe "/parishioner/home" if you want to customize it further
        break;
      default:
        redirectUrl = "/"; // fallback route
    }

    // If a redirectTo was passed in (like from a login guard), it takes precedence
    // redirect(redirectUrl);

    // return redirect(redirectUrl);

    return { user: user, redirectUrl: redirectUrl };

  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      // Let Next.js handle it silently
      return;
    }
    console.error("Caught error:", error);  // Added more details to the catch block
    // Step 9: Catch and log any errors
    logError(error, "LOGIN");
    console.log("Login error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { error: `Error: ${errorMessage}` };
  }
}


export async function register(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const phone = (formData.get("phone") as string) || undefined

    // Validate input
    const result = registerSchema.safeParse({ name, email, password, phone })
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

    // In a real app, you would hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: "PARISHIONER", // Default role
      },
    })

    // Set a cookie with the user ID
    const cookieStore = await cookies()
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    cookieStore.set("role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    cookieStore.set("email", user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    cookieStore.set("name", user.name, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // Log activity for the user
    await logActivity({
      userId: user.id,
      action: "Account created successfully",
      type: ActivityType.PARISHIONER,
    })

    // Log activity for admin
    await logActivity({
      userId: user.id,
      action: `New parishioner registered: ${name} (${email})`,
      type: ActivityType.ADMIN,
    })

    // redirect("/dashboard")
  } catch (error) {
    console.error("Caught error:", error)  // Added more details to the catch block
    logError(error, "REGISTER")

    // Handle specific database errors
    if ((error as { code?: string }).code === "P2002") {
      return { error: "User with this email already exists" }
    }

    return { error: "Registration failed. Please try again." }
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("userId")
    cookieStore.delete("role")
    // Log activity
    await logActivity({
      userId: "unknown", // Since the user is logging out, we don't have the user ID
      action: "Logged out successfully",
      type: ActivityType.PARISHIONER,
    })
    const redirectUrl = "/login";
    return { redirectUrl };

  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      // Let Next.js handle it silently
      return;
    }
    console.error("Caught error:", error);  // Added more details to the catch block
    // Step 9: Catch and log any errors
    logError(error, "LOGOUT");
    console.log("Logout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { error: `Error: ${errorMessage}` };
  }
}

