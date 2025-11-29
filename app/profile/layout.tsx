import { AppNav } from '@/components/app-nav'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warmBeige via-lightTeal/10 to-softBlue/10">
      <AppNav />
      <main>{children}</main>
    </div>
  )
}
