'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const subject = encodeURIComponent('Account Deletion Request – Schmapps Invoice Tracker')
    const body = encodeURIComponent(
      `I would like to request the deletion of my Schmapps Invoice Tracker account.\n\nAccount email: ${email}\n\nReason: ${reason || 'No reason provided.'}\n\nI understand that this will permanently delete all my data including invoices, expenses, and client records.`
    )

    window.location.href = `mailto:support@invoicesandexpenses.com?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="theme-panel mx-auto w-full max-w-md px-6 py-7 sm:px-8 sm:py-9">
        {submitted ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-xl">
              ✓
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Request sent</h1>
            <p className="text-sm text-slate-500 mb-4">
              Your email client should have opened with a pre-filled deletion request. Please send that email to complete your request.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              If your email client didn&apos;t open, email us directly at{' '}
              <a href="mailto:support@invoicesandexpenses.com" className="text-blue-600 hover:underline">
                support@invoicesandexpenses.com
              </a>{' '}
              with your account email and deletion request.
            </p>
            <p className="text-xs text-slate-400 mb-6">We process deletion requests within 30 days.</p>
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              ← Back to home
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Delete account</h1>

            <p className="text-sm text-slate-500 mb-6">
              Submit a request to permanently delete your account and all associated data.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 mb-6 flex gap-3">
              <span className="text-amber-600 flex-shrink-0 mt-0.5 text-sm">⚠</span>
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">This action is permanent</p>
                <p>All your invoices, expenses, clients, and account data will be deleted and cannot be recovered.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="theme-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason for deletion{' '}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="theme-input min-h-[80px] resize-none"
                  placeholder="Let us know why you're leaving..."
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors"
              >
                Submit deletion request
              </button>
            </form>

            <p className="mt-4 text-xs text-slate-400 text-center">
              Requests are processed within 30 days. You&apos;ll receive a confirmation email once your account is deleted.
            </p>

            <p className="mt-3 text-sm text-slate-500 text-center">
              Changed your mind?{' '}
              <Link href="/" className="text-blue-600 hover:underline">
                Go back
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
