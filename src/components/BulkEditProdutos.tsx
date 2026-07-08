'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Produto = {
  id: string
  nome: string
  categoria: string
  preco: number
  disponivel: boolean
  imagemUrl: string | null
}

type ProdutoEditavel = Produto & { precoStr: string; dirty: boolean; uploadando: boolean }

const CATEGORIAS = [
  { value: 'lanches', label: 'Lanches 🍔' },
  { value: 'bebidas', label: 'Bebidas 🥤' },
  { value: 'acompanhamento', label: 'Acompanhamento 🍟' },
  { value: 'doces', label: 'Doces 🍰' },
]

export default function BulkEditProdutos({ produtos }: { produtos: Produto[] }) {
  const router = useRouter()
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const [itens, setItens] = useState<ProdutoEditavel[]>(
    produtos.map((p) => ({ ...p, precoStr: p.preco.toString(), dirty: false, uploadando: false }))
  )
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  const alterados = itens.filter((i) => i.dirty)

  function atualizar(id: string, campo: Partial<ProdutoEditavel>) {
    setItens((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...campo, dirty: true } : i))
    )
    setSucesso(false)
  }

  function resetar(id: string) {
    const original = produtos.find((p) => p.id === id)!
    setItens((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...original, precoStr: original.preco.toString(), dirty: false, uploadando: false }
          : i
      )
    )
  }

  async function handleUpload(id: string, file: File) {
    setItens((prev) => prev.map((i) => (i.id === id ? { ...i, uploadando: true } : i)))
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error()
      const { url } = (await res.json()) as { url: string }
      atualizar(id, { imagemUrl: url, uploadando: false })
    } catch {
      setItens((prev) => prev.map((i) => (i.id === id ? { ...i, uploadando: false } : i)))
      setErro('Erro ao fazer upload de imagem.')
    }
  }

  async function salvar() {
    if (alterados.length === 0) return
    setSalvando(true)
    setErro(null)
    setSucesso(false)

    const payload = alterados.map(({ id, nome, categoria, precoStr, disponivel, imagemUrl }) => ({
      id,
      nome,
      categoria,
      preco: parseFloat(precoStr.replace(',', '.')) || 0,
      disponivel,
      imagemUrl,
    }))

    try {
      const res = await fetch('/api/produtos/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? 'Erro ao salvar')
      }
      setItens((prev) => prev.map((i) => ({ ...i, dirty: false })))
      setSucesso(true)
      router.refresh()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar alterações.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Barra de ações */}
      <div className="flex items-center justify-between gap-3 bg-card border border-border rounded-xl px-4 py-3">
        <p className="text-sm text-muted-foreground">
          {alterados.length === 0
            ? 'Nenhuma alteração pendente'
            : `${alterados.length} produto${alterados.length > 1 ? 's' : ''} com alterações`}
        </p>
        <Button
          onClick={salvar}
          disabled={salvando || alterados.length === 0}
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
        >
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>

      {erro && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm">
          {erro}
        </div>
      )}
      {sucesso && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-3 text-sm">
          Alterações salvas com sucesso.
        </div>
      )}

      {/* Tabela */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">
                Foto
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nome
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-36">
                Categoria
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">
                Preço (R$)
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                Disponível
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {itens.map((item) => (
              <tr
                key={item.id}
                className={`transition-colors ${item.dirty ? 'bg-primary/5' : 'bg-card'}`}
              >
                {/* Foto */}
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => fileRefs.current[item.id]?.click()}
                    disabled={item.uploadando}
                    className="relative w-11 h-11 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center hover:border-primary/50 transition-colors group"
                    title="Trocar foto"
                  >
                    {item.uploadando ? (
                      <span className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    ) : item.imagemUrl ? (
                      <>
                        <Image
                          src={item.imagemUrl}
                          alt={item.nome}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload size={12} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <Upload
                        size={14}
                        className="text-muted-foreground group-hover:text-primary transition-colors"
                      />
                    )}
                  </button>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    ref={(el) => {
                      fileRefs.current[item.id] = el
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUpload(item.id, file)
                    }}
                  />
                </td>

                {/* Nome */}
                <td className="px-4 py-3">
                  <Input
                    value={item.nome}
                    onChange={(e) => atualizar(item.id, { nome: e.target.value })}
                    className="h-8 text-sm"
                    maxLength={100}
                  />
                </td>

                {/* Categoria */}
                <td className="px-4 py-3">
                  <select
                    value={item.categoria}
                    onChange={(e) => atualizar(item.id, { categoria: e.target.value })}
                    className="bg-background border border-border text-foreground rounded-md px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Preço */}
                <td className="px-4 py-3">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={item.precoStr}
                    onChange={(e) =>
                      atualizar(item.id, { precoStr: e.target.value })
                    }
                    className="h-8 text-sm"
                    placeholder="0.00"
                  />
                </td>

                {/* Disponível */}
                <td className="px-4 py-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.disponivel}
                    onClick={() => atualizar(item.id, { disponivel: !item.disponivel })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${item.disponivel ? 'bg-primary' : 'bg-muted'
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${item.disponivel ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </td>

                {/* Reset */}
                <td className="px-2 py-3">
                  {item.dirty && (
                    <button
                      type="button"
                      onClick={() => resetar(item.id)}
                      title="Desfazer alterações"
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
