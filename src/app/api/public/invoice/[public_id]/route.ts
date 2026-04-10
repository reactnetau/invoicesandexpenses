import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ public_id: string }> }) {
  const { public_id } = await params

  const invoice = await prisma.invoice.findFirst({
    where: { public_id, is_public: true },
    select: {
      client_name: true,
      amount: true,
      due_date: true,
      status: true,
    },
  })

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(invoice)
}
