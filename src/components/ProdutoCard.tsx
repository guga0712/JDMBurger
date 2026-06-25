'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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

export function ProdutoCard({ id, nome, categoria, preco, disponivel: initialDisponivel, imagemUrl }: Props) {
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
      if (res.ok) {
        setDisponivel((v) => !v)
      }
    } catch {
      // silently fail — state stays as-is
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted flex items-center justify-center">
        {imagemUrl ? (
          <Image
            src={imagemUrl}
            alt={nome}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="text-4xl select-none">
            {categoria === 'lanches'
              ? '🍔'
              : categoria === 'bebidas'
                ? '🥤'
                : categoria === 'acompanhamento'
                  ? '🍟'
                  : categoria === 'doces'
                    ? '🍰'
                    : '❓'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {/* Category badge */}
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full self-start"
          style={{ backgroundColor: categoriaCor.bg, color: categoriaCor.text }}
        >
          {CATEGORIA_LABELS[categoria]}
        </span>

        <p className="font-semibold text-sm text-foreground leading-snug">{nome}</p>

        <p className="text-primary font-bold text-sm">{precoFormatado}</p>

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
          {/* Disponivel toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={disponivel}
            disabled={toggling}
            onClick={handleToggleDisponivel}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-50 ${disponivel ? 'bg-primary' : 'bg-muted'
              }`}
            title={disponivel ? 'Marcar como indisponível' : 'Marcar como disponível'}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${disponivel ? 'translate-x-4' : 'translate-x-0'
                }`}
            />
          </button>

          <Link
            href={`/produtos/${id}/editar`}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Editar
          </Link>
        </div>
      </div>
    </div>
  )
}
