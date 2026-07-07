import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dias = Math.min(Math.max(parseInt(searchParams.get('dias') ?? '7', 10), 1), 90)

    const desde = new Date()
    desde.setDate(desde.getDate() - (dias - 1))
    desde.setHours(0, 0, 0, 0)

    const [totalPedidos, totalClientes, totalProdutos, pedidosRaw] = await Promise.all([
      prisma.pedido.count(),
      prisma.cliente.count(),
      prisma.produto.count(),
      prisma.$queryRaw<{ data: Date; total: bigint }[]>`
        SELECT
          DATE_TRUNC('day', "criadoEm" AT TIME ZONE 'America/Sao_Paulo') AS data,
          COUNT(*)::bigint AS total
        FROM "Pedido"
        WHERE "criadoEm" >= ${desde}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
    ])

    // Preencher dias sem pedido com 0
    const mapaRaw = new Map(
      pedidosRaw.map((r) => [r.data.toISOString().slice(0, 10), Number(r.total)])
    )

    const pedidosPorDia = Array.from({ length: dias }, (_, i) => {
      const d = new Date(desde)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      return { data: key, total: mapaRaw.get(key) ?? 0 }
    })

    return NextResponse.json({ totalPedidos, totalClientes, totalProdutos, pedidosPorDia })
  } catch (err) {
    console.error('[GET /api/dashboard]', err)
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}
