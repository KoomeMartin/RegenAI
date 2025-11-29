import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { Session } from 'next-auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    const userId = (session as any)?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookings = await prisma.therapyBooking.findMany({
      where: {
        clientId: userId,
      },
      include: {
        therapist: {
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
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const userId = (session as any)?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { therapistId, sessionType, scheduledAt, duration, clientNotes } = body

    // Validate required fields
    if (!therapistId || !sessionType || !scheduledAt || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if therapist exists and is verified
    const therapist = await prisma.therapistProfile.findFirst({
      where: {
        userId: therapistId,
        verified: true,
      },
    })

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found or not verified' }, { status: 404 })
    }

    // Create booking
    const booking = await prisma.therapyBooking.create({
      data: {
        clientId: userId,
        therapistId,
        sessionType,
        scheduledAt: new Date(scheduledAt),
        duration: parseInt(duration),
        clientNotes: clientNotes || null,
        status: 'scheduled',
      },
      include: {
        therapist: {
          select: {
            alias: true,
            avatar: true,
          },
        },
      },
    })

    // Create notification for booking confirmation
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'booking_confirmed',
        title: 'Therapy Session Confirmed',
        message: `Your session with ${booking.therapist.alias} has been confirmed for ${new Date(scheduledAt).toLocaleString()}.`,
        actionUrl: '/therapy',
        read: false,
      },
    })

    // Create notification for therapist
    await prisma.notification.create({
      data: {
        userId: therapistId,
        type: 'booking_confirmed',
        title: 'New Session Booked',
        message: `A new therapy session has been booked for ${new Date(scheduledAt).toLocaleString()}.`,
        actionUrl: '/therapist/dashboard',
        read: false,
      },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
