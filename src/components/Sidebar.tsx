'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Package, LogOut, UserCircle } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/produtos', label: 'Produtos', icon: Package },
]

type Props = {
  userName?: string | null
}

export function Sidebar({ userName }: Props) {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-card border-r border-border min-h-screen">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border">
        <span className="text-xl font-bold tracking-tight">
          JDM<span className="text-primary">Burger</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon size={18} strokeWidth={1.75} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {userName && (
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
            <UserCircle size={18} strokeWidth={1.75} />
            <span className="truncate">{userName}</span>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut size={18} strokeWidth={1.75} />
          Sair
        </button>
      </div>
    </aside>
  )
}
