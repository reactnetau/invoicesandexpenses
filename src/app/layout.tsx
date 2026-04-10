import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

function getMetadataBase() {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (!rawUrl) {
    return new URL('http://localhost:3000')
  }

  const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
  return new URL(normalizedUrl)
}

const metadataBase = getMetadataBase()

export const metadata: Metadata = {
  metadataBase,
  title: 'Invoice & Expense Tracker',
  description: 'Simple invoice and expense tracking for freelancers',
  openGraph: {
    title: 'Invoice & Expense Tracker',
    description: 'Simple invoice and expense tracking for freelancers',
    siteName: 'Invoice Tracker',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Invoice Tracker preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invoice & Expense Tracker',
    description: 'Simple invoice and expense tracking for freelancers',
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
