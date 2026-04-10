import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

const FOUNDING_MEMBER_LIMIT = 50

export default async function Image() {
  const totalUsers = await prisma.user.count().catch(() => 0)
  const spotsRemaining = Math.max(0, FOUNDING_MEMBER_LIMIT - totalUsers)
  const isFull = spotsRemaining === 0
  const topBadge = isFull ? 'Simple pricing, no surprises' : `${spotsRemaining} founding spots left`

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 45%, #EFF6FF 100%)',
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
              'radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 28%), radial-gradient(circle at bottom right, rgba(245,158,11,0.14), transparent 32%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            borderRadius: 36,
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(148,163,184,0.2)',
            boxShadow: '0 24px 80px rgba(15,23,42,0.10)',
            padding: 48,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>
                Schmapps Invoice Tracker
              </div>
              <div style={{ fontSize: 22, color: '#64748B', marginTop: 10 }}>
                Invoices, expenses and profit tracking for freelancers
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 18px',
                borderRadius: 999,
                background: isFull ? '#DBEAFE' : '#FEF3C7',
                color: isFull ? '#1D4ED8' : '#92400E',
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {topBadge}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: 76,
                fontWeight: 800,
                color: '#020617',
                lineHeight: 1.02,
                letterSpacing: '-0.05em',
              }}
            >
              <span>Track your income</span>
              <span>without the accounting headache</span>
            </div>
            <div style={{ display: 'flex', fontSize: 30, color: '#475569', maxWidth: 860, lineHeight: 1.35 }}>
              Create invoices in seconds, track expenses, and see your real profit instantly from one clean dashboard.
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '1px solid #E2E8F0',
              paddingTop: 28,
            }}
          >
            <div style={{ display: 'flex', gap: 16 }}>
              {['Public invoice links', 'Expense tracking', 'Profit dashboard'].map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 16px',
                    borderRadius: 999,
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ display: 'flex', fontSize: 18, color: '#64748B' }}>Built for contractors and freelancers</div>
              <div style={{ display: 'flex', fontSize: 26, color: '#0F172A', fontWeight: 800 }}>invoicesandexpenses.com</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  )
}
