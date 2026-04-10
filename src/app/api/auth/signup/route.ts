import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

const FOUNDING_MEMBER_LIMIT = 50

export async function POST(req: NextRequest) {
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
}
