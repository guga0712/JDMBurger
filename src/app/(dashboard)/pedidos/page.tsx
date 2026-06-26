import Link from 'next/link'
import { ClipboardList, Plus } from 'lucide-react'

export default function PedidosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-foreground">Pedidos</h1>
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <ClipboardList size={28} strokeWidth={1.5} className="text-muted-foreground/50" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold text-foreground">Lista de pedidos em breve</p>
          <p className="text-sm text-muted-foreground">
            Por enquanto, crie um novo pedido para começar.
          </p>
        </div>
        <Link
          href="/pedidos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98]"
        >
          <Plus size={15} strokeWidth={2.5} />
          Novo pedido
        </Link>
      </div>
    </div>
  )
}
