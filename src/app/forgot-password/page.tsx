'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useSnackbar } from 'notistack'

export default function ForgotPasswordPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      enqueueSnackbar(data.error ?? 'Something went wrong', { variant: 'error' })
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="theme-panel mx-auto w-full max-w-md px-6 py-7 sm:px-8 sm:py-9">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Reset password</h1>

        {sent ? (
          <div className="mt-4">
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-4 mb-6">
              <p className="text-sm font-semibold text-green-800 mb-1">Check your email</p>
              <p className="text-xs text-green-700">
                If an account exists for <span className="font-medium">{email}</span>, we sent a password reset link. It expires in 1 hour.
              </p>
            </div>
            <Link href="/login" className="text-sm text-blue-600 hover:underline">
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <p className="text-slate-500 text-sm mb-6">
              Enter your email and we&apos;ll send you a reset link.
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
              <button
                type="submit"
                disabled={loading}
                className="theme-button-primary w-full disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <p className="mt-4 text-sm text-slate-500">
              <Link href="/login" className="text-blue-600 hover:underline">
                ← Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
