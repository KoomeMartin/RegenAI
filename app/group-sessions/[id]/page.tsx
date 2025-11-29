import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { GroupChatInterface } from '@/components/group-chat-interface'

export const dynamic = 'force-dynamic'

export default async function GroupSessionChatPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  const userId = (session as any)?.user?.id
  const userAlias = (session as any)?.user?.alias
  const userAvatar = (session as any)?.user?.avatar

  // Check if user is a participant
  const participation = await prisma.groupSessionParticipant.findUnique({
    where: {
      userId_groupSessionId: {
        userId,
        groupSessionId: params.id,
      },
    },
  })

  if (!participation) {
    redirect(`/group-sessions/${params.id}/join`)
  }

  const groupSession = await prisma.groupSession.findUnique({
    where: { id: params.id },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!groupSession) {
    redirect('/group-sessions')
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <GroupChatInterface
        sessionId={params.id}
        session={groupSession}
        userId={userId}
        userAlias={userAlias}
        userAvatar={userAvatar}
      />
    </div>
  )
}
