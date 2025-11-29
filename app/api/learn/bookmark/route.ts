import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { Session } from 'next-auth'
import '@/types/next-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contentId, notes } = body

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID required' }, { status: 400 })
    }

    // Check if already bookmarked
    const existing = await prisma.educationBookmark.findUnique({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId,
        },
      },
    })

    if (existing) {
      // Remove bookmark
      await prisma.educationBookmark.delete({
        where: { id: existing.id },
      })
      return NextResponse.json({ bookmarked: false })
    } else {
      // Add bookmark
      await prisma.educationBookmark.create({
        data: {
          userId: session.user.id,
          contentId,
          notes: notes || null,
        },
      })
      return NextResponse.json({ bookmarked: true })
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
