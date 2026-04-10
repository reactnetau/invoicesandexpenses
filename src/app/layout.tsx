import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import { getAppUrl } from '@/lib/app-url'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const APP_URL = getAppUrl()
const SITE_NAME = 'Schmapps Invoice Tracker'
const DEFAULT_TITLE = 'Schmapps Invoice Tracker — Free Invoicing & Expense Tracking for Freelancers'
const DEFAULT_DESCRIPTION = 'Create professional invoices, track expenses, and see your profit instantly. Free invoicing software built for freelancers and contractors. No accounting knowledge needed.'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'invoice tracker',
    'free invoicing software',
    'freelance invoice',
    'expense tracker',
    'invoice generator',
    'small business invoicing',
    'contractor invoicing',
    'profit tracking',
    'freelancer tools',
    'invoice app',
    'send invoice',
    'track expenses',
  ],
  authors: [{ name: 'Schmapps Invoice Tracker' }],
  creator: 'Schmapps Invoice Tracker',
  publisher: 'Schmapps Invoice Tracker',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: APP_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    images: [{
      url: '/opengraph-image',
      width: 1200,
      height: 630,
      alt: 'Schmapps Invoice Tracker — Free invoicing for freelancers',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: APP_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} bg-[var(--app-bg)] text-[var(--ink-strong)] antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
