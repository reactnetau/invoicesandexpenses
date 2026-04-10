import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getAI } from '@/lib/anthropic'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Date range: selected AU financial year (Jul 1 -> Jun 30) ────────────
  const { searchParams } = new URL(req.url)
  const fyStartParam = Number(searchParams.get('fyStart'))
  const now = new Date()
  const currentFyStartYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  const selectedFyStartYear =
    Number.isInteger(fyStartParam) && fyStartParam >= 2000 && fyStartParam <= 2100
      ? fyStartParam
      : currentFyStartYear
  const startOfFinancialYear = new Date(selectedFyStartYear, 6, 1)
  const startOfNextFinancialYear = new Date(selectedFyStartYear + 1, 6, 1)
  const financialYearLabel = `FY ${selectedFyStartYear}/${String(selectedFyStartYear + 1).slice(-2)}`

  // ── Fetch user currency ──────────────────────────────────────────────────
  const userRecord = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { currency: true },
  })
  const currency = userRecord?.currency ?? 'USD'

  // ── Prisma aggregations — no raw rows sent to AI ────────────────────────
  const [paidInvoices, unpaidInvoices, expenses] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        user_id: session.userId,
        status: 'paid',
        created_at: { gte: startOfFinancialYear, lt: startOfNextFinancialYear },
      },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.invoice.aggregate({
      where: {
        user_id: session.userId,
        status: 'unpaid',
        created_at: { gte: startOfFinancialYear, lt: startOfNextFinancialYear },
      },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.expense.aggregate({
      where: {
        user_id: session.userId,
        date: { gte: startOfFinancialYear, lt: startOfNextFinancialYear },
      },
      _sum: { amount: true },
    }),
  ])

  const income = Number(paidInvoices._sum.amount ?? 0)
  const expenseTotal = Number(expenses._sum.amount ?? 0)
  const unpaidTotal = Number(unpaidInvoices._sum.amount ?? 0)

  const metrics = {
    financial_year: financialYearLabel,
    currency,
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
            `You are a helpful financial assistant. Summarise this financial year data in 2 short sentences. Be clear and concise. Always format monetary values using the currency code provided (${currency}) — do not use any other currency symbol.\n\n${JSON.stringify(metrics)}`,
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
