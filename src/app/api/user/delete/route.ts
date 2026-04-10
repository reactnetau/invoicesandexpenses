import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Delete user and cascade (clients, invoices, etc.)
  await prisma.user.delete({ where: { id: session.userId } })

  // Clear cookie (if using JWT)
  const res = NextResponse.json({ ok: true })
  res.cookies.set('token', '', { maxAge: 0, path: '/' })
  return res
}
