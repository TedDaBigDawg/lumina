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
      className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary text-background  hover:text-[#1a1a1a] transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.a>
  )
}