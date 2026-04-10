'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { useSnackbar } from 'notistack'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  address: string | null
}

export default function ClientsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  async function loadClients() {
    const res = await fetch('/api/clients')
    const data = await res.json()
    setClients(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { loadClients() }, [])

  async function deleteClient(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    if (res.ok) {
      enqueueSnackbar(`${name} deleted`, { variant: 'success' })
      loadClients()
    } else {
      enqueueSnackbar('Failed to delete client', { variant: 'error' })
    }
  }

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800">Clients</h1>
          <Link
            href="/clients/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Add Client
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm">Loading…</p>
        ) : clients.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm mb-4">No clients yet.</p>
            <Link
              href="/clients/new"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Add your first client
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Company</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Phone</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-slate-500">{c.company ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{c.email ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{c.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteClient(c.id, c.name)}
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
          </div>
        )}
      </main>
    </>
  )
}
