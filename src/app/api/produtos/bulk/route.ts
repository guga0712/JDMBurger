import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const itemSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(2).max(100).optional(),
  categoria: z.enum(['lanches', 'bebidas', 'acompanhamento', 'doces']).optional(),
  preco: z.number().positive().max(9999).optional(),
  disponivel: z.boolean().optional(),
  imagemUrl: z.string().url().optional().nullable(),
})

const bulkSchema = z.array(itemSchema).min(1).max(200)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (session.user.papel !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body: unknown = await request.json()
    const parsed = bulkSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await prisma.$transaction(
      parsed.data.map(({ id, ...data }) =>
        prisma.produto.update({ where: { id }, data })
      )
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao salvar alterações' }, { status: 500 })
  }
}
