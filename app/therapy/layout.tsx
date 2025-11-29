import { AppNav } from '@/components/app-nav'
import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function TherapyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lightTeal/20 via-white to-softBlue/20">
      <AppNav />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
