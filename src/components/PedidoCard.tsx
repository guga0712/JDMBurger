'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Loader2 } from 'lucide-react'

type Status = 'recebido' | 'preparando' | 'pronto' | 'entregue'
type Tipo = 'mesa' | 'retirada' | 'delivery'
type FormaPagamento = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro'

export type PedidoCardData = {
  id: string
  status: Status
  tipo: Tipo
  formaPagamento: FormaPagamento
  criadoEm: string
  cliente: { nome: string } | null
  itens: {
    id: string
    quantidade: number
    observacao: string | null
    produto: { nome: string; preco: number }
  }[]
}

const STATUS_NEXT: Partial<Record<Status, Status>> = {
  recebido: 'preparando',
  preparando: 'pronto',
  pronto: 'entregue',
}

const STATUS_ACTION: Partial<Record<Status, string>> = {
  recebido: 'Iniciar preparo',
  preparando: 'Marcar como pronto',
  pronto: 'Marcar como entregue',
}

const STATUS_BADGE: Record<Status, string> = {
  recebido: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  preparando: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  pronto: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  entregue: 'bg-muted text-muted-foreground border border-border',
}

const STATUS_LABEL: Record<Status, string> = {
  recebido: 'Recebido',
  preparando: 'Preparando',
  pronto: 'Pronto',
  entregue: 'Entregue',
}

const TIPO_BADGE: Record<Tipo, string> = {
  mesa: 'bg-violet-500/15 text-violet-400',
  retirada: 'bg-orange-500/15 text-orange-400',
  delivery: 'bg-cyan-500/15 text-cyan-400',
}

const TIPO_LABEL: Record<Tipo, string> = {
  mesa: 'Mesa',
  retirada: 'Retirada',
  delivery: 'Delivery',
}

const PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  pix: 'Pix',
  cartao_credito: 'Cartão',
  cartao_debito: 'Débito',
  dinheiro: 'Dinheiro',
}

function formatHorario(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return time
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' · ' + time
}

function shortId(id: string): string {
  return '#' + id.slice(-6).toUpperCase()
}

export function PedidoCard({ pedido }: { pedido: PedidoCardData }) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>(pedido.status)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = pedido.itens.reduce((sum, i) => sum + i.produto.preco * i.quantidade, 0)
  const nextStatus = STATUS_NEXT[status]

  async function handleAdvance() {
    if (!nextStatus || loading) return
    const prev = status
    setStatus(nextStatus)
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/pedidos/${pedido.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setStatus(prev)
      setError('Falha ao atualizar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`flex flex-col rounded-xl border bg-card transition-opacity ${
        status === 'entregue' ? 'opacity-55' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-3 border-b border-border/60">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${TIPO_BADGE[pedido.tipo]}`}>
          {TIPO_LABEL[pedido.tipo]}
        </span>
        <span className="text-xs font-mono text-muted-foreground shrink-0">
          {shortId(pedido.id)}
        </span>
        {pedido.cliente && (
          <span className="text-xs text-muted-foreground truncate min-w-0">
            · {pedido.cliente.nome}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">{formatHorario(pedido.criadoEm)}</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${STATUS_BADGE[status]}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>
      </div>

      {/* Itens */}
      <ul className="px-4 py-3 flex-1 space-y-2">
        {pedido.itens.map((item) => (
          <li key={item.id} className="flex gap-2.5">
            <span className="text-xs font-bold text-primary shrink-0 tabular-nums w-6 text-right mt-px">
              {item.quantidade}×
            </span>
            <div className="min-w-0">
              <p className="text-sm text-foreground leading-snug">{item.produto.nome}</p>
              {item.observacao && (
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                  {item.observacao}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="px-4 pb-3.5 pt-3 border-t border-border/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{PAGAMENTO_LABEL[pedido.formaPagamento]}</span>
          <span className="text-sm font-bold tabular-nums">
            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        {nextStatus && (
          <button
            onClick={handleAdvance}
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <Loader2 size={12} className="animate-spin" />
              : <ChevronRight size={12} strokeWidth={2.5} />
            }
            {STATUS_ACTION[status]}
          </button>
        )}
      </div>
    </div>
  )
}
