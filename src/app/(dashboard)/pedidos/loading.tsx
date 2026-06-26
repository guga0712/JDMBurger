export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="h-8 w-28 rounded-lg bg-muted animate-pulse" />
        <div className="h-9 w-32 rounded-lg bg-muted animate-pulse" />
      </div>

      {/* Desktop table skeleton */}
      <div className="hidden md:block rounded-xl border border-border overflow-hidden">
        <div className="bg-muted/40 border-b border-border px-4 py-3 flex gap-8">
          {['w-16', 'w-24', 'w-40', 'w-16', 'w-20', 'w-16'].map((w, i) => (
            <div key={i} className={`h-3 ${w} rounded bg-muted animate-pulse`} />
          ))}
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-8">
              <div className="h-4 w-16 rounded bg-muted animate-pulse shrink-0" />
              <div className="h-4 w-28 rounded bg-muted animate-pulse shrink-0" />
              <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
              <div className="h-4 w-20 rounded bg-muted animate-pulse shrink-0" />
              <div className="h-4 w-12 rounded bg-muted animate-pulse shrink-0" />
              <div className="h-5 w-20 rounded-md bg-muted animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile skeleton */}
      <div className="md:hidden space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card px-4 py-3 space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-32 rounded bg-muted animate-pulse" />
              <div className="h-5 w-20 rounded-md bg-muted animate-pulse" />
            </div>
            <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
            <div className="flex justify-between">
              <div className="h-3 w-12 rounded bg-muted animate-pulse" />
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
