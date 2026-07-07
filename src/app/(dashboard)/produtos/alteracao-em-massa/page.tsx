import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import BulkEditProdutos from '@/components/BulkEditProdutos'

export default async function AlteracaoEmMassaPage() {
  const produtos = await prisma.produto.findMany({
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

  const produtosSerializados = produtos.map((p) => ({
    ...p,
    preco: Number(p.preco),
  }))

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
        <span className="text-sm text-foreground font-medium">Alteração em massa</span>
      </div>

      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Alteração em massa</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edite nome, categoria, preço, disponibilidade e foto de vários produtos de uma vez. Clique em &quot;Salvar alterações&quot; para confirmar.
        </p>
      </div>

      <BulkEditProdutos produtos={produtosSerializados} />
    </div>
  )
}
