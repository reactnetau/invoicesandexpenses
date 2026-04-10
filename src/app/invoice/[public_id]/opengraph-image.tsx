import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

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

function getStatusStyles(status: string, dueDate: Date) {
  const isPaid = status === 'paid'
  const isOverdue = !isPaid && new Date(dueDate) < new Date()

  if (isPaid) {
    return {
      label: 'PAID',
      bg: '#DCFCE7',
      text: '#166534',
      accent: '#22C55E',
    }
  }

  if (isOverdue) {
    return {
      label: 'OVERDUE',
      bg: '#FEE2E2',
      text: '#991B1B',
      accent: '#EF4444',
    }
  }

  return {
    label: 'OPEN',
    bg: '#FEF3C7',
    text: '#92400E',
    accent: '#F59E0B',
  }
}

export default async function Image({ params }: Props) {
  const { public_id } = await params
  const invoice = await getPublicInvoice(public_id)

  if (!invoice) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 56,
            fontWeight: 700,
          }}
        >
          Invoice not found
        </div>
      ),
      size
    )
  }

  const amount = formatAmount(parseFloat(invoice.amount.toString()))
  const dueDate = formatDueDate(invoice.due_date)
  const status = getStatusStyles(invoice.status, invoice.due_date)

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 40%, #F8FAFC 100%)',
          position: 'relative',
          padding: 48,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 30%), radial-gradient(circle at bottom left, rgba(16,185,129,0.14), transparent 35%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 48,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: 30,
            borderRadius: 32,
            background: 'rgba(255,255,255,0.88)',
            border: '1px solid rgba(148,163,184,0.24)',
            boxShadow: '0 20px 70px rgba(15,23,42,0.12)',
            padding: 40,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.03em' }}>
                Schmapps Invoice Tracker
              </div>
              <div style={{ fontSize: 20, color: '#64748B', marginTop: 6 }}>
                Secure invoice preview
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 18px',
                borderRadius: 999,
                background: status.bg,
                color: status.text,
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '0.08em',
              }}
            >
              {status.label}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 26, fontWeight: 600, color: '#475569' }}>Amount due</div>
            <div style={{ fontSize: 78, fontWeight: 800, color: '#020617', letterSpacing: '-0.05em' }}>
              {amount}
            </div>

            <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: status.accent,
                }}
              />
              <div style={{ fontSize: 30, color: '#0F172A', fontWeight: 600 }}>
                {invoice.client_name}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '1px solid #E2E8F0',
              paddingTop: 22,
              marginTop: 'auto',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 18, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Due date
              </div>
              <div style={{ fontSize: 30, color: '#0F172A', fontWeight: 700 }}>
                {dueDate}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, maxWidth: 260 }}>
              <div style={{ fontSize: 18, color: '#64748B', textAlign: 'right' }}>Open secure link to view invoice</div>
              <div style={{ fontSize: 20, color: '#2563EB', fontWeight: 700, textAlign: 'right' }}>
                invoicesandexpenses.com
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  )
}
