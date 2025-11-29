import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AIChatInterface } from '@/components/ai-chat-interface'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type AIMessage = {
  role: string
  content: string
  hasCrisisFlag?: boolean
}

export default async function AISupportPage({
  searchParams,
}: {
  searchParams: { session?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  const aiSessions = await prisma.aISession.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  })

  let currentSession = null
  let messages: AIMessage[] = []

  if (searchParams?.session) {
    currentSession = await prisma.aISession.findFirst({
      where: {
        id: searchParams.session,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (currentSession) {
      messages = currentSession.messages?.map((msg: AIMessage) => ({
        role: msg.role,
        content: msg.content,
        hasCrisisFlag: msg.hasCrisisFlag,
      })) ?? []
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <AIChatInterface
        userId={session.user.id}
        sessions={aiSessions ?? []}
        currentSessionId={currentSession?.id ?? null}
        initialMessages={messages}
      />
    </div>
  )
}
