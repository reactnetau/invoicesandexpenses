'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSnackbar } from 'notistack'

interface UserStatus {
  subscription_status: string
  has_stripe_customer: boolean
}

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [user, setUser] = useState<UserStatus | null>(null)

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => r.json())
      .then(setUser)
      .catch(() => {})
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  async function upgrade() {
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      enqueueSnackbar(data.error ?? 'Failed to start checkout', { variant: 'error' })
      return
    }
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  async function manageSubscription() {
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      enqueueSnackbar(data.error ?? 'Failed to open billing portal', { variant: 'error' })
      return
    }
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  const isPro = user?.subscription_status === 'active'
  const canManageBilling = isPro && user?.has_stripe_customer

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/invoices', label: 'Invoices' },
    { href: '/expenses', label: 'Expenses' },
    { href: '/clients', label: 'Clients' },
  ]

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/dashboard" className="font-semibold text-slate-800 text-sm">
          Invoice Tracker
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="ml-3 flex items-center gap-2">
            {isPro ? (
              <>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  Pro
                </span>
                {canManageBilling && (
                  <button
                    onClick={manageSubscription}
                    className="px-3 py-1.5 rounded text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    Billing
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={upgrade}
                className="px-3 py-1.5 rounded text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Upgrade to Pro
              </button>
            )}

            <button
              onClick={logout}
              className="px-3 py-1.5 rounded text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
