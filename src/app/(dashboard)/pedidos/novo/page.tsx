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
    id: p.id,
    nome: p.nome,
    categoria: p.categoria as 'lanches' | 'bebidas' | 'acompanhamento' | 'doces',
    preco: Number(p.preco),
    disponivel: p.disponivel,
    imagemUrl: p.imagemUrl,
  }))

  return (
    <div className="flex flex-col lg:h-full lg:overflow-hidden">
      <h1 className="text-xl md:text-2xl font-bold text-foreground mb-5 lg:shrink-0">Novo pedido</h1>
      <div className="lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <NovoPedidoForm produtos={produtosSerializados} clientes={clientes} />
      </div>
    </div>
  )
}
