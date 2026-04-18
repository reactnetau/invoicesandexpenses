import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingNav from '@/components/MarketingNav'

export const metadata: Metadata = {
  title: 'Support | Invoices & Expenses',
  description: 'Get help with invoices, expenses, subscriptions, or your account. Contact the Schmapps Invoice Tracker support team.',
}

const SUPPORT_EMAIL = 'polyrhythmm@gmail.com'
const MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Invoices & Expenses support request')}&body=${encodeURIComponent('Hi, I need help with...')}`

export default function SupportPage() {
  return (
    <div className="theme-shell flex flex-col min-h-screen">
      <MarketingNav />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-16 sm:py-24">
        <p className="theme-kicker mb-4">Help &amp; Support</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
          We&apos;re here to help
        </h1>
        <p className="text-slate-500 text-base sm:text-lg mb-10 leading-relaxed">
          Have a question or ran into a problem? Reach out for help with invoices,
          expenses, subscriptions, account issues, or bug reports and we&apos;ll get back
          to you as soon as possible.
        </p>

        <div className="theme-panel px-6 py-8 sm:px-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Email support</h2>
          <p className="text-sm text-slate-500 mb-6">
            Send us an email and we&apos;ll respond within one business day.
          </p>

          <a
            href={MAILTO}
            className="theme-button-primary inline-block w-full sm:w-auto text-center"
          >
            Email support
          </a>

          <p className="mt-5 text-sm text-slate-400">
            If the button does not open your email app, email us directly at{' '}
            <a
              href={MAILTO}
              className="text-blue-600 hover:underline break-all"
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </div>

        <div className="mt-8 text-sm text-slate-400 text-center">
          <Link href="/" className="hover:text-slate-600 transition-colors">
            ← Back to home
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/50 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span className="font-semibold text-slate-600">Schmapps Invoice Tracker</span>
          <span>© {new Date().getFullYear()} · Simple invoicing for freelancers</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-slate-600 transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-slate-600 transition-colors">Sign up</Link>
            <Link href="/support" className="hover:text-slate-600 transition-colors">Support</Link>
            <Link href="/delete-account" className="hover:text-slate-600 transition-colors">Delete account</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
