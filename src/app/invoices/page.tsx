'use client'

import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { useSnackbar } from 'notistack'

interface Client {
  id: string
  name: string
  email: string | null
  company: string | null
}

interface Invoice {
  id: string
  client_name: string
  client_email: string | null
  amount: string
  status: string
  due_date: string
  paid_at: string | null
  public_id: string
  created_at: string
}

export default function InvoicesPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [selectedClientId, setSelectedClientId] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null)

  async function loadData() {
    const [invRes, clientRes] = await Promise.all([
      fetch('/api/invoices'),
      fetch('/api/clients'),
    ])
    const [invData, clientData] = await Promise.all([invRes.json(), clientRes.json()])
    setInvoices(Array.isArray(invData) ? invData : [])
    setClients(Array.isArray(clientData) ? clientData : [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? null

  async function handleCreate(e: FormEvent) {
    e.preventDefault()

    if (!selectedClientId) {
      enqueueSnackbar('Please select a client', { variant: 'error' })
      return
    }

    setSubmitting(true)

    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: selectedClientId,
        client_name: selectedClient!.name,
        client_email: selectedClient!.email,
        amount: parseFloat(amount),
        due_date: dueDate,
        send_email: sendEmail,
      }),
    })

    setSubmitting(false)

    const data = await res.json()

    if (!res.ok) {
      enqueueSnackbar(data.message ?? data.error ?? 'Failed to create invoice', { variant: 'error' })
      return
    }

    if (sendEmail && data.email_sent) {
      enqueueSnackbar('Invoice created and emailed to the client', { variant: 'success' })
    } else if (sendEmail && !data.email_sent) {
      enqueueSnackbar(`Invoice created, but email failed: ${data.email_error ?? 'Unknown error'}`, { variant: 'warning' })
    } else {
      enqueueSnackbar('Invoice created', { variant: 'success' })
    }

    setSelectedClientId('')
    setAmount('')
    setDueDate('')
    setSendEmail(false)
    setShowForm(false)
    loadData()
  }

  async function markPaid(id: string) {
    const res = await fetch(`/api/invoices/${id}`, { method: 'PATCH' })
    if (res.ok) {
      enqueueSnackbar('Invoice marked as paid', { variant: 'success' })
    } else {
      enqueueSnackbar('Failed to update invoice', { variant: 'error' })
    }
    loadData()
  }

  async function sendPdfEmail(inv: Invoice) {
    if (!inv.client_email) {
      enqueueSnackbar('No email address on this invoice', { variant: 'error' })
      return
    }
    setSendingEmailId(inv.id)
    const res = await fetch(`/api/invoices/${inv.id}/email`, { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    setSendingEmailId(null)
    if (res.ok) {
      enqueueSnackbar(`Invoice emailed to ${inv.client_email}`, { variant: 'success' })
    } else {
      enqueueSnackbar(data.error ?? 'Failed to send email', { variant: 'error' })
    }
  }

  async function deleteInvoice(id: string) {
    if (!confirm('Delete this invoice?')) return
    const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    if (res.ok) {
      enqueueSnackbar('Invoice deleted', { variant: 'success' })
    } else {
      enqueueSnackbar('Failed to delete invoice', { variant: 'error' })
    }
    loadData()
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800">Invoices</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Invoice'}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white border border-slate-200 rounded-xl p-5 mb-6 space-y-4"
          >
            <h2 className="text-sm font-semibold text-slate-700">New Invoice</h2>

            {/* Client selector */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              {clients.length === 0 ? (
                <div className="flex items-center gap-3 p-3 border border-dashed border-slate-300 rounded-lg">
                  <p className="text-sm text-slate-500">No clients yet.</p>
                  <Link
                    href="/clients/new"
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    Add a client →
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select a client…</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}{c.company ? ` — ${c.company}` : ''}
                      </option>
                    ))}
                  </select>
                  <Link
                    href="/clients/new"
                    className="shrink-0 text-xs text-blue-600 hover:underline"
                  >
                    + New client
                  </Link>
                </div>
              )}

              {/* Selected client preview */}
              {selectedClient && (
                <div className="mt-2 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600 flex gap-4">
                  {selectedClient.email && <span>{selectedClient.email}</span>}
                  {selectedClient.company && <span>{selectedClient.company}</span>}
                </div>
              )}
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                disabled={!selectedClient?.email}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="text-sm text-slate-600">
                <span className="block font-medium text-slate-700">Generate PDF and email it to the client</span>
                <span className="block text-xs text-slate-500">
                  {selectedClient?.email
                    ? `The PDF invoice will be sent to ${selectedClient.email}.`
                    : 'Select a client with a registered email address to enable this option.'}
                </span>
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Amount (USD) <span className="text-red-500">*</span>
                </label>
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
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || clients.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {submitting ? 'Creating…' : 'Create Invoice'}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-slate-500 text-sm">Loading…</p>
        ) : invoices.length === 0 ? (
          <p className="text-slate-400 text-sm">No invoices yet. Create your first one above.</p>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Client</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Due</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Public Link</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {inv.client_name}
                      {inv.client_email && (
                        <div className="text-xs text-slate-400">{inv.client_email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{fmt(parseFloat(inv.amount))}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          inv.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(inv.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/invoice/${inv.public_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-xs"
                      >
                        View
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {inv.status === 'unpaid' && (
                          <button
                            onClick={() => markPaid(inv.id)}
                            className="text-xs text-green-600 hover:text-green-700 font-medium"
                          >
                            Mark paid
                          </button>
                        )}
                        <button
                          onClick={() => sendPdfEmail(inv)}
                          disabled={sendingEmailId === inv.id || !inv.client_email}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                          title={inv.client_email ? 'Send PDF to client' : 'No email address on this invoice'}
                        >
                          {sendingEmailId === inv.id ? 'Sending…' : 'Send PDF'}
                        </button>
                        <button
                          onClick={() => deleteInvoice(inv.id)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
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
