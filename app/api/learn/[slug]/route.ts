import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { Session } from 'next-auth'
import '@/types/next-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const content = await prisma.educationContent.findUnique({
      where: {
        slug: params.slug,
        published: true,
      },
    })

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.educationContent.update({
      where: { id: content.id },
      data: { viewCount: { increment: 1 } },
    })

    // Get user's progress for this content
    const progress = await prisma.educationProgress.findUnique({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId: content.id,
        },
      },
    })

    // Check if bookmarked
    const bookmark = await prisma.educationBookmark.findUnique({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId: content.id,
        },
      },
    })

    return NextResponse.json({
      content,
      progress,
      isBookmarked: !!bookmark,
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
