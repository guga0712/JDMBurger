import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProdutoForm } from '@/components/ProdutoForm'

export default function NovoProdutoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5">
        <Link
          href="/produtos"
          className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ChevronLeft size={15} strokeWidth={2} />
          Produtos
        </Link>
        <span className="text-muted-foreground/50 text-sm">/</span>
        <span className="text-sm text-foreground font-medium">Novo produto</span>
      </div>

      <h1 className="text-xl md:text-2xl font-bold text-foreground">Novo produto</h1>

      <ProdutoForm />
    </div>
  )
}
