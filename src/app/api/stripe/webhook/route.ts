import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (!userId) break

      await prisma.user.update({
        where: { id: userId },
        data: {
          stripe_customer_id: session.customer as string,
          subscription_status: 'active',
        },
      })
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      if (!invoice.customer) break

      const periodEnd = invoice.period_end ? new Date(invoice.period_end * 1000) : null

      // Never override founding members' subscription status
      await prisma.user.updateMany({
        where: {
          stripe_customer_id: invoice.customer as string,
          is_founding_member: false,
        },
        data: {
          subscription_status: 'active',
          ...(periodEnd ? { subscription_end_date: periodEnd } : {}),
        },
      })
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      // Never deactivate founding members
      await prisma.user.updateMany({
        where: {
          stripe_customer_id: subscription.customer as string,
          is_founding_member: false,
        },
        data: { subscription_status: 'inactive' },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
