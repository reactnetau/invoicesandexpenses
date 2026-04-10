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

interface Profile {
  business_name: string | null
  full_name: string | null
  phone: string | null
  address: string | null
  abn: string | null
  payid: string | null
}

interface Fields {
  business_name: boolean
  full_name: boolean
  phone: boolean
  address: boolean
  abn: boolean
  payid: boolean
}

const FIELD_LABELS: { key: keyof Fields; label: string }[] = [
  { key: 'business_name', label: 'Business name' },
  { key: 'full_name', label: 'Your name' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'abn', label: 'ABN / Tax number' },
  { key: 'payid', label: 'PayID' },
]

function defaultFields(profile: Profile | null): Fields {
  return {
    business_name: !!profile?.business_name,
    full_name: !!profile?.full_name,
    phone: !!profile?.phone,
    address: !!profile?.address,
    abn: !!profile?.abn,
    payid: !!profile?.payid,
  }
}

interface PreviewProps {
  clientName: string
  clientEmail: string | null
  amount: string
  dueDate: string
  profile: Profile | null
  fields: Fields
}

function InvoicePreview({ clientName, clientEmail, amount, dueDate, profile, fields }: PreviewProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'

  const senderName = (fields.business_name && profile?.business_name) || (fields.full_name && profile?.full_name) || null
  const senderDetails = [
    fields.full_name && profile?.business_name && profile?.full_name ? profile.full_name : null,
    fields.phone && profile?.phone ? profile.phone : null,
    fields.abn && profile?.abn ? `ABN: ${profile.abn}` : null,
  ].filter(Boolean) as string[]

  const parsedAmount = parseFloat(amount) || 0

  const paymentRows: [string, string][] = fields.payid && profile?.payid
    ? [['PayID', profile.payid], ['Reference', 'INV-PREVIEW']]
    : [['Reference', 'INV-PREVIEW']]

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs font-sans w-full" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Header band */}
      <div className="bg-blue-50 px-6 py-4 flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-slate-900 leading-tight">Invoice</p>
          <p className="text-sm text-slate-500 mt-0.5">{senderName ?? 'Invoice Tracker'}</p>
        </div>
        {senderDetails.length > 0 && (
          <div className="text-right text-slate-500 leading-relaxed">
            {senderDetails.map((l, i) => <p key={i}>{l}</p>)}
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="px-6 pt-4 pb-2">
        <p className="text-lg font-bold text-slate-900">
          Amount due: {parsedAmount > 0 ? fmt(parsedAmount) : '—'}
        </p>
      </div>

      {/* Details table */}
      <div className="px-6 pb-4 space-y-2">
        {[
          ['Client', clientName || '—'],
          ['Client email', clientEmail || 'No email on file'],
          ['Due date', fmtDate(dueDate)],
          ['Status', 'unpaid'],
          ['Public link', 'Link available after creation'],
        ].map(([label, value]) => (
          <div key={label} className="flex gap-4">
            <span className="w-28 shrink-0 font-semibold text-slate-400">{label}</span>
            <span className="text-slate-700 break-all">{value}</span>
          </div>
        ))}
      </div>

      <hr className="mx-6 border-slate-100" />

      <p className="px-6 py-2 text-slate-400">Share the public link with your client to let them view the invoice online.</p>

      {/* Payment details */}
      <div className="mx-6 mb-5 mt-1 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
        <p className="font-semibold text-slate-800 mb-2">Payment Details</p>
        <div className="space-y-1">
          {paymentRows.map(([label, value]) => (
            <div key={label} className="flex gap-4">
              <span className="w-28 shrink-0 font-semibold text-slate-400">{label}</span>
              <span className="text-slate-700">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FieldCheckboxes({
  profile,
  fields,
  onChange,
}: {
  profile: Profile | null
  fields: Fields
  onChange: (f: Fields) => void
}) {
  const available = FIELD_LABELS.filter(({ key }) => !!profile?.[key])
  if (available.length === 0) return null

  return (
    <div className="space-y-2">
      {available.map(({ key, label }) => (
        <label key={key} className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={fields[key]}
            onChange={(e) => onChange({ ...fields, [key]: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">{label}</span>
          <span className="text-xs text-slate-400 truncate max-w-[200px]">
            {key === 'payid' ? '••••••••' : String(profile?.[key] ?? '')}
          </span>
        </label>
      ))}
    </div>
  )
}

export default function InvoicesPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showSettingsPrompt, setShowSettingsPrompt] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // New invoice form
  const [selectedClientId, setSelectedClientId] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [createFields, setCreateFields] = useState<Fields>(defaultFields(null))
  const [showPreview, setShowPreview] = useState(false)

  // Send PDF modal
  const [modalInvoice, setModalInvoice] = useState<Invoice | null>(null)
  const [modalFields, setModalFields] = useState<Fields>(defaultFields(null))
  const [sending, setSending] = useState(false)

  async function loadData() {
    const [invRes, clientRes, profileRes] = await Promise.all([
      fetch('/api/invoices'),
      fetch('/api/clients'),
      fetch('/api/user/profile'),
    ])
    const [invData, clientData, profileData] = await Promise.all([
      invRes.json(), clientRes.json(), profileRes.json(),
    ])
    setInvoices(Array.isArray(invData) ? invData : [])
    setClients(Array.isArray(clientData) ? clientData : [])
    const p: Profile = profileData
    setProfile(p)
    setCreateFields(defaultFields(p))
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? null

  function openSendModal(inv: Invoice) {
    setModalInvoice(inv)
    setModalFields(defaultFields(profile))
  }

  function closeSendModal() {
    setModalInvoice(null)
    setSending(false)
  }

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
        fields: sendEmail ? createFields : {},
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

  async function confirmSendPdf() {
    if (!modalInvoice) return
    setSending(true)
    const res = await fetch(`/api/invoices/${modalInvoice.id}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: modalFields }),
    })
    const data = await res.json().catch(() => ({}))
    setSending(false)
    closeSendModal()
    if (res.ok) {
      enqueueSnackbar(`Invoice emailed to ${modalInvoice.client_email}`, { variant: 'success' })
    } else {
      enqueueSnackbar(data.error ?? 'Failed to send email', { variant: 'error' })
    }
  }

  async function markPaid(id: string) {
    const res = await fetch(`/api/invoices/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'paid' }), headers: { 'Content-Type': 'application/json' } })
    if (res.ok) {
      enqueueSnackbar('Invoice marked as paid', { variant: 'success' })
    } else {
      enqueueSnackbar('Failed to update invoice', { variant: 'error' })
    }
    loadData()
  }

  async function markUnpaid(id: string) {
    const res = await fetch(`/api/invoices/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'unpaid' }), headers: { 'Content-Type': 'application/json' } })
    if (res.ok) {
      enqueueSnackbar('Invoice marked as unpaid', { variant: 'success' })
    } else {
      enqueueSnackbar('Failed to update invoice', { variant: 'error' })
    }
    loadData()
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

  const hasProfileData = profile && Object.values(profile).some(Boolean)
  const hasRequiredFields = !!(profile?.business_name?.trim() && profile?.abn?.trim() && profile?.payid?.trim())

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800">Invoices</h1>
          <button
            onClick={() => {
              if (!showForm && !hasRequiredFields) {
                setShowSettingsPrompt(true)
                return
              }
              setShowForm(!showForm)
              setShowPreview(false)
            }}
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
                  <Link href="/clients/new" className="text-sm text-blue-600 hover:underline font-medium">
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
                  <Link href="/clients/new" className="shrink-0 text-xs text-blue-600 hover:underline">
                    + New client
                  </Link>
                </div>
              )}
              {selectedClient && (
                <div className="mt-2 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600 flex gap-4">
                  {selectedClient.email && <span>{selectedClient.email}</span>}
                  {selectedClient.company && <span>{selectedClient.company}</span>}
                </div>
              )}
            </div>

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

            {/* Your details to share */}
            {hasProfileData && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-blue-800">Your details on the invoice</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    The checked details will be shared with the client on this invoice.
                  </p>
                </div>
                <FieldCheckboxes profile={profile} fields={createFields} onChange={setCreateFields} />
                <p className="text-xs text-slate-400">
                  Manage your details in{' '}
                  <Link href="/settings" className="text-blue-600 hover:underline">Settings</Link>.
                </p>
              </div>
            )}

            {/* Email toggle */}
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

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting || clients.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {submitting ? 'Creating…' : 'Create Invoice'}
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                disabled={clients.length === 0}
                className="border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-800 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-40"
              >
                Preview PDF
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-slate-500 text-sm">Loading…</p>
        ) : invoices.length === 0 ? (
          <p className="text-slate-400 text-sm">No invoices yet. Create your first one above.</p>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-full text-sm">
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
                      <div className="flex items-center gap-4 justify-end">
                        {inv.status === 'unpaid' ? (
                          <button
                            onClick={() => markPaid(inv.id)}
                            className="text-xs text-green-600 hover:text-green-700 font-medium"
                          >
                            Mark paid
                          </button>
                        ) : (
                          <button
                            onClick={() => markUnpaid(inv.id)}
                            className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                          >
                            Undo paid
                          </button>
                        )}
                        <button
                          onClick={() => openSendModal(inv)}
                          disabled={!inv.client_email}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                          title={inv.client_email ? 'Send PDF to client' : 'No email address on this invoice'}
                        >
                          Send PDF
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
          </div>
        )}
      </main>

      {/* Settings prompt modal */}
      {showSettingsPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-2">Complete your profile first</h2>
            <p className="text-sm text-slate-500 mb-3">
              The following required fields are missing from your Settings:
            </p>
            <ul className="text-sm mb-5 space-y-1">
              {!profile?.business_name?.trim() && <li className="flex items-center gap-2 text-red-600"><span>✗</span> Business name</li>}
              {!profile?.abn?.trim() && <li className="flex items-center gap-2 text-red-600"><span>✗</span> ABN / Tax number</li>}
              {!profile?.payid?.trim() && <li className="flex items-center gap-2 text-red-600"><span>✗</span> PayID</li>}
            </ul>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSettingsPrompt(false)}
                className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Maybe later
              </button>
              <Link
                href="/settings"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
              >
                Go to Settings
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Invoice preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-700">Invoice preview</p>
              <button
                onClick={() => setShowPreview(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              <InvoicePreview
                clientName={selectedClient?.name ?? ''}
                clientEmail={selectedClient?.email ?? null}
                amount={amount}
                dueDate={dueDate}
                profile={profile}
                fields={createFields}
              />
            </div>
            <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send PDF modal */}
      {modalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-1">Send PDF invoice</h2>
            <p className="text-xs text-slate-500 mb-5">
              Sending to <span className="font-medium text-slate-700">{modalInvoice.client_email}</span>
            </p>

            {hasProfileData ? (
              <>
                <div className="mb-2">
                  <p className="text-xs font-semibold text-slate-700 mb-0.5">Your details to include</p>
                  <p className="text-xs text-slate-400 mb-3">
                    The checked details will be shared with the client on the PDF.
                  </p>
                  <FieldCheckboxes profile={profile} fields={modalFields} onChange={setModalFields} />
                </div>
                <p className="text-xs text-slate-400 mt-3 mb-5">
                  Update your details in{' '}
                  <Link href="/settings" className="text-blue-600 hover:underline" onClick={closeSendModal}>
                    Settings
                  </Link>.
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500 mb-5">
                No account details set.{' '}
                <Link href="/settings" className="text-blue-600 hover:underline" onClick={closeSendModal}>
                  Add them in Settings
                </Link>{' '}
                to include your details on the PDF.
              </p>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={closeSendModal}
                className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSendPdf}
                disabled={sending}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
              >
                {sending ? 'Sending…' : 'Send PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
