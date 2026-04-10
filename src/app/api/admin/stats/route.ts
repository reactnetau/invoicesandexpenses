import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const FOUNDING_MEMBER_LIMIT = 50

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [total, founding, pro] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { is_founding_member: true } }),
    prisma.user.count({ where: { subscription_status: 'active' } }),
  ])

  return NextResponse.json({
    total_users: total,
    founding_members: founding,
    founding_spots_remaining: Math.max(0, FOUNDING_MEMBER_LIMIT - total),
    founding_spots_filled: total >= FOUNDING_MEMBER_LIMIT,
    pro_users: pro,
  })
}
