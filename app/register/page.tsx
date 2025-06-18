"use client"

import { useState } from "react"
import Link from "next/link"
import { register } from "@/actions/auth-actions"
import { Form, FormField, FormLabel, FormInput } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { ErrorMessage } from "@/components/ui/error-message"
import { registerSchema } from "@/lib/validations"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setIsSubmitting(true)

    try {
      const name = formData.get("name") as string
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      const phone = (formData.get("phone") as string) || undefined

      const result = registerSchema.safeParse({ name, email, password, phone })
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors
        const firstError =
          fieldErrors.name?.[0] ||
          fieldErrors.email?.[0] ||
          fieldErrors.password?.[0] ||
          fieldErrors.phone?.[0] ||
          "Invalid form data"

        setError(firstError)
        setIsSubmitting(false)
        return
      }

      const registerResult = await register(formData)

      if (registerResult?.error) {
        if (registerResult.error.includes("already exists")) {
          setError("An account with this email already exists. Please use a different email or try logging in.")
        } else {
          setError(registerResult.error)
        }
      }
      const redirectUrl = "/login";
      router.push(redirectUrl|| "/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-extrabold">Create an account</CardTitle>
        </CardHeader>

        <CardContent>
          <Form action={handleSubmit}>
            {error && <ErrorMessage message={error} className="mb-4" />}

            <FormField>
              <FormLabel htmlFor="name">Full Name</FormLabel>
              <FormInput id="name" name="name" autoComplete="name" required aria-invalid={error ? "true" : "false"} />
            </FormField>

            <FormField>
              <FormLabel htmlFor="email">Email address</FormLabel>
              <FormInput
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-invalid={error ? "true" : "false"}
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormInput
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                aria-invalid={error ? "true" : "false"}
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters and include uppercase, lowercase, and numbers
              </p>
            </FormField>

            <FormField>
              <FormLabel htmlFor="phone">Phone Number (Optional)</FormLabel>
              <FormInput id="phone" name="phone" type="tel" autoComplete="tel" />
            </FormField>

            <div className="mt-6">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Register"}
              </Button>
            </div>
          </Form>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#1a1a1a] hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

