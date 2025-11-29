import { NextResponse } from 'next/server'
import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const therapists = await prisma.therapistProfile.findMany({
      where: {
        verified: true,
      },
      include: {
        user: {
          select: {
            id: true,
            alias: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json({ therapists })
  } catch (error) {
    console.error('Error fetching therapists:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
