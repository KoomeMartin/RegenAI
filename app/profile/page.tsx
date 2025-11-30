import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Avatar } from '@/components/avatar-selector'
import { JournalSection } from '@/components/journal-section'
import { User, Calendar, BookOpen, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      journals: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      _count: {
        select: {
          aiSessions: true,
          assessmentResponses: true,
          groupSessionParticipants: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-darkTeal mb-2">Your Profile</h1>
        <p className="text-gray-600">Manage your account and track your journey</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="md:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <div className="flex flex-col items-center mb-6">
              <Avatar avatarId={user.avatar} size="lg" />
              <h2 className="text-2xl font-bold text-darkTeal mt-4">{user.alias}</h2>
              <p className="text-sm text-gray-600">Profile</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="bg-teal/10 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-teal" />
                </div>
                <div>
                  <p className="text-gray-600">Member Since</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="bg-softBlue/10 p-2 rounded-lg">
                  <User className="h-5 w-5 text-softBlue" />
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-semibold text-gray-800 text-xs">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t space-y-3">
              <h3 className="font-bold text-darkTeal mb-3 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Your Journey Stats
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">AI Chat Sessions</span>
                <span className="font-bold text-teal">{user._count?.aiSessions ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Assessments Taken</span>
                <span className="font-bold text-teal">{user._count?.assessmentResponses ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Group Sessions Joined</span>
                <span className="font-bold text-teal">
                  {user._count?.groupSessionParticipants ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Journal Section */}
        <div className="md:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-6 w-6 text-teal" />
              <h2 className="text-xl font-bold text-darkTeal">Personal Journal</h2>
            </div>
            <JournalSection userId={session.user.id} initialJournals={user.journals ?? []} />
          </div>
        </div>
      </div>
    </div>
  )
}
