'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { RefreshCw } from 'lucide-react'

export function AtualizarButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => { router.refresh() })}
      disabled={isPending}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
    >
      <RefreshCw size={14} className={isPending ? 'animate-spin' : ''} strokeWidth={2} />
      Atualizar
    </button>
  )
}
