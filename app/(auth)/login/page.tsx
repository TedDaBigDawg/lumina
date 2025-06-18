"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/actions/auth-actions"; // Ensure this is client-safe.
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { loginSchema } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const formRef = useRef<HTMLFormElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(
        errorParam === "unauthenticated"
          ? "You need to be logged in to access that page"
          : errorParam === "unauthorized"
          ? "You don't have permission to access that page"
          : errorParam
      );
    }

    return () => {
      isMounted.current = false;
    };
  }, [searchParams]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (error) setError(null);
    },
    [error]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
  
    try {
      // console.log("Submitting form with data:", formData);
  
      // const response = await fetch("/api/login", {
      //   method: "POST",
      //   body: JSON.stringify(formData),
      //   headers: { "Content-Type": "application/json" },
      // });

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include', // 👈 THIS is critical!
      });
      
  
      console.log("Response status:", response);
      const data = await response.json();
      console.log("Login response:", data);
  
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // if (data.redirectUrl) {
      //   window.location.href = data.redirectUrl;
      // }
      console.log("Redirect:", data.redirectUrl);
  
      router.push(data.redirectUrl || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isSubmitting) {
        formRef.current?.requestSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-extrabold">Sign in to your account</CardTitle>
        </CardHeader>

        <CardContent>
          {error && <ErrorMessage message={error} className="mb-4" />}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                aria-invalid={error ? "true" : "false"}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                aria-invalid={error ? "true" : "false"}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mt-6">
              <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-[#1a1a1a] hover:text-blue-500">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
