import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ProdutoForm } from '@/components/ProdutoForm'
import { DeleteProdutoButton } from '@/components/DeleteProdutoButton'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditarProdutoPage({ params }: Props) {
  const { id } = await params

  const produto = await prisma.produto.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      categoria: true,
      preco: true,
      disponivel: true,
      imagemUrl: true,
    },
  })

  if (!produto) {
    notFound()
  }

  const initialData = {
    id: produto.id,
    nome: produto.nome,
    categoria: produto.categoria,
    preco: Number(produto.preco),
    disponivel: produto.disponivel,
    imagemUrl: produto.imagemUrl,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5">
        <Link
          href="/produtos"
          className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ChevronLeft size={15} strokeWidth={2} />
          Produtos
        </Link>
        <span className="text-muted-foreground/50 text-sm">/</span>
        <span className="text-sm text-foreground font-medium">Editar produto</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Editar produto</h1>
        <DeleteProdutoButton id={produto.id} nome={produto.nome} />
      </div>

      <ProdutoForm initialData={initialData} />
    </div>
  )
}
