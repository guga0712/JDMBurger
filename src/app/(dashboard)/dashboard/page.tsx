import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const papelLabel: Record<string, string> = {
  admin: 'Administrador',
  atendente: 'Atendente',
  cozinha: 'Cozinha',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-foreground">
        Bem-vindo, {session?.user?.nome ?? 'usuário'}!
      </h1>
      <p className="text-sm text-muted-foreground">
        Perfil:{' '}
        <span className="text-foreground font-medium">
          {session?.user?.papel ? papelLabel[session.user.papel] : '—'}
        </span>
      </p>
    </div>
  )
}
