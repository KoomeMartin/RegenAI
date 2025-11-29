import { AppNav } from '@/components/app-nav'

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lightTeal/20 via-white to-softBlue/20">
      <AppNav />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
