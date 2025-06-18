"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown, User, LogOut, Home, Info, Calendar, Phone, LayoutDashboard } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useClickOutside } from "@/hooks/use-click-outside"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import ActivityNotifications from "./activity-notifications"
import Image from "next/image"

interface NavbarProps {
  user: {
    id: string
    name: string
    email: string
    role: string
  } | null
}

// Define navigation items based on role
const navigationItems = {
  public: [
    { name: "Home", href: "/", icon: Home },
    { name: "About", href: "/about", icon: Info },
    { name: "Services", href: "/services", icon: Calendar },
    { name: "Contact", href: "/contact", icon: Phone },
  ],
  authenticated: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  admin: [{ name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  superadmin: [{ name: "Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard }],
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  
  // Client-side only state for enhanced features after hydration
  const [isMounted, setIsMounted] = useState(false)
  
  // Mark component as mounted after hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Use custom hook to handle clicks outside of menus
  useClickOutside(mobileMenuRef as React.RefObject<HTMLElement>, () => {
    if (mobileMenuOpen) setMobileMenuOpen(false)
  })

  useClickOutside(userMenuRef as React.RefObject<HTMLElement>, () => {
    if (userMenuOpen) setUserMenuOpen(false)
  })

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      // Send a logout request to the API
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      const data = await response.json()

      // Check if the logout response was successful
      if (!response.ok) {
        throw new Error(data.error || "Logout failed")
      }

      // If there's a redirect URL provided in the response, use that, else go to login
      const redirectUrl = data.redirectUrl || "/login"

      // Using router.push() for client-side redirection
      router.push(redirectUrl)
      router.refresh()
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }, [router])

  // Determine which navigation items to show based on user role
  const getNavigationItems = useCallback(() => {
    const items = [...navigationItems.public]

    if (user) {
      if (user.role === "PARISHIONER") {
        items.push(...navigationItems.authenticated)
      }

      if (user.role === "ADMIN") {
        items.push(...navigationItems.admin)
      }

      if (user.role === "SUPERADMIN") {
        items.push(...navigationItems.superadmin)
      }
    }

    return items
  }, [user])

  const navItems = getNavigationItems()

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [mobileMenuOpen])

  function getProfilePath(role: string) {
    switch (role) {
      case "ADMIN":
        return "/admin/profile"
      case "SUPERADMIN":
        return "/profile" // Superadmin uses same profile path as parishioners
      case "PARISHIONER":
      default:
        return "/profile"
    }
  }

  return (
    <nav className="bg-primary text-text-secondary sticky top-0 z-50">
      <div className="max-w-7xl py-2 mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex w-full h-full items-center flex-grow">
            <Link href="/" className="flex-shrink-0 flex items-center">
                <Image
                src='/assets/transparent-logo.png'
                width={150}
                height={150}
                alt="Lumina Logo"
                />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden gap-3 md:flex md:items-center md:space-x-4">
            {navItems &&
              navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      isActive ? "bg-primary  border-2 " : "hover:bg-primary/50"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-4 w-4 mr-1" />
                    {item.name}
                  </Link>
                )
              })}

            {!user && (
              <Link href="/register">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white hover:bg-blue-500 rounded-full transition-colors duration-200"
                >
                  Register
                </Button>
              </Link>
            )}
          </div>

          {/* Right side elements with proper spacing */}
          <div className="flex gap-3 items-center space-x-1 sm:space-x-2">
            {/* Activity Notifications */}
            {user && (
              <div className="flex items-center justify-center">
                <ActivityNotifications />
              </div>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <div>
                  <button
                    type="button"
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary  focus:ring-white transition-colors duration-200"
                    id="user-menu"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <span className="ml-2 hidden md:block max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      <div className="px-4 py-2 text-xs text-gray-500 border-b">
                        <span className="font-medium">Signed in as</span>
                        <div className="font-medium truncate mt-0.5 text-gray-700">{user.email}</div>
                      </div>

                      <Link
                        href={getProfilePath(user.role)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Your Profile
                      </Link>

                      <Link
                        href="/dashboard/activities"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Your Activities
                      </Link>

                      <button
                        type="button"
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        role="menuitem"
                        onClick={handleLogout}
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white rounded-full border-white hover:bg-blue-500 transition-colors duration-200"
                >
                  Sign in
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-md text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
                aria-controls="mobile-menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Menu className="block h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - Slide in from right */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black md:hidden z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-blue-700 md:hidden z-50 overflow-y-auto"
              ref={mobileMenuRef}
            >
              <div className="px-4 pt-5 pb-3 flex justify-between items-center border-b border-blue-600">
                <span className="font-semibold text-lg">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md text-white hover:bg-blue-600 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {user && (
                <div className="px-4 py-3 border-b border-blue-600">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="ml-3 overflow-hidden">
                      <div className="text-base font-medium truncate">{user.name}</div>
                      <div className="text-sm text-blue-200 truncate">{user.email}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems &&
                  navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                          isActive ? "bg-blue-800" : "hover:bg-blue-600"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5 mr-2" />
                        {item.name}
                      </Link>
                    )
                  })}

                {!user ? (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600 transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600 transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={getProfilePath(user.role)}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600 transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-2" />
                      Profile
                    </Link>

                    <Link
                      href="/dashboard/activities"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600 transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Calendar className="h-5 w-5 mr-2" />
                      Your Activities
                    </Link>

                    <button
                      type="button"
                      className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600 transition-colors duration-200"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        handleLogout()
                      }}
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Sign out
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Add responsive styling for the logo text via CSS */}
      <style jsx>{`
        @media (max-width: 320px) {
          .flex-shrink-0 span {
            font-size: 1rem; /* text-base */
            content: "CR";
          }
          .flex-shrink-0 span::before {
            content: "CR";
            display: inline;
          }
          .flex-shrink-0 span::after {
            content: "";
            display: none;
          }
        }
      `}</style>
    </nav>
  )
}