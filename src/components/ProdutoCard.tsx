'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Pencil } from 'lucide-react'

type Categoria = 'lanches' | 'bebidas' | 'acompanhamento' | 'doces'

type Props = {
  id: string
  nome: string
  categoria: Categoria
  preco: number
  disponivel: boolean
  imagemUrl: string | null
}

const CATEGORIA_LABELS: Record<Categoria, string> = {
  lanches: 'Lanches',
  bebidas: 'Bebidas',
  acompanhamento: 'Acompanhamento',
  doces: 'Doces',
}

const CATEGORIA_COLORS: Record<Categoria, { bg: string; text: string }> = {
  lanches: { bg: '#C0392B22', text: '#C0392B' },
  bebidas: { bg: '#1D4ED822', text: '#60A5FA' },
  acompanhamento: { bg: '#92400E22', text: '#F59E0B' },
  doces: { bg: '#9D174D22', text: '#F472B6' },
}

const EMOJI_MAP: Record<Categoria, string> = {
  lanches: '🍔',
  bebidas: '🥤',
  acompanhamento: '🍟',
  doces: '🍰',
}

export function ProdutoCard({
  id,
  nome,
  categoria,
  preco,
  disponivel: initialDisponivel,
  imagemUrl,
}: Props) {
  const [disponivel, setDisponivel] = useState(initialDisponivel)
  const [toggling, setToggling] = useState(false)

  const precoFormatado = preco.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  const categoriaCor = CATEGORIA_COLORS[categoria]

  async function handleToggleDisponivel() {
    setToggling(true)
    try {
      const res = await fetch(`/api/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponivel: !disponivel }),
      })
      if (res.ok) setDisponivel((v) => !v)
    } catch {
      // silently fail
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(192,57,43,0.08)]">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {imagemUrl ? (
          <Image
            src={imagemUrl}
            alt={nome}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-[1.04] ${
              !disponivel ? 'opacity-55 grayscale-[25%]' : ''
            }`}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl select-none" aria-hidden="true">
              {EMOJI_MAP[categoria]}
            </span>
          </div>
        )}

        {/* Unavailable badge */}
        {!disponivel && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-background/80 backdrop-blur-sm text-muted-foreground text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md">
              Indisponível
            </span>
          </div>
        )}

        {/* Edit shortcut — reveals on hover */}
        <Link
          href={`/produtos/${id}/editar`}
          className="absolute top-2 right-2 bg-background/80 hover:bg-background backdrop-blur-sm text-foreground rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-95"
          title="Editar produto"
        >
          <Pencil size={13} strokeWidth={2} />
        </Link>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full self-start"
          style={{ backgroundColor: categoriaCor.bg, color: categoriaCor.text }}
        >
          {CATEGORIA_LABELS[categoria]}
        </span>

        <p className="font-semibold text-sm text-foreground leading-snug line-clamp-2">{nome}</p>

        <p className="text-primary font-bold text-sm mt-auto">{precoFormatado}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <button
            type="button"
            role="switch"
            aria-checked={disponivel}
            disabled={toggling}
            onClick={handleToggleDisponivel}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-50 ${
              disponivel ? 'bg-primary' : 'bg-muted'
            }`}
            title={disponivel ? 'Marcar como indisponível' : 'Marcar como disponível'}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                disponivel ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>

          <span
            className={`text-[11px] font-medium ${
              disponivel ? 'text-emerald-500/80' : 'text-muted-foreground/60'
            }`}
          >
            {disponivel ? 'Disponível' : 'Indisponível'}
          </span>
        </div>
      </div>
    </div>
  )
}
