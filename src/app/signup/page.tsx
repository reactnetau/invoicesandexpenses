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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
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
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Re-enter password"
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !passwordsMatch}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
