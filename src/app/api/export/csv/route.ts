import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { isPro } from '@/lib/stripe'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscription_status: true },
  })

  if (!isPro(user?.subscription_status ?? '')) {
    return NextResponse.json(
      { error: 'pro_required', message: 'CSV export is a Pro feature. Upgrade to unlock it.' },
      { status: 403 }
    )
  }

  const [invoices, expenses] = await Promise.all([
    prisma.invoice.findMany({
      where: { user_id: session.userId },
      orderBy: { created_at: 'desc' },
    }),
    prisma.expense.findMany({
      where: { user_id: session.userId },
      orderBy: { date: 'desc' },
    }),
  ])

  const lines: string[] = []

  lines.push('INVOICES')
  lines.push('Client Name,Client Email,Amount,Status,Due Date,Paid At,Created At')
  for (const inv of invoices) {
    lines.push(
      [
        `"${inv.client_name}"`,
        `"${inv.client_email ?? ''}"`,
        inv.amount.toString(),
        inv.status,
        inv.due_date.toISOString().split('T')[0],
        inv.paid_at ? inv.paid_at.toISOString().split('T')[0] : '',
        inv.created_at.toISOString().split('T')[0],
      ].join(',')
    )
  }

  lines.push('')
  lines.push('EXPENSES')
  lines.push('Category,Amount,Date,Created At')
  for (const exp of expenses) {
    lines.push(
      [
        `"${exp.category}"`,
        exp.amount.toString(),
        exp.date.toISOString().split('T')[0],
        exp.created_at.toISOString().split('T')[0],
      ].join(',')
    )
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="export.csv"',
    },
  })
}
