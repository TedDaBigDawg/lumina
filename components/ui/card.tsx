"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean
  animate?: boolean
}

export function Card({ className, isLoading, animate = false, ...props }: CardProps) {
  const CardComponent: React.ElementType = animate ? motion.div : "div"

  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {}

  return (
    <CardComponent
      className={cn("bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800 relative", className)}
      {...animationProps}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {props.children}
    </CardComponent>
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean
}

export function CardHeader({ className, compact, ...props }: CardHeaderProps) {
  return (
    <div className={cn("p-6 border-b border-gray-200 dark:border-gray-700", compact && "p-4", className)} {...props} />
  )
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <h3 className={cn("text-xl font-bold text-gray-900 dark:text-white", className)} {...props} />
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn("text-sm text-gray-500 dark:text-gray-400", className)} {...props} />
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean
}

export function CardContent({ className, compact, ...props }: CardContentProps) {
  return <div className={cn("p-6 text-gray-700 dark:text-gray-300", compact && "p-4", className)} {...props} />
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean
}

export function CardFooter({ className, compact, ...props }: CardFooterProps) {
  return (
    <div className={cn("p-6 border-t border-gray-200 dark:border-gray-700", compact && "p-4", className)} {...props} />
  )
}

