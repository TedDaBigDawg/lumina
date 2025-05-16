"use client"

import { motion } from "framer-motion"

interface SocialLinkProps {
  href: string
  children: React.ReactNode
  "aria-label": string
}

export function SocialLink({ href, children, "aria-label": ariaLabel }: SocialLinkProps) {
  return (
    <motion.a
      href={href}
      aria-label={ariaLabel}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-800 text-blue-200 hover:bg-gold-500 hover:text-blue-900 transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.a>
  )
}