import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      subscription_status: true,
      subscription_end_date: true,
      stripe_customer_id: true,
    },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    email: user.email,
    subscription_status: user.subscription_status,
    subscription_end_date: user.subscription_end_date,
    has_stripe_customer: !!user.stripe_customer_id,
  })
}
