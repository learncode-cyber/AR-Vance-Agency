'use client'
import { useEffect, useState } from 'react'

interface InvoiceRow { id: string; number: string; billToName: string; billToEmail: string; total: number; currency: string; status: string; dueDate: string }
const STATUS_COLORS: Record<string, string> = { draft: '#6B7280', sent: '#2563EB', paid: '#047857', void: '#B91C1C' }
const CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'AUD', 'CAD', 'AED', 'SGD']

// Real invoices: list from the database, create a numbered invoice, send it by email as a PDF,
// download the PDF, and move it through draft → sent → paid / void.
export default function AdminInvoicesPage() {
  const [rows, setRows] = useState<InvoiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', address: '', currency: 'USD', taxRate: '0', discount: '0', dueInDays: '14', notes: '', description: '', quantity: '1', unitPrice: '' })

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/invoices')
      const json = await res.json()
      setRows(json.data ?? [])
    } catch { setMsg('Could not load invoices') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('')
    const res = await fetch('/api/invoices/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        billTo: { name: form.name, email: form.email, address: form.address || undefined },
        items: [{ description: form.description, quantity: Number(form.quantity), unitPrice: Number(form.unitPrice) }],
        currency: form.currency, taxRate: Number(form.taxRate), discount: Number(form.discount), dueInDays: Number(form.dueInDays), notes: form.notes || undefined,
      }),
    })
    const json = await res.json()
    setBusy(false)
    if (!res.ok) { setMsg(json.error ?? 'Could not create invoice'); return }
    setMsg(`Created ${json.data.number}`)
    setForm({ ...form, name: '', email: '', address: '', description: '', unitPrice: '', notes: '' })
    load()
  }

  async function send(id: string) {
    setBusy(true); setMsg('')
    const res = await fetch('/api/invoices/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invoiceId: id }) })
    const json = await res.json(); setBusy(false)
    setMsg(res.ok ? `Sent to ${json.data.sentTo}` : json.error ?? 'Send failed'); load()
  }

  async function setStatus(id: string, status: 'paid' | 'void') {
    if (status === 'void' && !confirm('Void this invoice? This cannot be undone.')) return
    setBusy(true)
    const res = await fetch(`/api/admin/invoices/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    const json = await res.json(); setBusy(false)
    setMsg(res.ok ? `Marked ${status}` : json.error ?? 'Update failed'); load()
  }

  return (
    <>
      <div className="admin-topbar"><h1 className="admin-topbar-title">Invoices</h1></div>
      <div className="admin-content">
        {msg && <div className="form-msg" style={{ marginBottom: '1rem' }}>{msg}</div>}

        <form onSubmit={create} className="admin-card" style={{ marginBottom: '1.5rem', display: 'grid', gap: '.5rem', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
          <h3 style={{ gridColumn: '1/-1' }}>New invoice</h3>
          <input className="form-input" required placeholder="Client name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="form-input" required type="email" placeholder="Client email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="form-input" placeholder="Client address (optional)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input className="form-input" required placeholder="Item description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="form-input" required type="number" min="0" step="0.01" placeholder="Unit price" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
          <input className="form-input" required type="number" min="0.01" step="any" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <select className="form-input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
          <input className="form-input" type="number" min="0" max="100" step="0.01" placeholder="Tax %" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} />
          <input className="form-input" type="number" min="0" step="0.01" placeholder="Discount" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
          <input className="form-input" type="number" min="0" max="365" placeholder="Due in (days)" value={form.dueInDays} onChange={(e) => setForm({ ...form, dueInDays: e.target.value })} />
          <input className="form-input" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="admin-btn admin-btn-primary" disabled={busy}>Create invoice</button>
        </form>

        <div className="admin-card">
          {loading ? <p>Loading…</p> : rows.length === 0 ? <p style={{ color: 'var(--muted)' }}>No invoices yet.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th align="left">Number</th><th align="left">Client</th><th align="right">Total</th><th align="left">Due</th><th align="left">Status</th><th align="left">Actions</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td>{r.number}</td>
                    <td>{r.billToName}<div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{r.billToEmail}</div></td>
                    <td align="right">{r.currency} {r.total.toFixed(2)}</td>
                    <td>{r.dueDate.slice(0, 10)}</td>
                    <td><span style={{ color: STATUS_COLORS[r.status] ?? '#333', fontWeight: 600 }}>{r.status}</span></td>
                    <td style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', padding: '.4rem 0' }}>
                      <a className="admin-btn" href={`/api/invoices/${r.id}/pdf`}>PDF</a>
                      {(r.status === 'draft' || r.status === 'sent') && <button className="admin-btn" disabled={busy} onClick={() => send(r.id)}>{r.status === 'draft' ? 'Send' : 'Resend'}</button>}
                      {(r.status === 'sent' || r.status === 'draft') && <button className="admin-btn" disabled={busy} onClick={() => setStatus(r.id, 'paid')}>Mark paid</button>}
                      {(r.status === 'draft' || r.status === 'sent') && <button className="admin-btn" disabled={busy} onClick={() => setStatus(r.id, 'void')}>Void</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
