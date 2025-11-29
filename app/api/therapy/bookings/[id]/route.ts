import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = params.id
    const body = await request.json()
    const { status, rating, feedback } = body

    // Find booking
    const booking = await prisma.therapyBooking.findUnique({
      where: { id: bookingId },
      include: {
        therapist: {
          select: {
            alias: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check authorization
    if (booking.clientId !== session.user.id && booking.therapistId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update booking
    const updatedBooking = await prisma.therapyBooking.update({
      where: { id: bookingId },
      data: {
        ...(status && { status }),
        ...(rating && { rating: parseInt(rating) }),
        ...(feedback && { feedback }),
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

    // If cancelled, create notification
    if (status === 'cancelled') {
      await prisma.notification.create({
        data: {
          userId: booking.therapistId,
          type: 'booking_cancelled',
          title: 'Session Cancelled',
          message: `A therapy session scheduled for ${new Date(booking.scheduledAt).toLocaleString()} has been cancelled.`,
          actionUrl: '/therapist/dashboard',
          read: false,
        },
      })
    }

    return NextResponse.json({ booking: updatedBooking })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
