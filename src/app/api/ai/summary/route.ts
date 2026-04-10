import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getAI } from '@/lib/anthropic'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Date range: current calendar month ──────────────────────────────────
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const monthName = now.toLocaleString('en-US', { month: 'long' })

  // ── Prisma aggregations — no raw rows sent to AI ────────────────────────
  const [paidInvoices, unpaidInvoices, expenses] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        user_id: session.userId,
        status: 'paid',
        created_at: { gte: startOfMonth, lt: startOfNextMonth },
      },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.invoice.aggregate({
      where: {
        user_id: session.userId,
        status: 'unpaid',
        created_at: { gte: startOfMonth, lt: startOfNextMonth },
      },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.expense.aggregate({
      where: {
        user_id: session.userId,
        date: { gte: startOfMonth, lt: startOfNextMonth },
      },
      _sum: { amount: true },
    }),
  ])

  const income = Number(paidInvoices._sum.amount ?? 0)
  const expenseTotal = Number(expenses._sum.amount ?? 0)
  const unpaidTotal = Number(unpaidInvoices._sum.amount ?? 0)

  const metrics = {
    month: monthName,
    income,
    expenses: expenseTotal,
    profit: income - expenseTotal,
    unpaid_invoices: unpaidInvoices._count._all,
    unpaid_total: unpaidTotal,
  }

  // ── Call Claude — only aggregated metrics, never raw records ────────────
  let summary = ''
  try {
    const response = await getAI().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [
        {
          role: 'user',
          content:
            `You are a helpful financial assistant. Summarise this monthly data in 2 short sentences. Be clear and concise.\n\n${JSON.stringify(metrics)}`,
        },
      ],
    })

    const block = response.content[0]
    summary = block.type === 'text' ? block.text.trim() : ''
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[ai/summary]', message)
    return NextResponse.json({ error: message, data: metrics }, { status: 502 })
  }

  return NextResponse.json({ summary, data: metrics })
}
