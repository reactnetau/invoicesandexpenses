import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ public_id: string }>
}

async function getPublicInvoice(public_id: string) {
  return prisma.invoice.findFirst({
    where: { public_id, is_public: true },
    select: {
      client_name: true,
      amount: true,
      due_date: true,
      status: true,
    },
  })
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function formatDueDate(dueDate: Date) {
  return new Date(dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { public_id } = await params
  const invoice = await getPublicInvoice(public_id)

  if (!invoice) {
    return {
      title: 'Invoice not found',
      description: 'This invoice could not be found.',
    }
  }

  const amount = formatAmount(parseFloat(invoice.amount.toString()))
  const dueDate = formatDueDate(invoice.due_date)
  const statusLabel = invoice.status === 'paid' ? 'Paid' : 'Open'
  const title = `${amount} invoice for ${invoice.client_name}`
  const description = `${statusLabel} invoice due ${dueDate}. View the secure invoice details online.`
  const imageUrl = `/invoice/${public_id}/opengraph-image`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function PublicInvoicePage({ params }: Props) {
  const { public_id } = await params

  const invoice = await getPublicInvoice(public_id)

  if (!invoice) notFound()

  const isPaid = invoice.status === 'paid'
  const isOverdue =
    !isPaid && new Date(invoice.due_date) < new Date()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-lg font-bold text-slate-800">Invoice</h1>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              isPaid
                ? 'bg-green-100 text-green-700'
                : isOverdue
                ? 'bg-red-100 text-red-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Unpaid'}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Billed to</p>
            <p className="text-base font-semibold text-slate-800">{invoice.client_name}</p>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Amount due</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatAmount(parseFloat(invoice.amount.toString()))}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Due date</p>
              <p className="text-base font-medium text-slate-700">
                {formatDueDate(invoice.due_date)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
