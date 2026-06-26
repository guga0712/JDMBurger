import Link from 'next/link'
import { Plus, ClipboardList } from 'lucide-react'
import { prisma } from '@/lib/prisma'

type Status = 'recebido' | 'preparando' | 'pronto' | 'entregue'
type FormaPagamento = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro'

const STATUS_LABEL: Record<Status, string> = {
  recebido: 'Recebido',
  preparando: 'Preparando',
  pronto: 'Pronto',
  entregue: 'Entregue',
}

const STATUS_BADGE: Record<Status, string> = {
  recebido: 'bg-amber-500/15 text-amber-400',
  preparando: 'bg-blue-500/15 text-blue-400',
  pronto: 'bg-emerald-500/15 text-emerald-400',
  entregue: 'bg-muted text-muted-foreground',
}

const PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  pix: 'Pix',
  cartao_credito: 'Cartão',
  cartao_debito: 'Débito',
  dinheiro: 'Dinheiro',
}

function formatHorario(date: Date): string {
  const today = new Date()
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return time
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' · ' + time
}

function resumoItens(itens: { quantidade: number; produto: { nome: string } }[]): string {
  return itens
    .map((i) => `${i.quantidade}× ${i.produto.nome}`)
    .join(', ')
}

export default async function PedidosPage() {
  const pedidos = await prisma.pedido.findMany({
    orderBy: { criadoEm: 'desc' },
    take: 100,
    include: {
      cliente: { select: { nome: true } },
      itens: {
        include: {
          produto: { select: { nome: true, preco: true } },
        },
      },
    },
  })

  const pedidosSerializados = pedidos.map((p) => ({
    id: p.id,
    status: p.status as Status,
    formaPagamento: p.formaPagamento as FormaPagamento,
    criadoEm: formatHorario(p.criadoEm),
    cliente: p.cliente?.nome ?? null,
    total: p.itens.reduce((sum, i) => sum + Number(i.produto.preco) * i.quantidade, 0),
    resumo: resumoItens(p.itens),
    totalItens: p.itens.reduce((sum, i) => sum + i.quantidade, 0),
  }))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Pedidos</h1>
        <Link
          href="/pedidos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98]"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span className="hidden sm:inline">Novo pedido</span>
          <span className="sm:hidden">Novo</span>
        </Link>
      </div>

      {pedidosSerializados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <ClipboardList size={28} strokeWidth={1.5} className="text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Nenhum pedido ainda</p>
            <p className="text-sm text-muted-foreground">Crie um novo pedido para começar.</p>
          </div>
          <Link
            href="/pedidos/novo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98]"
          >
            <Plus size={15} strokeWidth={2.5} />
            Novo pedido
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop: tabela */}
          <div className="hidden md:block rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Horário
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Itens
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Pagamento
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {pedidosSerializados.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">
                      {p.criadoEm}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {p.cliente ?? <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="text-muted-foreground line-clamp-1">{p.resumo}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap">
                      {p.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {PAGAMENTO_LABEL[p.formaPagamento]}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${STATUS_BADGE[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards simples */}
          <div className="md:hidden space-y-3">
            {pedidosSerializados.map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-card px-4 py-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">{p.criadoEm}</span>
                    {p.cliente && (
                      <span className="text-sm font-medium truncate">{p.cliente}</span>
                    )}
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${STATUS_BADGE[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.resumo}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{PAGAMENTO_LABEL[p.formaPagamento]}</span>
                  <span className="text-sm font-bold tabular-nums">
                    {p.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
