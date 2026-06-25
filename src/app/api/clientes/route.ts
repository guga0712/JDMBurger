import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const createSchema = z.object({
  nome: z.string().min(2).max(100),
  telefone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const busca = searchParams.get('busca')?.trim()

    const clientes = await prisma.cliente.findMany({
      where: busca
        ? {
            OR: [
              { nome: { contains: busca, mode: 'insensitive' } },
              { telefone: { contains: busca, mode: 'insensitive' } },
              { email: { contains: busca, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        telefone: true,
        email: true,
      },
    })

    return NextResponse.json(clientes)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 })
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

    const { nome, telefone, email } = parsed.data

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        telefone: telefone ?? null,
        email: email ?? null,
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        email: true,
      },
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
  }
}
