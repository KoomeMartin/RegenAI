import { NextResponse } from 'next/server'
import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { Session } from 'next-auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a therapist
    if (session.user.role !== 'therapist') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const bookings = await prisma.therapyBooking.findMany({
      where: {
        therapistId: session.user.id,
      },
      include: {
        client: {
          select: {
            alias: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Error fetching therapist bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
