import { z } from "zod"

// User registration schema
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  phone: z.string().optional(),
})

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

// Profile update schema
export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
})

// Mass intention schema
export const massIntentionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  intention: z.string().min(1, "Intention is required"),
  massId: z.string().min(1, "Mass selection is required"),
})

// Thanksgiving schema
export const thanksgivingSchema = z.object({
  description: z.string().min(1, "Description is required"),
  massId: z.string().min(1, "Mass selection is required"),
})

// Payment schema
export const paymentSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .transform((val) => Number(val)),
  type: z.enum(["DONATION", "OFFERING"], {
    errorMap: () => ({ message: "Invalid payment type" }),
  }),
  category: z.string().optional(),
  description: z.string().optional(),
  goalId: z.string().optional(),
})

// Church info schema
export const churchInfoSchema = z.object({
  name: z.string().min(1, "Church name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Please enter a valid email address"),
  mission: z.string().optional(),
  vision: z.string().optional(),
  history: z.string().optional(),
})

