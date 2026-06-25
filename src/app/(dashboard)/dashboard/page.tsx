import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Package, Plus } from 'lucide-react'

const papelLabel: Record<string, string> = {
  admin: 'Administrador',
  atendente: 'Atendente',
  cozinha: 'Cozinha',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const [totalProdutos, produtosDisponiveis] = await Promise.all([
    prisma.produto.count(),
    prisma.produto.count({ where: { disponivel: true } }),
  ])

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Produtos</p>
          <p className="text-3xl font-black text-foreground">{totalProdutos}</p>
          <p className="text-xs text-muted-foreground">{produtosDisponiveis} disponíveis</p>
        </div>
        <div className="bg-card border border-dashed border-border rounded-xl p-4 space-y-1 opacity-40">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pedidos</p>
          <p className="text-3xl font-black text-foreground">—</p>
          <p className="text-xs text-muted-foreground">Em breve</p>
        </div>
        <div className="bg-card border border-dashed border-border rounded-xl p-4 space-y-1 opacity-40">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Clientes</p>
          <p className="text-3xl font-black text-foreground">—</p>
          <p className="text-xs text-muted-foreground">Em breve</p>
        </div>
        <div className="bg-card border border-dashed border-border rounded-xl p-4 space-y-1 opacity-40">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Faturamento</p>
          <p className="text-3xl font-black text-foreground">—</p>
          <p className="text-xs text-muted-foreground">Em breve</p>
        </div>
      </div>

      {/* Quick access */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Acesso rápido
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            href="/produtos/novo"
            className="flex items-center gap-4 bg-card border border-border hover:border-primary/30 rounded-xl p-4 transition-all group hover:shadow-[0_4px_16px_rgba(192,57,43,0.08)]"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
              <Plus size={18} strokeWidth={1.75} className="text-primary" />
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
