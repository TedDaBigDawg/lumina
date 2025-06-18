"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  isSubmitting?: boolean
}

export function Form({ className, isSubmitting, ...props }: FormProps) {
  return (
    <form className={cn("space-y-6 relative", className)} {...props}>
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-md">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {props.children}
    </form>
  )
}

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string
}

export function FormField({ className, error, ...props }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {props.children}
      {error && (
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">
          {error}
        </motion.p>
      )}
    </div>
  )
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function FormLabel({ className, required, ...props }: FormLabelProps) {
  return (
    <label className={cn("block text-sm font-medium text-gray-700 dark:text-gray-300", className)} {...props}>
      {props.children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function FormInput({ className, error, ...props }: FormInputProps) {
  return (
    <input
      className={cn(
        "w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white transition-colors duration-200",
        error && "border-red-500 focus:ring-red-500",
        props.disabled && "opacity-60 cursor-not-allowed bg-gray-100",
        className,
      )}
      {...props}
    />
  )
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function FormTextarea({ className, error, ...props }: FormTextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white transition-colors duration-200",
        error && "border-red-500 focus:ring-red-500",
        props.disabled && "opacity-60 cursor-not-allowed bg-gray-100",
        className,
      )}
      {...props}
    />
  )
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export function FormSelect({ className, error, ...props }: FormSelectProps) {
  return (
    <select
      className={cn(
        "w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white transition-colors duration-200",
        error && "border-red-500 focus:ring-red-500",
        props.disabled && "opacity-60 cursor-not-allowed bg-gray-100",
        className,
      )}
      {...props}
    />
  )
}

interface FormCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "onCheckedChange"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean | "indeterminate") => void
  error?: boolean
}

export function FormCheckbox({ className, checked, onCheckedChange, error, ...props }: FormCheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-gray-300 text-[#1a1a1a] focus:ring-blue-500 transition-colors duration-200",
        error && "border-red-500 focus:ring-red-500",
        props.disabled && "opacity-60 cursor-not-allowed",
        className,
      )}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  )
}

interface FormErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function FormError({ className, ...props }: FormErrorProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("text-red-500 text-sm mt-1", className)}
      {...props}
    />
  )
}

interface FormSuccessProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function FormSuccess({ className, ...props }: FormSuccessProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("text-green-500 text-sm mt-1", className)}
      {...props}
    />
  )
}

