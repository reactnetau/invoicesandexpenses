'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Nav from '@/components/Nav'
import Link from 'next/link'
import { Suspense } from 'react'
import { useSnackbar } from 'notistack'

interface Invoice {
  id: string
  client_name: string
  amount: string
  status: string
  due_date: string
  created_at: string
}

interface Expense {
  id: string
  category: string
  amount: string
  date: string
}

interface UserStatus {
  subscription_status: string
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const justUpgraded = searchParams.get('upgraded') === '1'

  const { enqueueSnackbar } = useSnackbar()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [user, setUser] = useState<UserStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const now = new Date()
  const currentFyStartYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  const [reportFyStartYear, setReportFyStartYear] = useState<number>(currentFyStartYear)

  useEffect(() => {
    Promise.all([
      fetch('/api/invoices').then((r) => r.json()),
      fetch('/api/expenses').then((r) => r.json()),
      fetch('/api/user/me').then((r) => r.json()),
    ]).then(([inv, exp, u]) => {
      setInvoices(Array.isArray(inv) ? inv : [])
      setExpenses(Array.isArray(exp) ? exp : [])
      setUser(u)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    setAiSummary(null)
  }, [reportFyStartYear])

  async function fetchAiSummary() {
    setAiLoading(true)
    setAiSummary(null)
    const res = await fetch(`/api/ai/summary?fyStart=${reportFyStartYear}`)
    const data = await res.json()
    if (!res.ok) {
      setAiSummary(`Error: ${data.error ?? 'Unknown error'}`)
    } else {
      setAiSummary(data.summary ?? 'No summary available.')
    }
    setAiLoading(false)
  }

  const isPro = user?.subscription_status === 'active'

  const totalIncome = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + parseFloat(i.amount), 0)

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)

  const profit = totalIncome - totalExpenses

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  const toFyStartYear = (dateValue: string) => {
    const d = new Date(dateValue)
    return d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1
  }

  const formatFyLabel = (fyStartYear: number) => `FY ${fyStartYear}/${String(fyStartYear + 1).slice(-2)}`

  const reportFyOptions = Array.from(
    new Set([
      currentFyStartYear,
      ...invoices.map((i) => toFyStartYear(i.created_at)),
      ...expenses.map((e) => toFyStartYear(e.date)),
    ])
  ).sort((a, b) => b - a)

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

  // Count invoices created this month (for free-tier display)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const thisMonthCount = invoices.filter(
    (i) => new Date(i.due_date) >= startOfMonth
  ).length

  if (loading) {
    return (
      <>
        <Nav />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <p className="text-slate-500 text-sm">Loading…</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Success banner */}
        {justUpgraded && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-800">You&apos;re now on Pro!</p>
              <p className="text-xs text-green-700 mt-0.5">Unlimited invoices and CSV export are now unlocked.</p>
            </div>
          </div>
        )}

        {/* Upgrade banner for free users */}
        {!isPro && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-800">Free plan — {thisMonthCount}/5 invoices this month</p>
              <p className="text-xs text-amber-700 mt-0.5">Upgrade to Pro for unlimited invoices and CSV export — $7/month.</p>
            </div>
            <button
              onClick={upgrade}
              className="ml-4 shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Upgrade to Pro
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          {isPro ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{formatFyLabel(reportFyStartYear)}</span>
              <a
                href={`/api/export/csv?fyStart=${reportFyStartYear}`}
                className="text-sm text-blue-600 hover:underline"
              >
                Export CSV
              </a>
            </div>
          ) : (
            <button
              onClick={upgrade}
              className="text-sm text-slate-400 cursor-pointer hover:text-amber-600 transition-colors"
              title="Pro feature"
            >
              Export CSV (Pro)
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Income" value={fmt(totalIncome)} color="text-green-600" />
          <StatCard label="Total Expenses" value={fmt(totalExpenses)} color="text-red-500" />
          <StatCard
            label="Net Profit"
            value={fmt(profit)}
            color={profit >= 0 ? 'text-blue-600' : 'text-red-600'}
          />
        </div>

        {/* AI Summary */}
        <div className="mb-8 bg-white border border-slate-200 rounded-xl px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">AI Summary</span>
              <span className="text-xs text-slate-400">— {formatFyLabel(reportFyStartYear)}</span>
              <select
                value={reportFyStartYear}
                onChange={(e) => setReportFyStartYear(Number(e.target.value))}
                className="ml-2 text-xs border border-slate-300 rounded-md px-2 py-1 text-slate-600 bg-white"
              >
                {reportFyOptions.map((fyStartYear) => (
                  <option key={fyStartYear} value={fyStartYear}>
                    {formatFyLabel(fyStartYear)}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchAiSummary}
              disabled={aiLoading}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 transition-colors"
            >
              {aiLoading ? 'Generating…' : aiSummary ? 'Refresh' : 'Generate summary'}
            </button>
          </div>
          {aiSummary ? (
            <p className="text-sm text-slate-600 leading-relaxed">{aiSummary}</p>
          ) : (
            <p className="text-sm text-slate-400 italic">
              {aiLoading ? 'Asking AI…' : `Click "Generate summary" to get an AI overview for ${formatFyLabel(reportFyStartYear)}.`}
            </p>
          )}
        </div>

        {/* Recent invoices */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Recent Invoices</h2>
            <Link href="/invoices" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {invoices.length === 0 ? (
            <p className="text-sm text-slate-400">No invoices yet.</p>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-2 text-slate-500 font-medium">Client</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-medium">Amount</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-medium">Status</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-medium">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-2 font-medium">{inv.client_name}</td>
                      <td className="px-4 py-2">{fmt(parseFloat(inv.amount))}</td>
                      <td className="px-4 py-2">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-4 py-2 text-slate-500">
                        {new Date(inv.due_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent expenses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Recent Expenses</h2>
            <Link href="/expenses" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {expenses.length === 0 ? (
            <p className="text-sm text-slate-400">No expenses yet.</p>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-2 text-slate-500 font-medium">Category</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-medium">Amount</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.slice(0, 5).map((exp) => (
                    <tr key={exp.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-2 font-medium">{exp.category}</td>
                      <td className="px-4 py-2">{fmt(parseFloat(exp.amount))}</td>
                      <td className="px-4 py-2 text-slate-500">
                        {new Date(exp.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="p-8 text-slate-500 text-sm">Loading…</p>}>
      <DashboardContent />
    </Suspense>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      }`}
    >
      {status}
    </span>
  )
}
