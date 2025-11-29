import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Check if session exists and has capacity
    const groupSession = await prisma.groupSession.findUnique({
      where: { id: sessionId },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    })

    if (!groupSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const spotsLeft = groupSession.maxCapacity - (groupSession._count?.participants ?? 0)
    if (spotsLeft <= 0) {
      return NextResponse.json({ error: 'Session is full' }, { status: 400 })
    }

    // Check if user already joined
    const existingParticipation = await prisma.groupSessionParticipant.findUnique({
      where: {
        userId_groupSessionId: {
          userId: session.user.id,
          groupSessionId: sessionId,
        },
      },
    })

    if (existingParticipation) {
      return NextResponse.json({ message: 'Already joined' }, { status: 200 })
    }

    // Join session
    await prisma.groupSessionParticipant.create({
      data: {
        userId: session.user.id,
        groupSessionId: sessionId,
      },
    })

    return NextResponse.json({ message: 'Joined successfully' }, { status: 200 })
  } catch (error) {
    console.error('Join session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
