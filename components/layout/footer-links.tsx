import Link from "next/link"

interface FooterLinkProps {
    href: string
    children: React.ReactNode
    icon: React.ReactNode
  }
  
  export function FooterLink({ href, children, icon }: FooterLinkProps) {
    return (
      <Link href={href} className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors">
        {icon}
        {children}
      </Link>
    )
  }