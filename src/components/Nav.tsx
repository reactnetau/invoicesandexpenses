'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSnackbar } from 'notistack'
import ProModal from './ProModal'

interface UserStatus {
  subscription_status: string
  has_stripe_customer: boolean
}

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [user, setUser] = useState<UserStatus | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showProModal, setShowProModal] = useState(false)

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => r.json())
      .then(setUser)
      .catch(() => {})
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

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

  // Listen for modal-triggered upgrade
  useEffect(() => {
    function handleUpgrade() {
      upgrade()
    }
    window.addEventListener('pro-upgrade', handleUpgrade)
    return () => window.removeEventListener('pro-upgrade', handleUpgrade)
  }, [])

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
    { href: '/settings', label: 'Settings' },
    { href: '/account', label: 'Account' },
  ]

  return (
    <>
      <ProModal open={showProModal} onClose={() => setShowProModal(false)} />
      <nav className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/dashboard" className="font-semibold text-slate-800 text-sm">
          Invoice Tracker
        </Link>

        <div className="hidden md:flex items-center gap-1">
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
          {/* Subscribe to Pro button removed from desktop navbar */}

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
            )}

            <button
              onClick={logout}
              className="px-3 py-1.5 rounded text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="md:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
          <div className="flex flex-col gap-1.5">
            <span className={`block h-0.5 w-5 bg-current transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 bg-current transition-opacity ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`block h-0.5 w-5 bg-current transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-slate-100 my-1" />

            {isPro ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold">
                <span>Pro plan</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-xs">Active</span>
              </div>
            ) : null}

            {canManageBilling && (
              <button
                onClick={manageSubscription}
                className="w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left"
              >
                Billing
              </button>
            )}

            <button
              onClick={logout}
              className="w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
    </>
  )
}
