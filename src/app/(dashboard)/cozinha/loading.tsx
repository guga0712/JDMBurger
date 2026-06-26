export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="h-8 w-28 rounded-lg bg-muted animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
          <div className="h-9 w-32 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>

      <div className="flex gap-4 border-b border-border pb-px">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-20 rounded bg-muted animate-pulse" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card overflow-hidden">
            <div className="px-4 pt-3.5 pb-3 border-b border-border/60 flex items-center gap-2">
              <div className="h-5 w-14 rounded-md bg-muted animate-pulse" />
              <div className="h-4 w-16 rounded bg-muted animate-pulse" />
              <div className="ml-auto h-5 w-20 rounded-md bg-muted animate-pulse" />
            </div>
            <div className="px-4 py-3 space-y-2.5">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex gap-2.5">
                  <div className="h-4 w-6 rounded bg-muted animate-pulse shrink-0" />
                  <div className="h-4 rounded bg-muted animate-pulse" style={{ width: `${60 + j * 15}%` }} />
                </div>
              ))}
            </div>
            <div className="px-4 pb-3.5 pt-3 border-t border-border/60 space-y-2.5">
              <div className="flex justify-between">
                <div className="h-4 w-12 rounded bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-8 rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
