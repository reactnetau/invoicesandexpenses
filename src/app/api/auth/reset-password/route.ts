import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()

  if (!token || !password) {
    return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const reset = await prisma.passwordReset.findUnique({ where: { token } })

  if (!reset || reset.used || reset.expires_at < new Date()) {
    return NextResponse.json({ error: 'This link is invalid or has expired' }, { status: 400 })
  }

  const password_hash = await bcrypt.hash(password, 10)

  await Promise.all([
    prisma.user.update({
      where: { id: reset.user_id },
      data: { password_hash },
    }),
    prisma.passwordReset.update({
      where: { token },
      data: { used: true },
    }),
  ])

  return NextResponse.json({ ok: true })
}
