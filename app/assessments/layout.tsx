import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { AppNav } from '@/components/app-nav'

export default async function AssessmentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No auth required in demo mode; keep AppNav and render children

  return (
    <div className="min-h-screen bg-gradient-to-br from-warmBeige via-lightTeal/10 to-softBlue/10">
      <AppNav />
      <main>{children}</main>
    </div>
  )
}
