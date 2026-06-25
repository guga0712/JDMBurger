'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

function LoginForm() {
  const searchParams = useSearchParams()
  const hasError = searchParams.get('error') !== null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    await signIn('credentials', {
      email,
      password,
      callbackUrl: '/dashboard',
      redirect: true,
    })
    setLoading(false)
  }

  return (
    <main className="min-h-[100dvh] flex flex-col md:flex-row bg-background">

      {/* ── Brand panel — desktop only ─────────────────────── */}
      <div className="hidden md:flex md:w-[44%] flex-col justify-between p-12 bg-[#8C1C1C] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-black/25 pointer-events-none" />
        <div className="absolute top-1/3 -left-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-12 right-12 w-16 h-16 rounded-full border border-white/10 pointer-events-none" />

        <div className="relative z-10">
          <span className="text-white/50 text-xs tracking-[0.35em] uppercase font-medium">
            Sistema interno
          </span>
        </div>

        <div className="relative z-10">
          <h1 className="leading-none tracking-tight text-white">
            <span className="block text-[5.5rem] font-black">JDM</span>
            <span className="block text-[3.75rem] font-black text-white/70">BURGER</span>
          </h1>
          <p className="mt-6 text-white/50 text-sm leading-relaxed max-w-[30ch]">
            Plataforma de gestão para atendentes, cozinha e administração.
          </p>
        </div>

        <div className="relative z-10">
          <span className="text-white/25 text-xs">© {new Date().getFullYear()} JDMBurger</span>
        </div>
      </div>

      {/* ── Form panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 py-12">

        {/* Mobile logo */}
        <div className="mb-10 md:hidden space-y-1">
          <span className="text-2xl font-black tracking-tight">
            JDM<span className="text-primary">BURGER</span>
          </span>
          <p className="text-xs text-muted-foreground tracking-[0.25em] uppercase">
            Sistema interno
          </p>
        </div>

        <div className="w-full max-w-sm md:mx-0 mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Entrar no sistema</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Use suas credenciais para acessar
            </p>
          </div>

          {hasError && (
            <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              E-mail ou senha inválidos.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium active:scale-[0.98] transition-all mt-2"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>

    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
