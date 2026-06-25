import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ClienteForm } from '@/components/ClienteForm'
import { DeleteClienteButton } from '@/components/DeleteClienteButton'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditarClientePage({ params }: Props) {
  const { id } = await params

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      telefone: true,
      email: true,
    },
  })

  if (!cliente) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5">
        <Link
          href="/clientes"
          className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ChevronLeft size={15} strokeWidth={2} />
          Clientes
        </Link>
        <span className="text-muted-foreground/50 text-sm">/</span>
        <span className="text-sm text-foreground font-medium">Editar cliente</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Editar cliente</h1>
        <DeleteClienteButton id={cliente.id} nome={cliente.nome} />
      </div>

      <ClienteForm initialData={cliente} />
    </div>
  )
}
