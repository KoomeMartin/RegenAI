import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tracking = await prisma.referralTracking.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        referral: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ tracking })
  } catch (error) {
    console.error('Error fetching referral tracking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { referralId, status, notes } = body

    if (!referralId) {
      return NextResponse.json({ error: 'Missing referralId' }, { status: 400 })
    }

    // Check if tracking already exists
    const existing = await prisma.referralTracking.findUnique({
      where: {
        userId_referralId: {
          userId: session.user.id,
          referralId,
        },
      },
    })

    let tracking
    if (existing) {
      // Update existing tracking
      tracking = await prisma.referralTracking.update({
        where: { id: existing.id },
        data: {
          status: status || existing.status,
          notes: notes || existing.notes,
          ...(status === 'contacted' && !existing.contactedAt && { contactedAt: new Date() }),
          ...(status === 'scheduled' && !existing.scheduledAt && { scheduledAt: new Date() }),
          ...(status === 'completed' && !existing.completedAt && { completedAt: new Date() }),
        },
        include: {
          referral: true,
        },
      })
    } else {
      // Create new tracking
      tracking = await prisma.referralTracking.create({
        data: {
          userId: session.user.id,
          referralId,
          status: status || 'interested',
          notes,
          ...(status === 'contacted' && { contactedAt: new Date() }),
        },
        include: {
          referral: true,
        },
      })
    }

    return NextResponse.json({ tracking }, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error('Error creating/updating referral tracking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
