import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // If app is running in demo/offline mode, disable signup to avoid DB usage
    if (process.env.USE_PREDEFINED_USERS === 'true') {
      return NextResponse.json(
        { error: 'Signup disabled in demo mode' },
        { status: 403 }
      )
    }
    const body = await request.json()
    const { email, password, alias, avatar } = body

    if (!email || !password || !alias || !avatar) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Check if alias is already taken
    const existingAlias = await prisma.user.findUnique({
      where: { alias },
    })

    if (existingAlias) {
      return NextResponse.json(
        { error: 'Alias already taken' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        alias,
        avatar,
      },
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          alias: user.alias,
          avatar: user.avatar,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
