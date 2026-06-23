import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { LogoutButton } from '@/components/LogoutButton'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
        <span className="text-lg font-bold">
          JDM<span className="text-primary">Burger</span>
        </span>
        <div className="flex items-center gap-3">
          {session?.user?.nome && (
            <span className="text-sm text-muted-foreground">
              {session.user.nome}
            </span>
          )}
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
