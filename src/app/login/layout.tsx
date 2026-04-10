import type { Metadata } from 'next'
import { getAppUrl } from '@/lib/app-url'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to Schmapps Invoice Tracker to manage your invoices, track expenses, and view your profit dashboard.',
  alternates: { canonical: `${getAppUrl()}/login` },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
