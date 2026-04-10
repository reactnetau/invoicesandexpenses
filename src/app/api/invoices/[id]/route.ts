import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const invoice = await prisma.invoice.findFirst({
    where: { id, user_id: session.userId },
  })

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: 'paid', paid_at: new Date() },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const invoice = await prisma.invoice.findFirst({
    where: { id, user_id: session.userId },
  })

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.invoice.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
