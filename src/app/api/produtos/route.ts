import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const createSchema = z.object({
  nome: z.string().min(1).max(100),
  categoria: z.enum(['lanches', 'bebidas', 'acompanhamento', 'doces']),
  preco: z.number().positive(),
  disponivel: z.boolean().default(true),
  imagemUrl: z.string().url().optional().nullable(),
})

export async function GET() {
  try {
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

    return NextResponse.json(produtos)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
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

    const { nome, categoria, preco, disponivel, imagemUrl } = parsed.data

    const produto = await prisma.produto.create({
      data: {
        nome,
        categoria,
        preco,
        disponivel,
        imagemUrl: imagemUrl ?? null,
      },
      select: {
        id: true,
        nome: true,
        categoria: true,
        preco: true,
        disponivel: true,
        imagemUrl: true,
      },
    })

    return NextResponse.json(produto, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}
