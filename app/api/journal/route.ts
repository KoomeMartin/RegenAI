import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { Session } from 'next-auth'
import '@/types/next-auth'

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, mood } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 })
    }

    const journal = await prisma.journal.create({
      data: {
        userId: session.user.id,
        title,
        content,
        mood,
      },
    })

    return NextResponse.json({ journal }, { status: 201 })
  } catch (error) {
    console.error('Create journal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, title, content, mood } = await request.json()

    if (!id || !content) {
      return NextResponse.json({ error: 'ID and content required' }, { status: 400 })
    }

    // Verify ownership
    const existing = await prisma.journal.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Journal not found' }, { status: 404 })
    }

    const journal = await prisma.journal.update({
      where: { id },
      data: {
        title,
        content,
        mood,
      },
    })

    return NextResponse.json({ journal }, { status: 200 })
  } catch (error) {
    console.error('Update journal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    // Verify ownership
    const existing = await prisma.journal.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Journal not found' }, { status: 404 })
    }

    await prisma.journal.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Delete journal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
