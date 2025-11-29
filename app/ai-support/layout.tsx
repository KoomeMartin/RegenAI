import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppNav } from '@/components/app-nav'

export default async function AISupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warmBeige via-lightTeal/10 to-softBlue/10">
      <AppNav />
      <main>{children}</main>
    </div>
  )
}
