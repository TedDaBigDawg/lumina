import Link from "next/link"
import { motion } from "framer-motion"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Heart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getChurchInfo } from "@/lib/data"
import { footerQuickLinks, footerBottomLinks, FooterNavItem } from "@/lib/footer-links"
import { SocialLink } from "./layout/social-links"
import Image from "next/image"

export async function Footer() {
  const church = await getChurchInfo()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-text-secondary">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Church Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
              src='/assets/transparent-logo.png'
              width={150}
              height={150}
              alt="Lumina Logo"
              />
              {/* <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-gold-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-serif font-bold text-white">
                {church?.name || "St. Kizito Catholic Church"}
              </span> */}
            </div>
            <p className="text-background max-w-xs">
              Connecting our community through faith, worship, and service.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <SocialLink href="https://facebook.com" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </SocialLink>
              <SocialLink href="https://instagram.com" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </SocialLink>
              <SocialLink href="https://twitter.com" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </SocialLink>
              <SocialLink href="https://youtube.com" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </SocialLink>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-serif text-lg font-bold">Quick Links</h3>
            <nav className="grid grid-cols-1 gap-2">
              {footerQuickLinks.map((link) => (
                <FooterLink key={link.name} href={link.href} icon={<link.icon className="w-4 h-4" />}>
                  {link.name}
                </FooterLink>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white font-serif text-lg font-bold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-background shrink-0 mt-0.5" />
                <span className="text-background">{church?.address || "123 Faith Avenue, Lagos, Nigeria"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-background shrink-0" />
                <span className="text-background">{church?.phone || "(123) 456-7890"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-background shrink-0" />
                <span className="text-background">{church?.email || "info@stkizito.org"}</span>
              </div>
            </div>
            <div className="pt-2">
              <h4 className="text-white font-medium mb-1">Mass Times</h4>
              <p className="text-background text-sm">Sundays: 7:00 AM, 9:00 AM, 11:00 AM</p>
              <p className="text-background text-sm">Weekdays: 6:30 AM</p>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h3 className="text-background font-serif text-lg">Stay Connected</h3>
            <p className="text-background">Join our newsletter for updates on masses, events, and more.</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-secondary border-[#F5F6F5] text-white rounded-l-full placeholder:text-background"
              />
              <Button className="text-background font-bold rounded-r-full bg-secondary">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-blue-300">We respect your privacy. Unsubscribe anytime.</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[#1a1a1a] text-sm">
              © {currentYear} {church?.name || "St. Kizito Catholic Church"}. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              {footerBottomLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[#1a1a1a] hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


interface FooterLinkProps {
  href: string
  children: React.ReactNode
  icon: React.ReactNode
}

function FooterLink({ href, children, icon }: FooterLinkProps) {
  return (
    <Link href={href} className="flex items-center gap-2 text-background hover:text-white transition-colors">
      {icon}
      {children}
    </Link>
  )
}