'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'

export default function SignupPage() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(false)
  const passwordsMatch = password === confirmPassword

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!passwordsMatch) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' })
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, currency }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      enqueueSnackbar(data.error ?? 'Signup failed', { variant: 'error' })
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden lg:block px-4">
          <p className="theme-kicker mb-5">Get started</p>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 leading-tight">Create your account and keep your finances simple.</h1>
          <p className="mt-5 max-w-lg text-base text-slate-600">Large clean inputs, clear hierarchy, and a workspace built to feel helpful instead of stressful.</p>
        </div>

        <div className="theme-panel w-full max-w-md justify-self-center px-6 py-7 sm:px-8 sm:py-9">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Create account</h1>
        <p className="text-slate-500 text-sm mb-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="theme-input bg-white"
            >
              <option value="USD">USD — US Dollar ($)</option>
              <option value="AUD">AUD — Australian Dollar (A$)</option>
              <option value="GBP">GBP — British Pound (£)</option>
              <option value="EUR">EUR — Euro (€)</option>
              <option value="CAD">CAD — Canadian Dollar (C$)</option>
              <option value="NZD">NZD — New Zealand Dollar (NZ$)</option>
              <option value="SGD">SGD — Singapore Dollar (S$)</option>
              <option value="JPY">JPY — Japanese Yen (¥)</option>
              <option value="CHF">CHF — Swiss Franc (CHF)</option>
              <option value="INR">INR — Indian Rupee (₹)</option>
            </select>
          </div>

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
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="theme-input"
              placeholder="Min. 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="theme-input"
              placeholder="Re-enter password"
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !passwordsMatch}
            className="theme-button-primary w-full disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        </div>
      </div>
    </div>
  )
}
