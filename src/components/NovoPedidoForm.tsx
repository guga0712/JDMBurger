'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Plus, Minus, Search, UserPlus, X,
  CheckCircle2, AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Categoria = 'lanches' | 'bebidas' | 'acompanhamento' | 'doces'

type Produto = {
  id: string
  nome: string
  categoria: Categoria
  preco: number
  disponivel: boolean
  imagemUrl: string | null
}

type Cliente = {
  id: string
  nome: string
  telefone: string | null
}

type CartEntry = {
  quantidade: number
  observacao: string
}

type Props = {
  produtos: Produto[]
  clientes: Cliente[]
}

const CATEGORIA_ORDER: Categoria[] = ['lanches', 'bebidas', 'acompanhamento', 'doces']
const CATEGORIA_LABELS: Record<Categoria, string> = {
  lanches: 'Lanches',
  bebidas: 'Bebidas',
  acompanhamento: 'Acompanhamento',
  doces: 'Doces',
}
const EMOJI_MAP: Record<Categoria, string> = {
  lanches: '🍔',
  bebidas: '🥤',
  acompanhamento: '🍟',
  doces: '🍰',
}

const TIPO_OPTIONS = [
  { value: 'mesa' as const, label: 'Mesa' },
  { value: 'retirada' as const, label: 'Retirada' },
  { value: 'delivery' as const, label: 'Delivery' },
]

function maskTelefone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  const len = digits.length
  if (len === 0) return ''
  if (len <= 2) return `(${digits}`
  if (len <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (len <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

const PAGAMENTO_OPTIONS = [
  { value: 'pix' as const, label: 'Pix' },
  { value: 'cartao_credito' as const, label: 'Cartão' },
  { value: 'dinheiro' as const, label: 'Dinheiro' },
]

export function NovoPedidoForm({ produtos, clientes: clientesIniciais }: Props) {
  const router = useRouter()

  /* ── Cart ── */
  const [cart, setCart] = useState<Record<string, CartEntry>>({})

  /* ── Cliente ── */
  const [clienteId, setClienteId] = useState<string | null>(null)
  const [clienteNome, setClienteNome] = useState('')
  const [busca, setBusca] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickNome, setQuickNome] = useState('')
  const [quickTelefone, setQuickTelefone] = useState('')
  const [creatingCliente, setCreatingCliente] = useState(false)
  const [quickError, setQuickError] = useState<string | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais)

  /* ── Options ── */
  const [tipo, setTipo] = useState<'mesa' | 'retirada' | 'delivery'>('mesa')
  const [formaPagamento, setFormaPagamento] = useState<'pix' | 'cartao_credito' | 'dinheiro' | null>(null)

  /* ── Submission ── */
  const [submitting, setSubmitting] = useState(false)
  const [modal, setModal] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  /* ── Cart helpers ── */
  function increment(produto: Produto) {
    if (!produto.disponivel) return
    setCart((prev) => ({
      ...prev,
      [produto.id]: {
        quantidade: (prev[produto.id]?.quantidade ?? 0) + 1,
        observacao: prev[produto.id]?.observacao ?? '',
      },
    }))
  }

  function decrement(produtoId: string) {
    setCart((prev) => {
      const entry = prev[produtoId]
      if (!entry || entry.quantidade <= 0) return prev
      if (entry.quantidade === 1) {
        const next = { ...prev }
        delete next[produtoId]
        return next
      }
      return { ...prev, [produtoId]: { ...entry, quantidade: entry.quantidade - 1 } }
    })
  }

  function setObservacao(produtoId: string, obs: string) {
    setCart((prev) => {
      if (!prev[produtoId]) return prev
      return { ...prev, [produtoId]: { ...prev[produtoId], observacao: obs } }
    })
  }

  /* ── Cliente helpers ── */
  const clientesFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return clientes.slice(0, 8)
    return clientes.filter(
      (c) => c.nome.toLowerCase().includes(q) || c.telefone?.includes(q)
    )
  }, [busca, clientes])

  function handleSelectCliente(c: Cliente) {
    setClienteId(c.id)
    setClienteNome(c.nome)
    setBusca('')
    setShowDropdown(false)
    setShowQuickAdd(false)
  }

  function handleClearCliente() {
    setClienteId(null)
    setClienteNome('')
    setBusca('')
    setShowDropdown(false)
    setShowQuickAdd(false)
  }

  function handleOpenQuickAdd() {
    setQuickNome(busca.trim())
    setQuickTelefone('')
    setQuickError(null)
    setShowQuickAdd(true)
    setShowDropdown(false)
  }

  async function handleQuickAdd() {
    if (!quickNome.trim()) {
      setQuickError('Informe o nome.')
      return
    }
    setCreatingCliente(true)
    setQuickError(null)
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: quickNome.trim(),
          telefone: quickTelefone.trim() || null,
        }),
      })
      const data = await res.json() as { id: string; nome: string; telefone: string | null; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erro ao criar cliente')
      setClientes((prev) => [...prev, { id: data.id, nome: data.nome, telefone: data.telefone }])
      handleSelectCliente({ id: data.id, nome: data.nome, telefone: data.telefone })
      setShowQuickAdd(false)
    } catch (err) {
      setQuickError(err instanceof Error ? err.message : 'Erro ao criar cliente')
    } finally {
      setCreatingCliente(false)
    }
  }

  /* ── Computed ── */
  const cartEntries = useMemo(
    () =>
      Object.entries(cart)
        .map(([produtoId, entry]) => ({
          produto: produtos.find((p) => p.id === produtoId)!,
          ...entry,
        }))
        .filter((e) => e.produto),
    [cart, produtos]
  )

  const total = cartEntries.reduce((sum, e) => sum + e.produto.preco * e.quantidade, 0)
  const canSubmit = cartEntries.length > 0 && formaPagamento !== null && clienteId !== null && !submitting

  const produtosPorCategoria = useMemo(() => {
    const map: Partial<Record<Categoria, Produto[]>> = {}
    for (const p of produtos) {
      if (!map[p.categoria]) map[p.categoria] = []
      map[p.categoria]!.push(p)
    }
    return map
  }, [produtos])

  /* ── Submit ── */
  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: clienteId ?? null,
          tipo,
          formaPagamento,
          itens: cartEntries.map((e) => ({
            produtoId: e.produto.id,
            quantidade: e.quantidade,
            observacao: e.observacao || null,
          })),
        }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erro ao lançar pedido')
      setModal({ type: 'success', message: 'Pedido lançado com sucesso!' })
    } catch (err) {
      setModal({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao lançar pedido',
      })
    } finally {
      setSubmitting(false)
    }
  }

  function handleNewOrder() {
    setCart({})
    setClienteId(null)
    setClienteNome('')
    setBusca('')
    setFormaPagamento(null)
    setTipo('mesa')
    setModal(null)
  }

  /* ── Shared styles ── */
  const pillBase =
    'flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors text-center'
  const pillActive = 'bg-primary border-primary text-primary-foreground'
  const pillIdle =
    'bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'

  return (
    <>
      <div className="flex flex-col gap-6 lg:flex-row lg:h-full lg:overflow-hidden">
        {/* ─────────── LEFT: Products ─────────── */}
        <div className="flex-1 min-w-0 space-y-8 lg:overflow-y-auto lg:min-h-0 lg:pr-1">
          {CATEGORIA_ORDER.map((cat) => {
            const prods = produtosPorCategoria[cat]
            if (!prods?.length) return null
            return (
              <section key={cat}>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {CATEGORIA_LABELS[cat]}
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 xl:grid-cols-7 gap-1.5">
                  {prods.map((produto) => {
                    const qty = cart[produto.id]?.quantidade ?? 0
                    const selected = qty > 0
                    return (
                      <div
                        key={produto.id}
                        className={`rounded-lg overflow-hidden flex flex-col bg-card transition-all duration-150 ${selected
                          ? 'border-[2px] border-primary shadow-[0_0_0_2px_rgba(192,57,43,0.12)]'
                          : 'border border-border'
                          } ${!produto.disponivel ? 'opacity-50' : ''}`}
                      >
                        {/* Image / emoji */}
                        <div className="aspect-square bg-muted relative overflow-hidden">
                          {produto.imagemUrl ? (
                            <Image
                              src={produto.imagemUrl}
                              alt={produto.nome}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xl select-none" aria-hidden="true">
                                {EMOJI_MAP[cat]}
                              </span>
                            </div>
                          )}
                          {!produto.disponivel && (
                            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest px-1 py-0.5 bg-background/80 rounded">
                                Indisp.
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="px-1.5 pt-1 pb-0.5">
                          <p className="text-[10px] font-semibold text-foreground truncate leading-tight">
                            {produto.nome}
                          </p>
                          <p className="text-[10px] font-bold text-primary mt-0.5">
                            {produto.preco.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </p>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-0.5 px-1.5 pb-1.5 mt-auto">
                          <button
                            type="button"
                            onClick={() => decrement(produto.id)}
                            disabled={qty === 0}
                            className={`flex items-center justify-center w-5 h-5 rounded transition-colors font-bold shrink-0 ${qty > 0
                              ? 'bg-primary/10 text-primary hover:bg-primary/20 active:scale-95'
                              : 'bg-muted/40 text-muted-foreground/20 cursor-not-allowed'
                              }`}
                          >
                            <Minus size={8} strokeWidth={3} />
                          </button>
                          <span
                            className={`flex-1 text-center text-[10px] font-bold tabular-nums transition-colors ${qty > 0 ? 'text-primary' : 'text-muted-foreground/30'
                              }`}
                          >
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => increment(produto)}
                            disabled={!produto.disponivel}
                            className="flex items-center justify-center w-5 h-5 rounded bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                          >
                            <Plus size={8} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}

          {produtos.length === 0 && (
            <p className="text-sm text-muted-foreground py-10 text-center">
              Nenhum produto cadastrado.
            </p>
          )}
        </div>

        {/* ─────────── RIGHT: Sidebar ─────────── */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 space-y-4 lg:overflow-y-auto">
          <h2 className='text-lg font-bold text-foreground'>Resumo do pedido</h2>
          {/* Cliente */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Cliente</h3>

            {clienteId ? (
              <div className="flex items-center justify-between gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-foreground truncate">{clienteNome}</span>
                <button
                  type="button"
                  onClick={handleClearCliente}
                  className="text-muted-foreground/50 hover:text-foreground transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => {
                      setBusca(e.target.value)
                      setShowDropdown(true)
                      setShowQuickAdd(false)
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    placeholder="Buscar cliente…"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>

                {showDropdown && (
                  <div className="rounded-lg border border-border bg-card overflow-hidden shadow-md">
                    {clientesFiltrados.length > 0 && (
                      <ul className="divide-y divide-border/60">
                        {clientesFiltrados.map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              onMouseDown={() => handleSelectCliente(c)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                            >
                              <span className="font-medium text-foreground">{c.nome}</span>
                              {c.telefone && (
                                <span className="text-muted-foreground text-xs ml-2">
                                  {c.telefone}
                                </span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      type="button"
                      onMouseDown={handleOpenQuickAdd}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/10 transition-colors ${clientesFiltrados.length > 0 ? 'border-t border-border/60' : ''
                        }`}
                    >
                      <UserPlus size={14} />
                      {busca.trim() ? `Criar "${busca.trim()}"` : 'Novo cliente'}
                    </button>
                  </div>
                )}

                {showQuickAdd && (
                  <div className="rounded-lg border border-border bg-background/60 p-3 space-y-2">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Novo cliente
                    </p>
                    {quickError && (
                      <p className="text-xs text-destructive">{quickError}</p>
                    )}
                    <Input
                      value={quickNome}
                      onChange={(e) => setQuickNome(e.target.value)}
                      placeholder="Nome *"
                      className="h-8 text-sm"
                    />
                    <Input
                      value={quickTelefone}
                      onChange={(e) => setQuickTelefone(maskTelefone(e.target.value))}
                      placeholder="Telefone (opcional)"
                      className="h-8 text-sm"
                      inputMode="numeric"
                      maxLength={15}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleQuickAdd}
                        disabled={creatingCliente}
                        size="sm"
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs"
                      >
                        {creatingCliente ? 'Salvando…' : 'Salvar'}
                      </Button>
                      <Button
                        onClick={() => setShowQuickAdd(false)}
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tipo */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Tipo do pedido</h3>
            <div className="flex gap-2">
              {TIPO_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTipo(opt.value)}
                  className={`${pillBase} ${tipo === opt.value ? pillActive : pillIdle}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Resumo do pedido</h3>

            {cartEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 py-2 text-center">
                Nenhum item selecionado.
              </p>
            ) : (
              <ul className="space-y-3">
                {cartEntries.map((entry) => (
                  <li key={entry.produto.id} className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-baseline gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-primary shrink-0 tabular-nums">
                          {entry.quantidade}×
                        </span>
                        <span className="text-sm font-medium text-foreground truncate">
                          {entry.produto.nome}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-foreground shrink-0 tabular-nums">
                        {(entry.produto.preco * entry.quantidade).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={entry.observacao}
                      onChange={(e) => setObservacao(entry.produto.id, e.target.value)}
                      placeholder="Observação…"
                      maxLength={200}
                      className="w-full px-2.5 py-1 text-xs bg-background border border-border/60 rounded-md text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border transition-colors"
                    />
                  </li>
                ))}
              </ul>
            )}

            {cartEntries.length > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-lg font-bold text-primary tabular-nums">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            )}
          </div>

          {/* Meio de pagamento */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Meio de pagamento</h3>
            <div className="flex gap-2">
              {PAGAMENTO_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormaPagamento(opt.value)}
                  className={`${pillBase} ${formaPagamento === opt.value ? pillActive : pillIdle}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lançar pedido */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-11 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            {submitting ? 'Lançando pedido…' : 'Lançar pedido'}
          </Button>
        </div>
      </div>

      {/* ─────────── Modals ─────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => modal.type === 'error' && setModal(null)}
          />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-card border border-border rounded-xl shadow-2xl p-6 space-y-5 text-center">
            {modal.type === 'success' ? (
              <>
                <CheckCircle2
                  size={52}
                  className="mx-auto text-emerald-500"
                  strokeWidth={1.5}
                />
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-foreground">Pedido lançado!</h2>
                  <p className="text-sm text-muted-foreground">{modal.message}</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/pedidos')}
                  >
                    Ver pedidos
                  </Button>
                  <Button
                    onClick={handleNewOrder}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Novo pedido
                  </Button>
                </div>
              </>
            ) : (
              <>
                <AlertCircle
                  size={52}
                  className="mx-auto text-destructive"
                  strokeWidth={1.5}
                />
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-foreground">Erro ao lançar pedido</h2>
                  <p className="text-sm text-muted-foreground">{modal.message}</p>
                </div>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setModal(null)}
                >
                  Fechar
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
