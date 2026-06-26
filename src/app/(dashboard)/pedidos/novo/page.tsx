import { prisma } from '@/lib/prisma'
import { NovoPedidoForm } from '@/components/NovoPedidoForm'

export default async function NovoPedidoPage() {
  const [produtos, clientes] = await Promise.all([
    prisma.produto.findMany({
      where: { disponivel: true },
      orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
      select: {
        id: true,
        nome: true,
        categoria: true,
        preco: true,
        disponivel: true,
        imagemUrl: true,
      },
    }),
    prisma.cliente.findMany({
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, telefone: true },
    }),
  ])

  const produtosSerializados = produtos.map((p) => ({
    ...p,
    preco: Number(p.preco),
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-foreground">Novo pedido</h1>
      <NovoPedidoForm produtos={produtosSerializados} clientes={clientes} />
    </div>
  )
}
