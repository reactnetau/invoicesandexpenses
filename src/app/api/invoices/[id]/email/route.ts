import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { generateInvoicePdf } from '@/lib/invoice-pdf'
import { sendInvoiceEmail } from '@/lib/email'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const invoice = await prisma.invoice.findFirst({
    where: { id, user_id: session.userId },
  })

  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  if (!invoice.client_email) {
    return NextResponse.json({ error: 'This invoice has no client email address' }, { status: 400 })
  }

  try {
    const pdfBuffer = await generateInvoicePdf({
      clientName: invoice.client_name,
      clientEmail: invoice.client_email,
      amount: Number(invoice.amount),
      dueDate: invoice.due_date,
      publicId: invoice.public_id,
      status: invoice.status,
    })

    await sendInvoiceEmail({
      to: invoice.client_email,
      clientName: invoice.client_name,
      amount: Number(invoice.amount),
      dueDate: invoice.due_date,
      publicId: invoice.public_id,
      pdfBuffer,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[invoices/email]', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
