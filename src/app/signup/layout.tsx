import type { Metadata } from 'next'
import { getAppUrl } from '@/lib/app-url'

export const metadata: Metadata = {
  title: 'Create your free account',
  description: 'Sign up for Invoice Tracker — free invoicing and expense tracking for freelancers and contractors. No credit card required.',
  alternates: { canonical: `${getAppUrl()}/signup` },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
