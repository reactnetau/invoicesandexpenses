'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import schmappsLogo from '@/assets/schmappslogo.png'

export default function MarketingNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <span className="inline-flex items-center gap-3 text-sm font-semibold tracking-tight text-slate-900">
          <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-[0_12px_24px_rgba(34,197,94,0.18)]">
            <Image
              src={schmappsLogo}
              alt="Schmapps logo"
              className="h-8 w-8 object-contain"
              priority
            />
          </span>
          Schmapps Invoice Tracker
        </span>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="theme-button-primary px-4 py-2"
          >
            Get started free
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="md:hidden inline-flex items-center justify-center rounded-2xl border border-white/60 bg-white/80 px-3 py-2 text-slate-700 shadow-sm hover:bg-white transition-colors"
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
        <div className="md:hidden border-t border-white/50 bg-white/85 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-2">
            <Link
              href="/login"
              className="px-4 py-3 rounded-2xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="theme-button-primary"
            >
              Get started free
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
