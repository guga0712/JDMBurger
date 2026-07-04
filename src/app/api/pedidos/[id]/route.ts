import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const updateSchema = z.object({
  status: z.enum(['recebido', 'preparando', 'pronto', 'entregue']),
})

const statusPermitidosPorPapel = {
  cozinha: ['preparando', 'pronto'],
  atendente: ['entregue'],
  admin: ['recebido', 'preparando', 'pronto', 'entregue'],
} as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body: unknown = await request.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const { status } = parsed.data
    const papel = session.user.papel
    const permitidos = statusPermitidosPorPapel[papel] as readonly string[]

    if (!permitidos.includes(status)) {
      return NextResponse.json(
        { error: 'Sem permissão para definir este status' },
        { status: 403 }
      )
    }

    const pedidoExiste = await prisma.pedido.findUnique({ where: { id } })
    if (!pedidoExiste) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    const pedido = await prisma.pedido.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(pedido)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 })
  }
}
