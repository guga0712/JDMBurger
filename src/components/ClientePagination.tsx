import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PER_PAGE = 20

type Props = {
  page: number
  total: number
  busca?: string
}

function buildHref(page: number, busca?: string) {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', page.toString())
  if (busca) params.set('busca', busca)
  const qs = params.toString()
  return `/clientes${qs ? `?${qs}` : ''}`
}

function getPageItems(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const items: (number | 'ellipsis')[] = [1]

  const rangeStart = Math.max(2, current - 1)
  const rangeEnd = Math.min(total - 1, current + 1)

  if (rangeStart > 2) items.push('ellipsis')
  for (let i = rangeStart; i <= rangeEnd; i++) items.push(i)
  if (rangeEnd < total - 1) items.push('ellipsis')

  items.push(total)
  return items
}

export function ClientePagination({ page, total, busca }: Props) {
  const totalPages = Math.ceil(total / PER_PAGE)
  if (totalPages <= 1) return null

  const items = getPageItems(page, totalPages)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  const navBtn =
    'inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium border transition-colors'
  const navActive = `${navBtn} border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground`
  const navDisabled = `${navBtn} border-border/30 bg-card/50 text-muted-foreground/30 cursor-not-allowed pointer-events-none`

  const pageBtn =
    'inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium border transition-colors'
  const pageActive = `${pageBtn} bg-primary border-primary text-primary-foreground shadow-sm`
  const pageIdle = `${pageBtn} border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground`

  const from = (page - 1) * PER_PAGE + 1
  const to = Math.min(page * PER_PAGE, total)

  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      <nav aria-label="Paginação" className="flex items-center gap-1">
        {/* Anterior */}
        {hasPrev ? (
          <Link href={buildHref(page - 1, busca)} className={navActive} aria-label="Página anterior">
            <ChevronLeft size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">Anterior</span>
          </Link>
        ) : (
          <span className={navDisabled} aria-disabled="true">
            <ChevronLeft size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">Anterior</span>
          </span>
        )}

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-1">
          {items.map((item, i) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${i}`}
                className="inline-flex items-center justify-center w-9 h-9 text-sm text-muted-foreground/40 select-none"
              >
                …
              </span>
            ) : (
              <Link
                key={item}
                href={buildHref(item, busca)}
                aria-current={item === page ? 'page' : undefined}
                className={item === page ? pageActive : pageIdle}
              >
                {item}
              </Link>
            )
          )}
        </div>

        {/* Próximo */}
        {hasNext ? (
          <Link href={buildHref(page + 1, busca)} className={navActive} aria-label="Próxima página">
            <span className="hidden sm:inline">Próximo</span>
            <ChevronRight size={14} strokeWidth={2.5} />
          </Link>
        ) : (
          <span className={navDisabled} aria-disabled="true">
            <span className="hidden sm:inline">Próximo</span>
            <ChevronRight size={14} strokeWidth={2.5} />
          </span>
        )}
      </nav>

      <p className="text-xs text-muted-foreground/50">
        {from}–{to} de {total} cliente{total !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

export { PER_PAGE }
