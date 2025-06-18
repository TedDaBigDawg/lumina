import { Calendar, HandIcon, Heart, MessageSquare } from "lucide-react"
import { FaMoneyBill } from 'react-icons/fa'

export interface HomeLink {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  // color: string
  // iconColor: string
}

export interface QuickLink {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export const quickAccessLinks: HomeLink[] = [
  {
    title: "Mass Intentions",
    href: "/dashboard/mass-intentions",
    icon: HandIcon,
    description: "Request intentions for loved ones or special occasions.",
    // color: "bg-gradient-to-br from-[#FFD700] to-[#FFD700]",
    // iconColor: "bg-[#1a1a1a]",
  },
  {
    title: "Donations",
    href: "/dashboard/payments",
    icon: FaMoneyBill,
    description: "Make a donation to support our church.",
    // color: "bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200",
    // iconColor: "bg-green-600",
  },
  {
    title: "Events",
    href: "/dashboard/events",
    icon: Calendar,
    description: "Stay updated on church events and RSVP.",
    // color: "bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200",
    // iconColor: "bg-purple-600",
  },
  // {
  //   title: "Community",
  //   href: "/community",
  //   icon: Users,
  //   description: "Connect with our faithful members.",
  //   color: "bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200",
  //   iconColor: "bg-emerald-600",
  // },
]

export const quickLinks: QuickLink[] = [
  // { title: "Sermons", href: "/sermons", icon: BookOpen },
  { title: "Giving", href: "/dashboard/payments", icon: Heart },
  // { title: "Directory", href: "/directory", icon: Users },
  { title: "Contact", href: "/contact", icon: MessageSquare },
]