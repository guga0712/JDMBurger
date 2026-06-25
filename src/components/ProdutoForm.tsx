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

type FieldErrors = {
  nome?: string
  preco?: string
}

const CATEGORIAS = [
  { value: 'lanches', label: 'Lanches' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'acompanhamento', label: 'Acompanhamento' },
  { value: 'doces', label: 'Doces' },
] as const

function validate(nome: string, preco: string): FieldErrors {
  const errors: FieldErrors = {}

  const nomeTrimmed = nome.trim()
  if (!nomeTrimmed) {
    errors.nome = 'O nome é obrigatório.'
  } else if (nomeTrimmed.length < 2) {
    errors.nome = 'O nome deve ter pelo menos 2 caracteres.'
  } else if (nomeTrimmed.length > 100) {
    errors.nome = 'O nome não pode ter mais de 100 caracteres.'
  }

  const precoNum = parseFloat(preco.replace(',', '.'))
  if (!preco) {
    errors.preco = 'O preço é obrigatório.'
  } else if (isNaN(precoNum)) {
    errors.preco = 'Informe um preço válido.'
  } else if (precoNum <= 0) {
    errors.preco = 'O preço deve ser maior que zero.'
  } else if (precoNum > 9999) {
    errors.preco = 'O preço não pode ser maior que R$ 9.999,00.'
  }

  return errors
}

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setSubmitError(null)

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
      setSubmitError(err instanceof Error ? err.message : 'Erro ao fazer upload da imagem')
    } finally {
      setUploading(false)
    }
  }

  function handleRemoveImage() {
    setImagemUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    const errors = validate(nome, preco)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setSubmitting(true)

    const precoNum = parseFloat(preco.replace(',', '.'))

    const payload = {
      nome: nome.trim(),
      categoria,
      preco: precoNum,
      disponivel,
      imagemUrl: imagemUrl ?? null,
    }

    try {
      const url = initialData ? `/api/produtos/${initialData.id}` : '/api/produtos'
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
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar produto')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg" noValidate>
      {submitError && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-md px-4 py-3 text-sm">
          {submitError}
        </div>
      )}

      {/* Nome */}
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          value={nome}
          onChange={(e) => {
            setNome(e.target.value)
            clearFieldError('nome')
          }}
          placeholder="Nome do produto"
          maxLength={100}
          aria-invalid={!!fieldErrors.nome}
        />
        {fieldErrors.nome && (
          <p className="text-sm text-destructive">{fieldErrors.nome}</p>
        )}
      </div>

      {/* Categoria */}
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

      {/* Preço */}
      <div className="space-y-1.5">
        <Label htmlFor="preco">Preço (R$)</Label>
        <Input
          id="preco"
          type="number"
          step="0.01"
          min="0.01"
          max="9999"
          value={preco}
          onChange={(e) => {
            setPreco(e.target.value)
            clearFieldError('preco')
          }}
          placeholder="0,00"
          aria-invalid={!!fieldErrors.preco}
        />
        {fieldErrors.preco && (
          <p className="text-sm text-destructive">{fieldErrors.preco}</p>
        )}
      </div>

      {/* Disponível */}
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

      {/* Imagem */}
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

      {/* Actions */}
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
