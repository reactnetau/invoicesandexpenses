import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { FREE_INVOICE_LIMIT, isPro } from '@/lib/stripe'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const invoices = await prisma.invoice.findMany({
    where: { user_id: session.userId },
    orderBy: { created_at: 'desc' },
  })

  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { client_id, client_name, client_email, amount, due_date } = await req.json()

  if (!client_name || !amount || !due_date) {
    return NextResponse.json({ error: 'client_name, amount, and due_date are required' }, { status: 400 })
  }

  // Enforce free tier limit
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscription_status: true },
  })

  if (!isPro(user?.subscription_status ?? '')) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const monthCount = await prisma.invoice.count({
      where: { user_id: session.userId, created_at: { gte: startOfMonth } },
    })

    if (monthCount >= FREE_INVOICE_LIMIT) {
      return NextResponse.json(
        { error: 'limit_reached', message: `Free plan is limited to ${FREE_INVOICE_LIMIT} invoices per month. Upgrade to Pro for unlimited invoices.` },
        { status: 403 }
      )
    }
  }

  const invoice = await prisma.invoice.create({
    data: {
      user_id: session.userId,
      client_id: client_id || null,
      client_name,
      client_email: client_email || null,
      amount,
      due_date: new Date(due_date),
    },
  })

  return NextResponse.json(invoice, { status: 201 })
}
