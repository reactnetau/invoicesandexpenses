import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // Always return success to avoid leaking whether an email exists
  if (!user) {
    return NextResponse.json({ ok: true })
  }

  // Invalidate any existing tokens for this user
  await prisma.passwordReset.updateMany({
    where: { user_id: user.id, used: false },
    data: { used: true },
  })

  const token = randomBytes(32).toString('hex')
  const expires_at = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.passwordReset.create({
    data: { user_id: user.id, token, expires_at },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const resetUrl = `${appUrl}/reset-password?token=${token}`

  try {
    await sendPasswordResetEmail(email, resetUrl)
  } catch (err) {
    console.error('[forgot-password] email failed:', err)
    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
