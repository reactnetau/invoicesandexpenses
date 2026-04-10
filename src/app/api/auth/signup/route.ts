import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

const FOUNDING_MEMBER_LIMIT = 50

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    // Count existing users to determine founding member eligibility
    const userCount = await prisma.user.count()
    const isFoundingMember = userCount < FOUNDING_MEMBER_LIMIT

    const password_hash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        is_founding_member: isFoundingMember,
        // Founding members get permanent Pro — no Stripe needed
        subscription_status: isFoundingMember ? 'active' : 'inactive',
      },
    })

    const token = await signToken({ userId: user.id, email: user.email })

    const res = NextResponse.json({ ok: true, is_founding_member: isFoundingMember })
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  } catch (error) {
    console.error('Signup failed:', error)
    const err = error as { name?: string; message?: string; code?: string }

    if (error instanceof Error && error.message.includes('JWT_SECRET is not set')) {
      return NextResponse.json({ error: 'Server config error: JWT_SECRET is missing' }, { status: 500 })
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      if (error.message.includes('Environment variable not found: DATABASE_URL')) {
        return NextResponse.json({ error: 'Server config error: DATABASE_URL is missing' }, { status: 500 })
      }
      return NextResponse.json(
        { error: 'Database connection failed. Check DATABASE_URL and Railway Postgres linkage.' },
        { status: 500 }
      )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2021') {
        return NextResponse.json({ error: 'Database tables are missing. Run Prisma migrations.' }, { status: 500 })
      }
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
      }
      if (error.code === 'P1001') {
        return NextResponse.json({ error: 'Cannot reach database server. Check DATABASE_URL.' }, { status: 500 })
      }
      if (error.code === 'P1000') {
        return NextResponse.json({ error: 'Database authentication failed. Check DB credentials.' }, { status: 500 })
      }
      if (error.code === 'P1010') {
        return NextResponse.json({ error: 'Database access denied for this user/schema.' }, { status: 500 })
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json({ error: 'Database query validation failed.' }, { status: 500 })
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
      return NextResponse.json({ error: 'Prisma engine crashed while handling signup.' }, { status: 500 })
    }

    if (typeof err.message === 'string' && err.message.includes('HS256')) {
      return NextResponse.json(
        { error: 'Server config error: JWT_SECRET is invalid for HS256 (use a long random secret).' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: 'Signup failed',
        debug: {
          name: err.name ?? 'UnknownError',
          code: err.code ?? null,
          message: err.message?.slice(0, 200) ?? null,
        },
      },
      { status: 500 }
    )
  }
}
