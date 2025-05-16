import { Calendar, Heart, HomeIcon, Info, LayoutDashboard, Phone } from "lucide-react"

export interface NavItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }
  
  export const navLinks = {
    public: [
      { name: "Home", href: "/", icon: HomeIcon },
      { name: "About", href: "/about", icon: Info },
      { name: "Services", href: "/services", icon: Calendar },
      { name: "Contact", href: "/contact", icon: Phone },
    ],
    authenticated: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Events", href: "/events", icon: Calendar },
      { name: "Giving", href: "/giving", icon: Heart },
    ],
    admin: [
      { name: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Events", href: "/events", icon: Calendar },
      { name: "Giving", href: "/giving", icon: Heart },
    ],
    superadmin: [
      { name: "Superadmin Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard },
      { name: "Events", href: "/events", icon: Calendar },
      { name: "Giving", href: "/giving", icon: Heart },
    ],
  }