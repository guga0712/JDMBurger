import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Package, Plus, ShoppingBag, Users } from 'lucide-react'
import DashboardChart from '@/components/DashboardChart'

const papelLabel: Record<string, string> = {
  admin: 'Administrador',
  atendente: 'Atendente',
  cozinha: 'Cozinha',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const desde = new Date()
  desde.setDate(desde.getDate() - 6)
  desde.setHours(0, 0, 0, 0)

  const [totalProdutos, produtosDisponiveis, totalPedidos, totalClientes, pedidosRaw] =
    await Promise.all([
      prisma.produto.count(),
      prisma.produto.count({ where: { disponivel: true } }),
      prisma.pedido.count(),
      prisma.cliente.count(),
      prisma.$queryRaw<{ data: Date; total: bigint }[]>`
        SELECT
          DATE_TRUNC('day', "criadoEm" AT TIME ZONE 'America/Sao_Paulo') AS data,
          COUNT(*)::bigint AS total
        FROM "Pedido"
        WHERE "criadoEm" >= ${desde}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
    ])

  const mapaRaw = new Map(
    pedidosRaw.map((r) => [r.data.toISOString().slice(0, 10), Number(r.total)])
  )

  const pedidosPorDia = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(desde)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    return { data: key, total: mapaRaw.get(key) ?? 0 }
  })

  const nome = session?.user?.nome ?? 'usuário'
  const papel = session?.user?.papel
  const papelText = papel ? papelLabel[papel] : 'Usuário'

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Bem-vindo, {nome}
          </h1>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            {papelText}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Painel de controle — JDMBurger</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pedidos</p>
          <p className="text-3xl font-black text-foreground">{totalPedidos}</p>
          <p className="text-xs text-muted-foreground">no total</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Clientes</p>
          <p className="text-3xl font-black text-foreground">{totalClientes}</p>
          <p className="text-xs text-muted-foreground">cadastrados</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 space-y-1 col-span-2 md:col-span-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Produtos</p>
          <p className="text-3xl font-black text-foreground">{totalProdutos}</p>
          <p className="text-xs text-muted-foreground">{produtosDisponiveis} disponíveis</p>
        </div>
      </div>

      {/* Chart */}
      <DashboardChart dadosIniciais={pedidosPorDia} />

      {/* Quick access */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Acesso rápido
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Link
            href="/produtos"
            className="flex items-center gap-4 bg-card border border-border hover:border-primary/30 rounded-xl p-4 transition-all group hover:shadow-[0_4px_16px_rgba(192,57,43,0.08)]"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
              <Package size={18} strokeWidth={1.75} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Produtos</p>
              <p className="text-xs text-muted-foreground">{totalProdutos} cadastrados</p>
            </div>
          </Link>
          <Link
            href="/clientes"
            className="flex items-center gap-4 bg-card border border-border hover:border-primary/30 rounded-xl p-4 transition-all group hover:shadow-[0_4px_16px_rgba(192,57,43,0.08)]"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
              <Users size={18} strokeWidth={1.75} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Clientes</p>
              <p className="text-xs text-muted-foreground">{totalClientes} cadastrados</p>
            </div>
          </Link>
          <Link
            href="/pedidos/novo"
            className="flex items-center gap-4 bg-card border border-border hover:border-primary/30 rounded-xl p-4 transition-all group hover:shadow-[0_4px_16px_rgba(192,57,43,0.08)]"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
              <Plus size={18} strokeWidth={1.75} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Novo pedido</p>
              <p className="text-xs text-muted-foreground">Registrar agora</p>
            </div>
          </Link>
          <Link
            href="/produtos/novo"
            className="flex items-center gap-4 bg-card border border-border hover:border-primary/30 rounded-xl p-4 transition-all group hover:shadow-[0_4px_16px_rgba(192,57,43,0.08)]"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
              <ShoppingBag size={18} strokeWidth={1.75} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Novo produto</p>
              <p className="text-xs text-muted-foreground">Adicionar ao cardápio</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
