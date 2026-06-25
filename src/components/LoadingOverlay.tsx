export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/75 backdrop-blur-[5px]">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-11 w-11">
          {/* Track */}
          <div className="absolute inset-0 rounded-full border-[3px] border-border" />
          {/* Spinner */}
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
          Carregando
        </span>
      </div>
    </div>
  )
}
