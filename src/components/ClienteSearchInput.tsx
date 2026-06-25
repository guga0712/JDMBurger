'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search } from 'lucide-react'

type Props = {
  defaultValue?: string
}

export function ClienteSearchInput({ defaultValue = '' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim()
      startTransition(() => {
        if (value) {
          router.replace(`${pathname}?busca=${encodeURIComponent(value)}`)
        } else {
          router.replace(pathname)
        }
      })
    },
    [router, pathname]
  )

  return (
    <div className="relative">
      <Search
        size={15}
        strokeWidth={2}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <input
        type="search"
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder="Buscar por nome, telefone ou e-mail…"
        className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
      />
    </div>
  )
}
