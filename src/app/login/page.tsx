'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'

export default function LoginPage() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      enqueueSnackbar(data.error ?? 'Login failed', { variant: 'error' })
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden lg:block px-4">
          <p className="theme-kicker mb-5">Welcome back</p>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 leading-tight">Sign in and get a calm view of your business money.</h1>
          <p className="mt-5 max-w-lg text-base text-slate-600">Invoices, expenses, and profit tracking in one place, without the clutter of traditional accounting software.</p>
        </div>

        <div className="theme-panel w-full max-w-md justify-self-center px-6 py-7 sm:px-8 sm:py-9">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Sign in</h1>
        <p className="text-slate-500 text-sm mb-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="theme-input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="theme-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="theme-button-primary w-full disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        </div>
      </div>
    </div>
  )
}
