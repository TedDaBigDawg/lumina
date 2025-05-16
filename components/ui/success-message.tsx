import { cn } from "@/lib/utils"

interface SuccessMessageProps {
  message?: string | null
  className?: string
}

export function SuccessMessage({ message, className }: SuccessMessageProps) {
  if (!message) return null

  return <div className={cn("p-3 bg-green-50 text-green-700 rounded-md text-sm", className)}>{message}</div>
}

