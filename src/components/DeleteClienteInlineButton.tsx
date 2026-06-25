'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  id: string
  nome: string
}

export function DeleteClienteInlineButton({ id, nome }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Erro ao excluir cliente')
      }
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir cliente')
      setDeleting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`Excluir ${nome}`}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Trash2 size={15} strokeWidth={1.75} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">Excluir cliente</h2>
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja excluir{' '}
                <span className="font-medium text-foreground">{nome}</span>?
              </p>
              <p className="text-sm text-destructive font-medium">Esta ação é irreversível.</p>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 justify-end pt-1">
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={deleting}>
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {deleting ? 'Excluindo...' : 'Sim, excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
