import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'


export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a participant
    const participation = await prisma.groupSessionParticipant.findUnique({
      where: {
        userId_groupSessionId: {
          userId: session.user.id,
          groupSessionId: params.id,
        },
      },
    })

    if (!participation) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
    }

    // Get messages
    const messages = await prisma.groupMessage.findMany({
      where: { groupSessionId: params.id },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      userId: msg.userId,
      userAlias: msg.user?.alias,
      userAvatar: msg.user?.avatar,
      createdAt: msg.createdAt,
      isFlagged: msg.isFlagged,
    }))

    return NextResponse.json({ messages: formattedMessages }, { status: 200 })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a participant
    const participation = await prisma.groupSessionParticipant.findUnique({
      where: {
        userId_groupSessionId: {
          userId: session.user.id,
          groupSessionId: params.id,
        },
      },
    })

    if (!participation) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
    }

    const { content } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 })
    }

    // Simple moderation - flag certain keywords
    const inappropriateKeywords = ['spam', 'advertisement']
    const isFlagged = inappropriateKeywords.some((keyword) =>
      content.toLowerCase().includes(keyword)
    )

    // Create message
    const message = await prisma.groupMessage.create({
      data: {
        groupSessionId: params.id,
        userId: session.user.id,
        content,
        isFlagged,
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json(
      {
        message: {
          id: message.id,
          content: message.content,
          userId: message.userId,
          userAlias: message.user?.alias,
          userAvatar: message.user?.avatar,
          createdAt: message.createdAt,
          isFlagged: message.isFlagged,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
