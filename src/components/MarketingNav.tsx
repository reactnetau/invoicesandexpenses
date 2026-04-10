'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function MarketingNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-slate-900 text-sm tracking-tight">Invoice Tracker</span>

        <div className="hidden md:flex items-center gap-3">
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

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="md:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
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
            <Link
              href="/login"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
