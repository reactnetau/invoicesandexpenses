import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { generateInvoicePdf } from '@/lib/invoice-pdf'
import { sendInvoiceEmail } from '@/lib/email'
import { decrypt } from '@/lib/crypto'

interface Fields {
  business_name?: boolean
  full_name?: boolean
  phone?: boolean
  address?: boolean
  abn?: boolean
  payid?: boolean
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const fields: Fields = body.fields ?? {}

  const [invoice, user] = await Promise.all([
    prisma.invoice.findFirst({ where: { id, user_id: session.userId } }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { payid_encrypted: true, business_name: true, full_name: true, phone: true, address: true, abn: true },
    }),
  ])

  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  if (!invoice.client_email) {
    return NextResponse.json({ error: 'This invoice has no client email address' }, { status: 400 })
  }

  let payid: string | null = null
  if (fields.payid && user?.payid_encrypted) {
    try { payid = decrypt(user.payid_encrypted) } catch { payid = null }
  }

  try {
    const pdfBuffer = await generateInvoicePdf({
      clientName: invoice.client_name,
      clientEmail: invoice.client_email,
      amount: Number(invoice.amount),
      dueDate: invoice.due_date,
      publicId: invoice.public_id,
      status: invoice.status,
      payid,
      businessName: fields.business_name ? user?.business_name : null,
      fullName: fields.full_name ? user?.full_name : null,
      phone: fields.phone ? user?.phone : null,
      address: fields.address ? user?.address : null,
      abn: fields.abn ? user?.abn : null,
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
