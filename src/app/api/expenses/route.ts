import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const expenses = await prisma.expense.findMany({
    where: { user_id: session.userId },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(expenses)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { category, amount, date } = await req.json()

  if (!category || !amount || !date) {
    return NextResponse.json({ error: 'category, amount, and date are required' }, { status: 400 })
  }

  const expense = await prisma.expense.create({
    data: {
      user_id: session.userId,
      category,
      amount,
      date: new Date(date),
    },
  })

  return NextResponse.json(expense, { status: 201 })
}
