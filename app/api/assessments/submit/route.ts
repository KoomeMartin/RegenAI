import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function calculatePHQ9Severity(score: number): string {
  if (score < 5) return 'minimal'
  if (score < 10) return 'mild'
  if (score < 15) return 'moderate'
  if (score < 20) return 'moderately severe'
  return 'severe'
}

function calculateGAD7Severity(score: number): string {
  if (score < 5) return 'minimal'
  if (score < 10) return 'mild'
  if (score < 15) return 'moderate'
  return 'severe'
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const userId = (session as any)?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { assessmentId, answers } = await request.json()

    if (!assessmentId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get assessment
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    })

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Calculate score based on assessment type
    let score: number | null = null
    let severity: string | null = null

    if (assessment.type === 'PHQ9' || assessment.type === 'GAD7') {
      // Sum up all answer values
      score = Object.values(answers).reduce((sum: number, val) => sum + (val as number), 0)
      severity =
        assessment.type === 'PHQ9'
          ? calculatePHQ9Severity(score)
          : calculateGAD7Severity(score)
    } else if (assessment.type === 'MOOD_CHECKIN') {
      // Average the mood scores
      const values = Object.values(answers) as number[]
      score = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
      
      if (score < 4) severity = 'low'
      else if (score < 7) severity = 'moderate'
      else severity = 'good'
    }

    // Save response
    const response = await prisma.assessmentResponse.create({
      data: {
        userId,
        assessmentId,
        answers,
        score,
        severity,
      },
    })

    return NextResponse.json(
      {
        message: 'Assessment submitted successfully',
        response: {
          id: response.id,
          score,
          severity,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Submit assessment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
