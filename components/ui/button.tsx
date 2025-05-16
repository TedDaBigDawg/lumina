"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "accent" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
  loadingText?: string
  icon?: React.ReactNode
}

export function buttonVariants({
  variant = "primary",
  size = "md",
}: {
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
} = {}): string {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"

  const variantStyles = {
    default: "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700", // Added default variant
    primary: "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700",
    secondary: "bg-blue-900 text-white hover:bg-blue-800 active:bg-blue-950",
    accent: "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700",
    outline:
      "border border-gray-300 bg-transparent text-gray-800 hover:bg-gray-100 active:bg-gray-200 dark:text-white dark:hover:bg-gray-800",
    ghost: "bg-transparent text-gray-800 hover:bg-gray-100 active:bg-gray-200 dark:text-white dark:hover:bg-gray-800",
  }

  const sizeStyles = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  }

  return cn(
    baseStyles,
    variantStyles[variant as keyof typeof variantStyles],
    sizeStyles[size as keyof typeof sizeStyles],
  )
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  icon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), isLoading && "relative cursor-wait", className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </span>
      )}
      <span className={cn(isLoading && "invisible")}>
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </span>
      {isLoading && loadingText && <span className="ml-2">{loadingText}</span>}
    </button>
  )
}

