import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from 'next/font/google'
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SystemNotification } from "@/components/system-notification"
import { getSession } from "@/lib/auth"
import "@/app/globals.css"

// Optimize font loading
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Church Management System",
  description: "A comprehensive church management system for parishes",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#3b82f6", // Blue-600
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const user = session
    ? {
        id: session.id || "",
        name: session.name || "",
        email: session.email || "",
        role: session.role || "",
      }
    : null

  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preload critical assets */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Add preload hints for critical CSS */}
        <link rel="preload" href="/globals.css" as="style" />

        {/* Add preload hints for critical JavaScript */}
        <link rel="modulepreload" href="/_next/static/chunks/main.js" />
      </head>
      <body className={`${inter.className}`}>
        <Navbar user={user} />
        <main className="flex-grow">
          <div className="">
            <SystemNotification />
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  )
}



import './globals.css'