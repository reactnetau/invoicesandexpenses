import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MarketingNav from '@/components/MarketingNav'
import type { Metadata } from 'next'
import { getAppUrl } from '@/lib/app-url'
import schmappsLogo from '@/assets/schmappslogo.png'

export const metadata: Metadata = {
  title: 'Schmapps Invoice Tracker — Free Invoicing & Expense Tracking for Freelancers',
  description: 'Create professional invoices, track expenses, and see your profit instantly. Free invoicing software built for freelancers and contractors. No accounting knowledge needed.',
  alternates: {
    canonical: getAppUrl(),
  },
}


const FOUNDING_MEMBER_LIMIT = 50
const SHOW_FOUNDING_MEMBERS = process.env.NEXT_PUBLIC_FOUNDING_MEMBERS === 'true';

export default async function Home() {
  const session = await getSession()
  if (session) redirect('/dashboard')


  const totalUsers = SHOW_FOUNDING_MEMBERS ? await prisma.user.count() : 0;
  const spotsRemaining = SHOW_FOUNDING_MEMBERS ? Math.max(0, FOUNDING_MEMBER_LIMIT - totalUsers) : 0;
  const isFull = SHOW_FOUNDING_MEMBERS ? spotsRemaining === 0 : true;

  const appUrl = getAppUrl()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${appUrl}/#website`,
        url: appUrl,
        name: 'Schmapps Invoice Tracker',
        description: 'Free invoicing and expense tracking for freelancers and contractors',
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Schmapps Invoice Tracker',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: [
          {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            name: 'Free Plan',
            description: 'Up to 5 invoices per month, unlimited expenses',
          },
          {
            '@type': 'Offer',
            price: '7',
            priceCurrency: 'USD',
            name: 'Pro Plan',
            description: 'Unlimited invoices, CSV export, AI summary',
          },
        ],
        description: 'Simple invoice and expense tracking for freelancers and contractors. Create invoices, track expenses, and see your profit instantly.',
        url: appUrl,
        featureList: [
          'Create and send professional invoices',
          'Track business expenses by category',
          'Real-time profit dashboard',
          'PDF invoice generation',
          'CSV export',
          'AI financial summary',
          'Public invoice links',
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is Schmapps Invoice Tracker free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. The free plan lets you create up to 5 invoices per month with unlimited expense tracking. The Pro plan is $7/month for unlimited invoices and CSV export.',
            },
          },
          {
            '@type': 'Question',
            name: 'Who is Schmapps Invoice Tracker for?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Schmapps Invoice Tracker is built for freelancers, contractors, and small business owners who want simple invoicing and expense tracking without complex accounting software.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I send invoices as PDF?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. You can generate and email a PDF invoice directly to your client from the invoices page.',
            },
          },
        ],
      },
    ],
  }

  return (
    <div className="theme-shell flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MarketingNav />

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="max-w-6xl mx-auto px-4 pt-16 pb-16 sm:pt-20">
          <div className="theme-panel overflow-hidden px-6 py-10 sm:px-10 sm:py-14 text-center relative">
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-r from-[rgba(96,165,250,0.12)] via-transparent to-[rgba(34,197,94,0.12)]" />

          {/* Founding member badge */}
          {SHOW_FOUNDING_MEMBERS && !isFull && (
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 relative z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {spotsRemaining} founding member spot{spotsRemaining === 1 ? '' : 's'} remaining — free for life
            </div>
          )}

          <div className="mb-6 flex justify-center relative z-10">
            <div className="inline-flex items-center gap-4 rounded-[28px] border border-white/70 bg-white/82 px-5 py-4 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_12px_24px_rgba(34,197,94,0.14)]">
                <Image
                  src={schmappsLogo}
                  alt="Schmapps logo"
                  className="h-12 w-12 object-contain"
                  priority
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Schmapps</p>
                <p className="text-lg font-semibold text-slate-900">Schmapps Invoice Tracker</p>
              </div>
            </div>
          </div>

          <div className="theme-kicker mb-6 relative z-10">
            Calm money management
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-5 relative z-10">
            Track your income without<br className="hidden sm:block" /> the accounting headache
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto relative z-10">
            Simple invoices, expenses, and profit tracking — built for freelancers and contractors who just want to get paid.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <Link
              href="/signup"
              className="theme-button-primary w-full sm:w-auto px-8"
            >
              {isFull ? 'Get started for free' : 'Claim your spot — it\'s free'}
            </Link>
            <Link
              href="/login"
              className="theme-button-secondary w-full sm:w-auto px-6"
            >
              Sign in
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10 text-left">
            {[
              'Rounded card-based workspace',
              'Income vs expenses at a glance',
              'Human copy, no finance jargon',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/60 bg-white/76 px-4 py-3 text-sm text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                {item}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400 relative z-10">No credit card required.</p>
          </div>
        </section>

        {/* ── FOUNDING MEMBER OFFER ── */}
        {SHOW_FOUNDING_MEMBERS && !isFull ? (
          <section className="max-w-3xl mx-auto px-4 pb-16">
            <div className="theme-card bg-gradient-to-br from-amber-50 to-orange-50 p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm font-bold text-amber-800 mb-1">Founding Member — Free for life</p>
                  <p className="text-sm text-amber-700">
                    The first {FOUNDING_MEMBER_LIMIT} users get full Pro access permanently. No subscription, no credit card. Ever.
                    Only <span className="font-bold">{spotsRemaining} spot{spotsRemaining === 1 ? '' : 's'}</span> left.
                  </p>
                </div>
                <div className="shrink-0 text-center bg-white border border-amber-200 rounded-xl px-4 py-2">
                  <p className="text-2xl font-bold text-amber-600">{spotsRemaining}</p>
                  <p className="text-xs text-amber-500 font-medium">left</p>
                </div>
              </div>
              <div className="flex justify-between text-xs text-amber-600 mb-1">
                <span>{totalUsers} claimed</span>
                <span>{FOUNDING_MEMBER_LIMIT} total</span>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (totalUsers / FOUNDING_MEMBER_LIMIT) * 100)}%` }}
                />
              </div>
            </div>
          </section>
        ) : null}

        {/* ── FEATURES ── */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.24em] text-center mb-3">Everything you need</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12">
              Built for contractors and freelancers
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: '🧾',
                  title: 'Create invoices in seconds',
                  desc: 'Pick a client, set an amount, done. Share a public link directly with your client — no account needed to view it.',
                },
                {
                  icon: '💳',
                  title: 'Track expenses easily',
                  desc: 'Log business expenses by category. Stop losing receipts in your inbox and know exactly what you\'re spending.',
                },
                {
                  icon: '📊',
                  title: 'See your profit instantly',
                  desc: 'Your dashboard shows income, expenses, and net profit the moment you log in. No spreadsheets required.',
                },
              ].map((f) => (
                <div key={f.title} className="theme-card p-6 sm:p-7 bg-white/95">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-2xl">{f.icon}</div>
                  <h3 className="text-sm font-bold text-slate-800 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/*
        ── SOCIAL PROOF ──
        <section className="max-w-5xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                quote: '"I used to send invoices as Word docs. Now I just share a link. My clients actually pay faster."',
                name: 'Jamie R.',
                role: 'Freelance developer',
              },
              {
                quote: '"Took me 10 minutes to set up and I could see exactly how much money I made last month."',
                name: 'Sarah M.',
                role: 'Independent contractor',
              },
              {
                quote: '"Finally something that doesn\'t feel like accounting software. Just simple and it works."',
                name: 'Tom K.',
                role: 'Freelance designer',
              },
            ].map((t) => (
              <div key={t.name} className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{t.quote}</p>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        */}

        {/* ── PRICING ── */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.24em] mb-3">Pricing</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-12">Simple, honest pricing</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              {/* Free */}
              <div className="theme-card p-6 sm:p-7">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Free</p>
                <p className="text-3xl font-bold text-slate-900 mb-1">$0<span className="text-base font-normal text-slate-400">/mo</span></p>
                <p className="text-xs text-slate-400 mb-5">Always free</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  {['Up to 5 invoices/month', 'Unlimited expenses', 'Public invoice links', 'Profit dashboard'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro */}
              <div className="rounded-[28px] p-6 sm:p-7 text-white relative overflow-hidden shadow-[0_18px_45px_rgba(34,197,94,0.2)] bg-[linear-gradient(135deg,#22c55e_0%,#1ea96c_48%,#60a5fa_100%)]">
                <div className="absolute top-3 right-3 bg-white/18 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  Most popular
                </div>
                <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wide mb-1">Pro</p>
                <p className="text-3xl font-bold mb-1">$7<span className="text-base font-normal text-emerald-100/90">/mo</span></p>
                <p className="text-xs text-emerald-100/90 mb-5">Cancel anytime</p>
                <ul className="space-y-2 text-sm text-white/95">
                  {['Unlimited invoices', 'Unlimited expenses', 'CSV export', 'Public invoice links', 'Profit dashboard'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-emerald-100">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="max-w-5xl mx-auto px-4 py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Start tracking your money today
          </h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Join freelancers and contractors who stopped drowning in spreadsheets.
          </p>
          <Link
            href="/signup"
            className="theme-button-primary px-10 py-3.5"
          >
            Get started for free
          </Link>
          <p className="mt-3 text-xs text-slate-400">No credit card required. Free plan available forever.</p>
        </section>

      </main>

      <footer className="border-t border-white/50 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span className="font-semibold text-slate-600">Schmapps Invoice Tracker</span>
          <span>© {new Date().getFullYear()} · Simple invoicing for freelancers</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-slate-600 transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-slate-600 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
