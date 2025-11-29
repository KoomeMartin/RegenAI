import { NextResponse } from 'next/server'
import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')

    const content = await prisma.educationContent.findMany({
      where: {
        published: true,
        ...(category && category !== 'all' && { category }),
        ...(difficulty && difficulty !== 'all' && { difficulty }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        description: true,
        contentType: true,
        difficulty: true,
        duration: true,
        tags: true,
        thumbnail: true,
        featured: true,
        viewCount: true,
        author: true,
        createdAt: true,
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error fetching educational content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
