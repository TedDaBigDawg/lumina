import { Home, Info, Calendar, Heart, Users, BookOpen } from "lucide-react"

export interface FooterNavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export const footerQuickLinks: FooterNavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "About", href: "/about", icon: Info },
  { name: "Services", href: "/services", icon: Calendar },
  { name: "Giving", href: "/giving", icon: Heart },
  { name: "Community", href: "/community", icon: Users },
  { name: "Events", href: "/events", icon: BookOpen },
]

export const footerBottomLinks: FooterNavItem[] = [
  { name: "Privacy Policy", href: "/privacy", icon: BookOpen },
  { name: "Terms of Use", href: "/terms", icon: BookOpen },
  { name: "Sitemap", href: "/sitemap", icon: BookOpen },
]