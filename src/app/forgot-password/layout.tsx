import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset your password',
  description: 'Reset your Schmapps Invoice Tracker password.',
  robots: { index: false, follow: false },
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
