'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSnackbar } from 'notistack'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' })
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      enqueueSnackbar(data.error ?? 'Failed to reset password', { variant: 'error' })
      return
    }
    setDone(true)
    setTimeout(() => router.push('/login'), 2500)
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-slate-500 mb-4">Invalid or missing reset link.</p>
        <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm">
          Request a new one
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">New password</h1>

      {done ? (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-4">
          <p className="text-sm font-semibold text-green-800 mb-1">Password updated</p>
          <p className="text-xs text-green-700">Redirecting you to sign in…</p>
        </div>
      ) : (
        <>
          <p className="text-slate-500 text-sm mb-6">Choose a new password for your account.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Saving…' : 'Set new password'}
            </button>
          </form>
        </>
      )}
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
