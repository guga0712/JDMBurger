import Link from 'next/link'
import { ProdutoForm } from '@/components/ProdutoForm'

export default function NovoProdutoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/produtos"
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          ← Produtos
        </Link>
        <span className="text-muted-foreground text-sm">/</span>
        <span className="text-sm text-foreground font-medium">Novo produto</span>
      </div>

      <h1 className="text-2xl font-bold text-foreground">Novo produto</h1>

      <ProdutoForm />
    </div>
  )
}
