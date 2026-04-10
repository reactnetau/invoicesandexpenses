import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { FREE_INVOICE_LIMIT, isPro } from '@/lib/stripe'
import { generateInvoicePdf } from '@/lib/invoice-pdf'
import { sendInvoiceEmail } from '@/lib/email'
import { decrypt } from '@/lib/crypto'

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

  const { client_id, client_name, client_email, amount, due_date, send_email, fields = {} } = await req.json()

  if (!client_name || !amount || !due_date) {
    return NextResponse.json({ error: 'client_name, amount, and due_date are required' }, { status: 400 })
  }

  if (send_email && !client_email) {
    return NextResponse.json({ error: 'Selected client does not have an email address' }, { status: 400 })
  }

  // Enforce free tier limit + fetch profile for email
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscription_status: true, business_name: true, full_name: true, phone: true, address: true, abn: true, payid_encrypted: true },
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

  let email_sent = false
  let email_error: string | null = null

  if (send_email && client_email) {
    try {
      let payid: string | null = null
      if (fields.payid && user?.payid_encrypted) {
        try { payid = decrypt(user.payid_encrypted) } catch { payid = null }
      }

      const pdfBuffer = await generateInvoicePdf({
        clientName: invoice.client_name,
        clientEmail: invoice.client_email,
        amount: parseFloat(invoice.amount.toString()),
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
        to: client_email,
        clientName: invoice.client_name,
        amount: parseFloat(invoice.amount.toString()),
        dueDate: invoice.due_date,
        publicId: invoice.public_id,
        pdfBuffer,
      })

      email_sent = true
    } catch (error) {
      console.error('Failed to send invoice email:', error)
      email_error = error instanceof Error ? error.message : 'Unknown email error'
    }
  }

  return NextResponse.json({ invoice, email_sent, email_error }, { status: 201 })
}
