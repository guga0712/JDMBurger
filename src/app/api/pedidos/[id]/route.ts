import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const updateSchema = z.object({
  status: z.enum(['recebido', 'preparando', 'pronto', 'entregue']),
})

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

    const pedido = await prisma.pedido.update({
      where: { id },
      data: { status: parsed.data.status },
    })

    return NextResponse.json(pedido)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 })
  }
}
