import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const itemSchema = z.object({
  produtoId: z.string().min(1),
  quantidade: z.number().int().positive(),
  observacao: z.string().max(200).optional().nullable(),
})

const createSchema = z.object({
  clienteId: z.string().optional().nullable(),
  tipo: z.enum(['mesa', 'retirada', 'delivery']),
  formaPagamento: z.enum(['pix', 'cartao_credito', 'dinheiro']),
  itens: z.array(itemSchema).min(1, 'O pedido deve ter pelo menos 1 item.'),
})

export async function GET() {
  try {
    const pedidos = await prisma.pedido.findMany({
      orderBy: { criadoEm: 'desc' },
      include: {
        cliente: { select: { id: true, nome: true } },
        itens: {
          include: {
            produto: { select: { id: true, nome: true, preco: true } },
          },
        },
      },
    })
    return NextResponse.json(pedidos)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body: unknown = await request.json()
    const parsed = createSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { clienteId, tipo, formaPagamento, itens } = parsed.data

    const pedido = await prisma.$transaction(async (tx) => {
      const novoPedido = await tx.pedido.create({
        data: {
          clienteId: clienteId ?? null,
          usuarioId: session.user.id,
          tipo,
          formaPagamento,
          status: 'recebido',
        },
      })

      await tx.itemPedido.createMany({
        data: itens.map((item) => ({
          pedidoId: novoPedido.id,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          observacao: item.observacao ?? null,
        })),
      })

      return tx.pedido.findUnique({
        where: { id: novoPedido.id },
        include: {
          cliente: { select: { id: true, nome: true } },
          itens: {
            include: {
              produto: { select: { id: true, nome: true, preco: true } },
            },
          },
        },
      })
    })

    return NextResponse.json(pedido, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }
}
