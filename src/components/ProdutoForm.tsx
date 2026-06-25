'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  initialData?: {
    id: string
    nome: string
    categoria: string
    preco: number
    disponivel: boolean
    imagemUrl: string | null
  }
  onSuccess?: () => void
}

const CATEGORIAS = [
  { value: 'lanches', label: 'Lanches' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'acompanhamento', label: 'Acompanhamento' },
  { value: 'doces', label: 'Doces' },
] as const

export function ProdutoForm({ initialData, onSuccess }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nome, setNome] = useState(initialData?.nome ?? '')
  const [categoria, setCategoria] = useState(initialData?.categoria ?? 'lanches')
  const [preco, setPreco] = useState(initialData?.preco?.toString() ?? '')
  const [disponivel, setDisponivel] = useState(initialData?.disponivel ?? true)
  const [imagemUrl, setImagemUrl] = useState<string | null>(initialData?.imagemUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Erro ao fazer upload')
      }

      const data = await res.json() as { url: string }
      setImagemUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload da imagem')
    } finally {
      setUploading(false)
    }
  }

  function handleRemoveImage() {
    setImagemUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const precoNum = parseFloat(preco.replace(',', '.'))
    if (isNaN(precoNum) || precoNum <= 0) {
      setError('Preço inválido')
      setSubmitting(false)
      return
    }

    const payload = {
      nome: nome.trim(),
      categoria,
      preco: precoNum,
      disponivel,
      imagemUrl: imagemUrl ?? null,
    }

    try {
      const url = initialData
        ? `/api/produtos/${initialData.id}`
        : '/api/produtos'
      const method = initialData ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Erro ao salvar produto')
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/produtos')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar produto')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do produto"
          required
          maxLength={100}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="categoria">Categoria</Label>
        <select
          id="categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="bg-card border border-border text-foreground rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {CATEGORIAS.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="preco">Preço (R$)</Label>
        <Input
          id="preco"
          type="number"
          step="0.01"
          min="0.01"
          max="9999.99"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          placeholder="0,00"
          required
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={disponivel}
          onClick={() => setDisponivel((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${disponivel ? 'bg-primary' : 'bg-muted'
            }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${disponivel ? 'translate-x-5' : 'translate-x-0'
              }`}
          />
        </button>
        <Label className="cursor-pointer" onClick={() => setDisponivel((v) => !v)}>
          {disponivel ? 'Disponível' : 'Indisponível'}
        </Label>
      </div>

      <div className="space-y-2">
        <Label>Imagem</Label>

        {imagemUrl ? (
          <div
            className="relative rounded-xl overflow-hidden border border-border bg-muted"
            style={{ maxWidth: 240, aspectRatio: '4/3' }}
          >
            <Image
              src={imagemUrl}
              alt="Imagem do produto"
              fill
              className="object-cover"
              unoptimized
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-background/80 hover:bg-background text-foreground rounded-lg p-1.5 transition-colors"
              title="Remover imagem"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <label
            htmlFor="imagem"
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card/50 cursor-pointer hover:border-primary/50 hover:bg-card transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            style={{ maxWidth: 240, aspectRatio: '4/3' }}
          >
            {uploading ? (
              <>
                <span className="inline-block h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-sm text-muted-foreground">Enviando...</span>
              </>
            ) : (
              <>
                <Upload size={20} strokeWidth={1.5} className="text-muted-foreground/50" />
                <span className="text-sm text-muted-foreground text-center px-4">
                  Escolher imagem
                  <br />
                  <span className="text-xs opacity-60">JPEG, PNG, WebP — máx. 2MB</span>
                </span>
              </>
            )}
          </label>
        )}

        <input
          ref={fileInputRef}
          id="imagem"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={submitting || uploading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {submitting ? 'Salvando...' : initialData ? 'Salvar alterações' : 'Criar produto'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
