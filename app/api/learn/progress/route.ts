import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { Session } from 'next-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contentId, progress, completed } = body

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID required' }, { status: 400 })
    }

    const updatedProgress = await prisma.educationProgress.upsert({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId,
        },
      },
      update: {
        progress: progress || 100,
        completed: completed !== undefined ? completed : true,
        lastViewed: new Date(),
      },
      create: {
        userId: session.user.id,
        contentId,
        progress: progress || 100,
        completed: completed !== undefined ? completed : true,
      },
    })

    return NextResponse.json({ progress: updatedProgress })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
