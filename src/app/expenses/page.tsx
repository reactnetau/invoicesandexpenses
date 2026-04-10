'use client'

import { useEffect, useState, FormEvent } from 'react'
import Nav from '@/components/Nav'
import { useSnackbar } from 'notistack'

interface Expense {
  id: string
  category: string
  amount: string
  date: string
  created_at: string
}

const CATEGORIES = [
  'Software',
  'Hardware',
  'Marketing',
  'Travel',
  'Office',
  'Contractor',
  'Other',
]

export default function ExpensesPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')

  async function loadExpenses() {
    const res = await fetch('/api/expenses')
    const data = await res.json()
    setExpenses(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { loadExpenses() }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, amount: parseFloat(amount), date }),
    })

    setSubmitting(false)

    if (!res.ok) {
      const data = await res.json()
      enqueueSnackbar(data.error ?? 'Failed to add expense', { variant: 'error' })
      return
    }

    enqueueSnackbar('Expense added', { variant: 'success' })
    setCategory('')
    setAmount('')
    setDate('')
    setShowForm(false)
    loadExpenses()
  }

  async function deleteExpense(id: string) {
    if (!confirm('Delete this expense?')) return
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    if (res.ok) {
      enqueueSnackbar('Expense deleted', { variant: 'success' })
    } else {
      enqueueSnackbar('Failed to delete expense', { variant: 'error' })
    }
    loadExpenses()
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Expenses</h1>
            {expenses.length > 0 && (
              <p className="text-sm text-slate-500 mt-0.5">Total: {fmt(total)}</p>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add Expense'}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white border border-slate-200 rounded-xl p-5 mb-6 space-y-4"
          >
            <h2 className="text-sm font-semibold text-slate-700">New Expense</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Amount (USD) *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {submitting ? 'Adding…' : 'Add Expense'}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-slate-500 text-sm">Loading…</p>
        ) : expenses.length === 0 ? (
          <p className="text-slate-400 text-sm">No expenses yet. Add your first one above.</p>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium">{exp.category}</td>
                    <td className="px-4 py-3">{fmt(parseFloat(exp.amount))}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
