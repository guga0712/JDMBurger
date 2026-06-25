'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Package, LogOut, UserCircle, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/produtos', label: 'Produtos', icon: Package },
]

type Props = {
  userName?: string | null
}

export function Sidebar({ userName }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  // Bloqueia scroll do body quando menu aberto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────── */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col bg-card border-r border-border min-h-screen">
        <div className="px-5 py-5 border-b border-border">
          <span className="text-xl font-bold tracking-tight">
            JDM<span className="text-primary">Burger</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
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

      {/* ── Mobile top bar ───────────────────────────────── */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-card border-b border-border">
        <span className="text-lg font-bold tracking-tight">
          JDM<span className="text-primary">Burger</span>
        </span>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* ── Mobile fullscreen menu ───────────────────────── */}
      {/* Overlay sempre no DOM para a animação de saída funcionar */}
      <div
        className={`fixed inset-0 z-50 flex flex-col bg-background transition-all duration-300 ease-in-out md:hidden ${open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
      >
        {/* Header do menu */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-border shrink-0">
          <span className="text-lg font-bold tracking-tight">
            JDM<span className="text-primary">Burger</span>
          </span>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Links de navegação */}
        <nav className="flex-1 flex flex-col px-8 gap-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }, i) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                style={{ transitionDelay: open ? `${i * 60}ms` : '0ms' }}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-semibold transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  } ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted'
                  }`}
              >
                <Icon size={22} strokeWidth={1.75} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Rodapé com usuário e sair */}
        <div className="px-8 py-8 border-t border-border space-y-2">
          {userName && (
            <div className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground">
              <UserCircle size={20} strokeWidth={1.75} />
              <span>{userName}</span>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut size={20} strokeWidth={1.75} />
            Sair
          </button>
        </div>
      </div>
    </>
  )
}
