import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const expense = await prisma.expense.findFirst({
    where: { id, user_id: session.userId },
  })

  if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.expense.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
