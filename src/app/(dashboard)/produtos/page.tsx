import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProdutoCard } from '@/components/ProdutoCard'
import { Categoria } from '@prisma/client'

const CATEGORIAS: { value: Categoria | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'lanches', label: 'Lanches' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'acompanhamento', label: 'Acompanhamento' },
  { value: 'doces', label: 'Doces' },
]

type SearchParams = Promise<{ categoria?: string }>

export default async function ProdutosPage({ searchParams }: { searchParams: SearchParams }) {
  const { categoria: categoriaParam } = await searchParams

  const categoriaFiltro =
    categoriaParam && categoriaParam !== 'todos'
      ? (categoriaParam as Categoria)
      : undefined

  const produtos = await prisma.produto.findMany({
    where: categoriaFiltro ? { categoria: categoriaFiltro } : undefined,
    orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
    select: {
      id: true,
      nome: true,
      categoria: true,
      preco: true,
      disponivel: true,
      imagemUrl: true,
    },
  })

  const categoriaAtiva = categoriaParam ?? 'todos'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Produtos</h1>
        <Link
          href="/produtos/novo"
          className="inline-flex items-center px-3 py-2 md:px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          + Novo produto
        </Link>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIAS.map((cat) => {
          const isActive = categoriaAtiva === cat.value
          const href =
            cat.value === 'todos'
              ? '/produtos'
              : `/produtos?categoria=${cat.value}`
          return (
            <Link
              key={cat.value}
              href={href}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
              }`}
            >
              {cat.label}
            </Link>
          )
        })}
      </div>

      {/* Grid */}
      {produtos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Nenhum produto encontrado.</p>
          <Link
            href="/produtos/novo"
            className="mt-3 inline-block text-primary hover:underline text-sm"
          >
            Adicionar produto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {produtos.map((produto) => (
            <ProdutoCard
              key={produto.id}
              id={produto.id}
              nome={produto.nome}
              categoria={produto.categoria}
              preco={Number(produto.preco)}
              disponivel={produto.disponivel}
              imagemUrl={produto.imagemUrl}
            />
          ))}
        </div>
      )}
    </div>
  )
}
