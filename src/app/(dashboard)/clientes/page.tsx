import Link from 'next/link'
import { Plus, UserRound, Phone, Mail, Pencil } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ClienteSearchInput } from '@/components/ClienteSearchInput'
import { ClientePagination, PER_PAGE } from '@/components/ClientePagination'
import { DeleteClienteInlineButton } from '@/components/DeleteClienteInlineButton'

type SearchParams = Promise<{ busca?: string; page?: string }>

export default async function ClientesPage({ searchParams }: { searchParams: SearchParams }) {
  const { busca, page: pageParam } = await searchParams
  const buscaTrimmed = busca?.trim()
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const where = buscaTrimmed
    ? {
        OR: [
          { nome: { contains: buscaTrimmed, mode: 'insensitive' as const } },
          { telefone: { contains: buscaTrimmed, mode: 'insensitive' as const } },
          { email: { contains: buscaTrimmed, mode: 'insensitive' as const } },
        ],
      }
    : undefined

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      orderBy: { nome: 'asc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        nome: true,
        telefone: true,
        email: true,
      },
    }),
    prisma.cliente.count({ where }),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Clientes</h1>
        <Link
          href="/clientes/novo"
          className="inline-flex items-center gap-2 px-3 py-2 md:px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap active:scale-[0.98]"
        >
          <Plus size={15} strokeWidth={2.5} />
          Novo cliente
        </Link>
      </div>

      {/* Search */}
      <ClienteSearchInput defaultValue={buscaTrimmed} />

      {/* Empty state */}
      {clientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <UserRound size={28} strokeWidth={1.5} className="text-muted-foreground/50" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-foreground">
              {buscaTrimmed ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </p>
            <p className="text-sm text-muted-foreground">
              {buscaTrimmed
                ? `Sem resultados para "${buscaTrimmed}".`
                : 'Adicione clientes para eles aparecerem aqui.'}
            </p>
          </div>
          {!buscaTrimmed && (
            <Link
              href="/clientes/novo"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98]"
            >
              <Plus size={15} strokeWidth={2.5} />
              Novo cliente
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Telefone</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">E-mail</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente, i) => (
                  <tr
                    key={cliente.id}
                    className={`group transition-colors hover:bg-muted/40 ${
                      i < clientes.length - 1 ? 'border-b border-border/60' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{cliente.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {cliente.telefone ?? <span className="opacity-40">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {cliente.email ?? <span className="opacity-40">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <Link
                          href={`/clientes/${cliente.id}/editar`}
                          title={`Editar ${cliente.nome}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil size={15} strokeWidth={1.75} />
                        </Link>
                        <DeleteClienteInlineButton id={cliente.id} nome={cliente.nome} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-2">
            {clientes.map((cliente) => (
              <div
                key={cliente.id}
                className="flex items-center justify-between gap-3 bg-card border border-border rounded-xl px-4 py-3"
              >
                <div className="min-w-0 space-y-0.5 flex-1">
                  <p className="font-semibold text-sm text-foreground truncate">{cliente.nome}</p>
                  <div className="flex flex-col gap-0.5">
                    {cliente.telefone && (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone size={11} strokeWidth={2} />
                        {cliente.telefone}
                      </span>
                    )}
                    {cliente.email && (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail size={11} strokeWidth={2} />
                        {cliente.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Link
                    href={`/clientes/${cliente.id}/editar`}
                    title={`Editar ${cliente.nome}`}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Pencil size={16} strokeWidth={1.75} />
                  </Link>
                  <DeleteClienteInlineButton id={cliente.id} nome={cliente.nome} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <ClientePagination page={page} total={total} busca={buscaTrimmed} />
        </>
      )}
    </div>
  )
}
