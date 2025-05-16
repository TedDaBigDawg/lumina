"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const modalVariants = cva("fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6", {
  variants: {
    position: {
      default: "items-center justify-center",
      top: "items-start justify-center",
      bottom: "items-end justify-center",
    },
  },
  defaultVariants: {
    position: "default",
  },
})

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof modalVariants> {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  position?: "default" | "top" | "bottom"
}

export function Modal({ open, onClose, children, position, className, ...props }: ModalProps) {
  const [isClosing, setIsClosing] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setIsClosing(false)
      return
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "auto"
    }
  }, [open])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  if (!open) return null

  return (
    <div className={cn(modalVariants({ position }), className)} {...props}>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isClosing ? "opacity-0" : "opacity-100",
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        className={cn(
          "relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto transition-all duration-300",
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100",
        )}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4 border-b", className)} {...props} />
}

export function ModalTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-xl font-semibold text-gray-900", className)} {...props} />
}

export function ModalBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4", className)} {...props} />
}

export function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4 border-t flex justify-end gap-3", className)} {...props} />
}
