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

    const userId = session.user.id

    // Fetch assessment scores over time
    const assessmentHistory = await prisma.assessmentResponse.findMany({
      where: { userId },
      include: {
        assessment: {
          select: {
            type: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })

    // Fetch journal activity
    const journalCount = await prisma.journal.count({
      where: { userId },
    })

    const recentJournals = await prisma.journal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        mood: true,
        createdAt: true,
      },
    })

    // Fetch AI chat sessions
    const aiSessionCount = await prisma.aISession.count({
      where: { userId },
    })

    const recentAISessions = await prisma.aISession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        title: true,
      },
    })

    // Fetch group session participation
    const groupSessionCount = await prisma.groupSessionParticipant.count({
      where: { userId },
    })

    // Fetch therapy bookings
    const therapyBookings = await prisma.therapyBooking.findMany({
      where: { clientId: userId },
      select: {
        status: true,
        createdAt: true,
        scheduledAt: true,
      },
    })

    // Calculate streaks and consistency
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)

    const recentActivity = await prisma.journal.findMany({
      where: {
        userId,
        createdAt: {
          gte: last30Days,
        },
      },
      select: {
        createdAt: true,
      },
    })

    // Calculate engagement score
    const totalEngagementPoints = journalCount * 2 + aiSessionCount * 3 + groupSessionCount * 5 + therapyBookings.length * 10

    return NextResponse.json({
      overview: {
        journalEntries: journalCount,
        aiSessions: aiSessionCount,
        groupSessions: groupSessionCount,
        therapyBookings: therapyBookings.length,
        totalEngagement: totalEngagementPoints,
      },
      assessmentHistory,
      journalMoodHistory: recentJournals,
      recentAISessions,
      therapyBookings,
      activityLast30Days: recentActivity.length,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
