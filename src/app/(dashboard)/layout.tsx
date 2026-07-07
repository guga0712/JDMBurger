import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <div className="h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      <Sidebar userName={session?.user?.nome} />
      <main className="flex-1 min-w-0 p-4 md:p-6 overflow-y-auto overflow-x-hidden">{children}</main>
    </div>
  )
}
