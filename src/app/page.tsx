import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const FOUNDING_MEMBER_LIMIT = 50

export default async function Home() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  const totalUsers = await prisma.user.count()
  const spotsRemaining = Math.max(0, FOUNDING_MEMBER_LIMIT - totalUsers)
  const isFull = spotsRemaining === 0

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Nav */}
      <header className="border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-slate-900 text-sm tracking-tight">Invoice Tracker</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">

          {/* Founding member badge */}
          {!isFull && (
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {spotsRemaining} founding member spot{spotsRemaining === 1 ? '' : 's'} remaining — free for life
            </div>
          )}

          <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-5">
            Track your income without<br className="hidden sm:block" /> the accounting headache
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 mb-10 max-w-xl mx-auto">
            Simple invoices, expenses, and profit tracking — built for freelancers and contractors who just want to get paid.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
            >
              {isFull ? 'Get started for free' : 'Claim your spot — it\'s free'}
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-sm text-slate-500 hover:text-slate-800 px-6 py-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-3 text-xs text-slate-400">No credit card required.</p>
        </section>

        {/* ── FOUNDING MEMBER OFFER ── */}
        {!isFull ? (
          <section className="max-w-2xl mx-auto px-4 pb-16">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
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
        ) : (
          <section className="max-w-2xl mx-auto px-4 pb-16">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-600 text-center">
              Founding member spots are all claimed. Sign up free (5 invoices/month) or go Pro for $7/month.
            </div>
          </section>
        )}

        {/* ── FEATURES ── */}
        <section className="bg-slate-50 border-y border-slate-100 py-20">
          <div className="max-w-5xl mx-auto px-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-3">Everything you need</p>
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
                <div key={f.title} className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="text-2xl mb-3">{f.icon}</div>
                  <h3 className="text-sm font-bold text-slate-800 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF ── */}
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

        {/* ── PRICING ── */}
        <section className="bg-slate-50 border-y border-slate-100 py-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-12">Simple, honest pricing</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              {/* Free */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
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
              <div className="bg-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  Most popular
                </div>
                <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-1">Pro</p>
                <p className="text-3xl font-bold mb-1">$7<span className="text-base font-normal text-blue-300">/mo</span></p>
                <p className="text-xs text-blue-300 mb-5">Cancel anytime</p>
                <ul className="space-y-2 text-sm text-blue-50">
                  {['Unlimited invoices', 'Unlimited expenses', 'CSV export', 'Public invoice links', 'Profit dashboard'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-blue-200">✓</span> {item}
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
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-3.5 rounded-xl text-sm transition-colors"
          >
            Get started for free
          </Link>
          <p className="mt-3 text-xs text-slate-400">No credit card required. Free plan available forever.</p>
        </section>

      </main>

      <footer className="border-t border-slate-100 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-600">Invoice Tracker</span>
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
