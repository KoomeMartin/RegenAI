import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { JoinSessionForm } from '@/components/join-session-form'
import { Calendar, Clock, Users, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function JoinSessionPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  const groupSession = await prisma.groupSession.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: { participants: true },
      },
    },
  })

  if (!groupSession) {
    redirect('/group-sessions')
  }

  // Check if user already joined
  const existingParticipation = await prisma.groupSessionParticipant.findUnique({
    where: {
      userId_groupSessionId: {
        userId: session.user.id,
        groupSessionId: params.id,
      },
    },
  })

  if (existingParticipation) {
    redirect(`/group-sessions/${params.id}`)
  }

  const spotsLeft = groupSession.maxCapacity - (groupSession._count?.participants ?? 0)
  const isFull = spotsLeft <= 0

  if (isFull) {
    redirect('/group-sessions')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-darkTeal mb-6">Join Group Session</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{groupSession.title}</h2>
          <p className="text-gray-600 mb-4">{groupSession.description}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-teal" />
              <span>
                {new Date(groupSession.scheduledAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-teal" />
              <span>{groupSession.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4 text-teal" />
              <span>{spotsLeft} spots remaining</span>
            </div>
          </div>
        </div>

        {/* Guidelines */}
        {groupSession.guidelines && (
          <div className="bg-lightTeal/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-darkTeal mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Session Guidelines
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{groupSession.guidelines}</p>
          </div>
        )}

        <JoinSessionForm sessionId={params.id} userId={session.user.id} />
      </div>
    </div>
  )
}
