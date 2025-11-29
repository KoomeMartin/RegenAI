import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Calendar, Users, Clock, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function GroupSessionsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  const now = new Date()

  // Get upcoming sessions
  const upcomingSessions = await prisma.groupSession.findMany({
    where: {
      scheduledAt: { gte: now },
      status: 'scheduled',
    },
    orderBy: { scheduledAt: 'asc' },
    include: {
      _count: {
        select: { participants: true },
      },
    },
  })

  // Get user's joined sessions
  const userParticipations = await prisma.groupSessionParticipant.findMany({
    where: { userId: session.user.id },
    include: {
      groupSession: true,
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-darkTeal mb-2">Group Support Sessions</h1>
        <p className="text-gray-600">Connect with others in a safe, anonymous environment</p>
      </div>

      {/* Session Guidelines */}
      <div className="bg-lightTeal/20 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-bold text-darkTeal mb-3">Community Guidelines</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Be respectful and supportive of others</li>
          <li>• Listen actively and share if you're comfortable</li>
          <li>• Everything shared stays confidential</li>
          <li>• No judgment - everyone's journey is unique</li>
        </ul>
      </div>

      {/* My Joined Sessions */}
      {userParticipations?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-darkTeal mb-4">My Joined Sessions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {userParticipations.map((participation: any) => {
              const isPast = new Date(participation.groupSession.scheduledAt) < now
              return (
                <div
                  key={participation.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-darkTeal">{participation.groupSession.title}</h3>
                      <span className="inline-block px-2 py-1 bg-teal/20 text-teal text-xs rounded mt-2">
                        {participation.groupSession.topic}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {participation.groupSession.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(participation.groupSession.scheduledAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {participation.groupSession.duration} min
                    </span>
                  </div>
                  {!isPast && (
                    <Link
                      href={`/group-sessions/${participation.groupSession.id}`}
                      className="block w-full text-center px-4 py-2 bg-teal text-white rounded-lg hover:bg-darkTeal transition-colors"
                    >
                      Enter Session
                    </Link>
                  )}
                  {isPast && (
                    <div className="text-center text-gray-500 text-sm">Session Ended</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      <div>
        <h2 className="text-xl font-bold text-darkTeal mb-4">Upcoming Sessions</h2>
        {upcomingSessions && upcomingSessions.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSessions.map((session: any) => {
              const spotsLeft = session.maxCapacity - (session._count?.participants ?? 0)
              const isFull = spotsLeft <= 0
              const userJoined = userParticipations.some(
                (p: any) => p.groupSession.id === session.id
              )

              return (
                <div
                  key={session.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-darkTeal text-lg">{session.title}</h3>
                    <span className="inline-block px-2 py-1 bg-softBlue/20 text-softBlue text-xs rounded">
                      {session.topic}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{session.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-teal" />
                      <span>
                        {new Date(session.scheduledAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-teal" />
                      <span>{session.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4 text-teal" />
                      <span>
                        {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                      </span>
                    </div>
                  </div>
                  {userJoined ? (
                    <Link
                      href={`/group-sessions/${session.id}`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-teal text-white rounded-lg hover:bg-darkTeal transition-colors"
                    >
                      Enter Session
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : isFull ? (
                    <button
                      disabled
                      className="w-full px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
                    >
                      Session Full
                    </button>
                  ) : (
                    <Link
                      href={`/group-sessions/${session.id}/join`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-softBlue text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Join Session
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/80 rounded-xl">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No upcoming sessions at the moment</p>
            <p className="text-sm text-gray-500 mt-2">Check back soon for new sessions</p>
          </div>
        )}
      </div>
    </div>
  )
}
