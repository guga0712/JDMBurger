import Link from 'next/link'
import { Plus, ClipboardList } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { PedidoCard, type PedidoCardData } from '@/components/PedidoCard'
import { AtualizarButton } from '@/components/AtualizarButton'

type Status = 'recebido' | 'preparando' | 'pronto' | 'entregue'

const VALID_STATUS: Status[] = ['recebido', 'preparando', 'pronto', 'entregue']

const STATUS_LABEL: Record<Status, string> = {
  recebido: 'Recebido',
  preparando: 'Preparando',
  pronto: 'Pronto',
  entregue: 'Entregue',
}

type SearchParams = Promise<{ status?: string }>

export default async function CozinhaPage({ searchParams }: { searchParams: SearchParams }) {
  const { status: statusParam } = await searchParams
  const statusFilter = VALID_STATUS.includes(statusParam as Status)
    ? (statusParam as Status)
    : null

  const [pedidos, counts] = await Promise.all([
    prisma.pedido.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
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
    }),
    prisma.pedido.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
  ])

  const countMap = counts.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = c._count.id
    return acc
  }, {})
  const totalCount = Object.values(countMap).reduce((sum, n) => sum + n, 0)

  const pedidosSerializados: PedidoCardData[] = pedidos.map((p) => ({
    id: p.id,
    status: p.status,
    tipo: p.tipo,
    formaPagamento: p.formaPagamento,
    criadoEm: p.criadoEm.toISOString(),
    cliente: p.cliente ? { nome: p.cliente.nome } : null,
    itens: p.itens.map((item) => ({
      id: item.id,
      quantidade: item.quantidade,
      observacao: item.observacao,
      produto: {
        nome: item.produto.nome,
        preco: Number(item.produto.preco),
      },
    })),
  }))

  const tabs = [
    { label: 'Todos', value: null as Status | null, count: totalCount },
    ...VALID_STATUS.map((s) => ({ label: STATUS_LABEL[s], value: s, count: countMap[s] ?? 0 })),
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Cozinha</h1>
        <div className="flex items-center gap-2">
          <AtualizarButton />
          <Link
            href="/pedidos/novo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98]"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span className="hidden sm:inline">Novo pedido</span>
            <span className="sm:hidden">Novo</span>
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0 overflow-x-auto border-b border-border">
        {tabs.map((tab) => {
          const isActive = tab.value === statusFilter
          const href = tab.value ? `/cozinha?status=${tab.value}` : '/cozinha'
          return (
            <Link
              key={tab.value ?? 'all'}
              href={href}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
                isActive
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                    isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Grid de pedidos */}
      {pedidosSerializados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <ClipboardList size={28} strokeWidth={1.5} className="text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              {statusFilter
                ? `Nenhum pedido ${STATUS_LABEL[statusFilter].toLowerCase()}`
                : 'Nenhum pedido ainda'}
            </p>
            <p className="text-sm text-muted-foreground">
              {statusFilter
                ? 'Tente outro filtro ou crie um novo pedido.'
                : 'Crie um novo pedido para começar.'}
            </p>
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pedidosSerializados.map((p) => (
            <PedidoCard key={p.id} pedido={p} />
          ))}
        </div>
      )}
    </div>
  )
}
