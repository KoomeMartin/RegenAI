'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Heart, MessageCircle, Users, ClipboardList, Building2, User, LogOut, Video, Bell, TrendingUp, BookOpen } from 'lucide-react'
import { Avatar } from './avatar-selector'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Heart },
  { href: '/ai-support', label: 'TalkSafe', icon: MessageCircle },
  { href: '/group-sessions', label: 'Circle', icon: Users },
  { href: '/therapy', label: 'Therapy', icon: Video },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/assessments', label: 'Assessments', icon: ClipboardList },
  { href: '/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/referrals', label: 'Referrals', icon: Building2 },
  { href: '/profile', label: 'Profile', icon: User },
]

export function AppNav() {
  const pathname = usePathname()
  const { data: session } = useSession() || {}
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Fetch unread notifications count
    if (session?.user) {
      fetch('/api/notifications/unread-count')
        .then(res => res.json())
        .then(data => setUnreadCount(data.count || 0))
        .catch(() => setUnreadCount(0))
    }
  }, [session])

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-teal" />
            <span className="font-bold text-darkTeal hidden md:block">SafeSpace</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 md:gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-teal text-white'
                      : 'text-gray-700 hover:bg-lightTeal/30'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium hidden lg:block">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Link href="/notifications" className="relative p-2 text-gray-700 hover:text-teal transition-colors">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {session?.user && (
              <div className="flex items-center gap-2">
                <Avatar avatarId={(session as any)?.user?.avatar ?? 'avatar1'} size="sm" />
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {(session as any)?.user?.alias}
                </span>
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 text-gray-700 hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
