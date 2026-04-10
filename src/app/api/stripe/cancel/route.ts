import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { getSession } from '@/lib/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { stripe_customer_id: true },
  })
  if (!user || !user.stripe_customer_id) {
    return NextResponse.json({ error: 'No Stripe customer found' }, { status: 400 })
  }

  // Find active subscription
  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripe_customer_id,
    status: 'active',
    limit: 1,
  })
  const subscription = subscriptions.data[0]
  if (!subscription) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
  }

  // Cancel subscription at period end
  await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true })

  await prisma.user.update({
    where: { id: session.userId },
    data: { subscription_status: 'cancelling' },
  })

  return NextResponse.json({ ok: true })
}
