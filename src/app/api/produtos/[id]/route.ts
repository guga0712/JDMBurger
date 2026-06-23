import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const updateSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  categoria: z.enum(['lanches', 'bebidas', 'acompanhamento', 'doces']).optional(),
  preco: z.number().positive().optional(),
  disponivel: z.boolean().optional(),
  imagemUrl: z.string().url().optional().nullable(),
})

export async function PUT(
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
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const produto = await prisma.produto.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        nome: true,
        categoria: true,
        preco: true,
        disponivel: true,
        imagemUrl: true,
      },
    })

    return NextResponse.json(produto)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (session.user.papel !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params

    await prisma.produto.delete({ where: { id } })

    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Erro ao deletar produto' }, { status: 500 })
  }
}
