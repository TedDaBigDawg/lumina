import { cn } from "@/lib/utils"

interface ErrorMessageProps {
  message?: string | null
  className?: string
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) return null

  return <div className={cn("p-3 bg-red-50 text-red-700 rounded-md text-sm", className)}>{message}</div>
}

