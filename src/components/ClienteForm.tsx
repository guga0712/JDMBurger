'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  initialData?: {
    id: string
    nome: string
    telefone: string | null
    email: string | null
  }
  onSuccess?: () => void
}

type FieldErrors = {
  nome?: string
  telefone?: string
  email?: string
}

function maskTelefone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  const len = digits.length
  if (len === 0) return ''
  if (len <= 2) return `(${digits}`
  if (len <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (len <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function validate(nome: string, telefone: string, email: string): FieldErrors {
  const errors: FieldErrors = {}

  const nomeTrimmed = nome.trim()
  if (!nomeTrimmed) {
    errors.nome = 'O nome é obrigatório.'
  } else if (nomeTrimmed.length < 2) {
    errors.nome = 'O nome deve ter pelo menos 2 caracteres.'
  } else if (nomeTrimmed.length > 100) {
    errors.nome = 'O nome não pode ter mais de 100 caracteres.'
  }

  const digits = telefone.replace(/\D/g, '')
  if (digits.length > 0 && digits.length < 10) {
    errors.telefone = 'Informe um telefone válido com DDD (10 ou 11 dígitos).'
  }

  const emailTrimmed = email.trim()
  if (emailTrimmed) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailTrimmed)) {
      errors.email = 'Informe um e-mail válido.'
    }
  }

  return errors
}

export function ClienteForm({ initialData, onSuccess }: Props) {
  const router = useRouter()

  const [nome, setNome] = useState(initialData?.nome ?? '')
  const [telefone, setTelefone] = useState(maskTelefone(initialData?.telefone ?? ''))
  const [email, setEmail] = useState(initialData?.email ?? '')
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    const errors = validate(nome, telefone, email)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setSubmitting(true)

    const payload = {
      nome: nome.trim(),
      telefone: telefone.trim() || null,
      email: email.trim() || null,
    }

    try {
      const url = initialData ? `/api/clientes/${initialData.id}` : '/api/clientes'
      const method = initialData ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Erro ao salvar cliente')
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/clientes')
        router.refresh()
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar cliente')
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
          placeholder="Nome do cliente"
          maxLength={100}
          aria-invalid={!!fieldErrors.nome}
        />
        {fieldErrors.nome && (
          <p className="text-sm text-destructive">{fieldErrors.nome}</p>
        )}
      </div>

      {/* Telefone */}
      <div className="space-y-1.5">
        <Label htmlFor="telefone">
          Telefone <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
        </Label>
        <Input
          id="telefone"
          type="tel"
          inputMode="numeric"
          value={telefone}
          onChange={(e) => {
            setTelefone(maskTelefone(e.target.value))
            clearFieldError('telefone')
          }}
          placeholder="(11) 99999-9999"
          maxLength={15}
          aria-invalid={!!fieldErrors.telefone}
        />
        {fieldErrors.telefone && (
          <p className="text-sm text-destructive">{fieldErrors.telefone}</p>
        )}
      </div>

      {/* E-mail */}
      <div className="space-y-1.5">
        <Label htmlFor="email">
          E-mail <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            clearFieldError('email')
          }}
          placeholder="cliente@email.com"
          aria-invalid={!!fieldErrors.email}
        />
        {fieldErrors.email && (
          <p className="text-sm text-destructive">{fieldErrors.email}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={submitting}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {submitting ? 'Salvando...' : initialData ? 'Salvar alterações' : 'Criar cliente'}
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
