import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ public_id: string }>
}

export default async function PublicInvoicePage({ params }: Props) {
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

  if (!invoice) notFound()

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

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
                {fmt(parseFloat(invoice.amount.toString()))}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Due date</p>
              <p className="text-base font-medium text-slate-700">
                {new Date(invoice.due_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
