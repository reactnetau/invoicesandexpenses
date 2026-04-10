'use client'

import { useEffect, useState, FormEvent } from 'react'
import Nav from '@/components/Nav'
import { useSnackbar } from 'notistack'

interface Profile {
  email: string
  currency: string
  business_name: string
  full_name: string
  phone: string
  address: string
  abn: string
  payid: string
}

const CURRENCIES = [
  { code: 'USD', label: 'USD — US Dollar ($)' },
  { code: 'AUD', label: 'AUD — Australian Dollar (A$)' },
  { code: 'GBP', label: 'GBP — British Pound (£)' },
  { code: 'EUR', label: 'EUR — Euro (€)' },
  { code: 'CAD', label: 'CAD — Canadian Dollar (C$)' },
  { code: 'NZD', label: 'NZD — New Zealand Dollar (NZ$)' },
  { code: 'SGD', label: 'SGD — Singapore Dollar (S$)' },
  { code: 'JPY', label: 'JPY — Japanese Yen (¥)' },
  { code: 'CHF', label: 'CHF — Swiss Franc (CHF)' },
  { code: 'INR', label: 'INR — Indian Rupee (₹)' },
]

export default function SettingsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [email, setEmail] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [businessName, setBusinessName] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [abn, setAbn] = useState('')
  const [payid, setPayid] = useState('')

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((d: Profile) => {
        setEmail(d.email ?? '')
        setCurrency(d.currency ?? 'USD')
        setBusinessName(d.business_name ?? '')
        setFullName(d.full_name ?? '')
        setPhone(d.phone ?? '')
        setAddress(d.address ?? '')
        setAbn(d.abn ?? '')
        setPayid(d.payid ?? '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currency,
        business_name: businessName,
        full_name: fullName,
        phone,
        address,
        abn,
        payid,
      }),
    })
    setSaving(false)
    if (res.ok) {
      enqueueSnackbar('Settings saved', { variant: 'success' })
    } else {
      const data = await res.json().catch(() => ({}))
      enqueueSnackbar(data.error ?? 'Failed to save settings', { variant: 'error' })
    }
  }

  if (loading) {
    return (
      <>
        <Nav />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-slate-500 text-sm">Loading…</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-slate-800 mb-6">Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Account */}
          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Account</h2>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">Used in your AI summary and invoice formatting.</p>
            </div>
          </section>

          {/* Business details */}
          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Business Details</h2>
            <p className="text-xs text-slate-400 mb-4">These appear on PDF invoices sent to your clients. Fields marked <span className="text-red-500">*</span> are required to create invoices.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Business name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Acme Freelance Ltd"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Your name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+61 400 000 000"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St&#10;Sydney NSW 2000&#10;Australia"
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ABN / Tax number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={abn}
                  onChange={(e) => setAbn(e.target.value)}
                  placeholder="12 345 678 901"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Payment details */}
          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-1">Payment Details</h2>
            <p className="text-xs text-slate-400 mb-4">Printed on PDF invoices so clients know how to pay you.</p>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                PayID <span className="text-red-500">*</span>
                <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 font-normal">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Encrypted at rest
                </span>
              </label>
              <input
                type="text"
                value={payid}
                onChange={(e) => setPayid(e.target.value)}
                placeholder="yourname@bank.com or +61400000000"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Your PayID is encrypted using AES-256-GCM before being stored. It is never stored in plain text.
              </p>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </form>
      </main>
    </>
  )
}
