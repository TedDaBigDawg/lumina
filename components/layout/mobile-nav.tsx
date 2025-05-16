import Link from "next/link";

interface NavItemProps {
    href: string
    icon: React.ReactNode
    children: React.ReactNode
  }
export function MobileNavItem({ href, icon, children }: NavItemProps) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 px-2 py-3 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      >
        {icon}
        <span className="font-medium">{children}</span>
      </Link>
    )
  }