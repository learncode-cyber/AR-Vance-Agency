'use client'
import { useEffect, useState } from 'react'

interface Aff { id: string; name: string; email: string; code: string; status: string; commissionRate: number; lastLoginAt: string | null }
interface Com { id: string; affiliateName: string; orderNumber: string; orderTotal: number; amount: number; status: string; createdAt: string }
const money = (n: number) => `$${n.toFixed(2)}`
const NEXT_ACTIONS: Record<string, { to: string; label: string }[]> = {
  pending: [{ to: 'approved', label: 'Approve' }, { to: 'reversed', label: 'Reverse' }],
  approved: [{ to: 'paid', label: 'Mark paid' }, { to: 'reversed', label: 'Reverse' }],
  paid: [], reversed: [],
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Aff[]>([])
  const [commissions, setCommissions] = useState<Com[]>([])
  const [filter, setFilter] = useState('all')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/affiliates')
    const json = await res.json().catch(() => ({}))
    if (res.ok) { setAffiliates(json.data.affiliates); setCommissions(json.data.commissions) } else setMsg(json.error ?? 'Could not load')
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function act(id: string, to: string) {
    if (to === 'reversed' && !confirm('Reverse this commission? It will no longer count as earned.')) return
    const res = await fetch(`/api/admin/affiliates/commissions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: to }) })
    const json = await res.json().catch(() => ({}))
    setMsg(res.ok ? `Commission ${to}` : json.error ?? 'Update failed')
    load()
  }

  const shown = commissions.filter((c) => filter === 'all' || c.status === filter)
  const totals = (st: string) => commissions.filter((c) => c.status === st).reduce((s, c) => s + c.amount, 0)

  return (
    <>
      <div className="admin-topbar"><h1 className="admin-topbar-title">Affiliates</h1></div>
      <div className="admin-content">
        {msg && <div className="form-msg" style={{ marginBottom: '1rem' }}>{msg}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[['Pending', totals('pending')], ['Approved (payable)', totals('approved')], ['Paid', totals('paid')]].map(([k, v]) => (
            <div key={String(k)} className="admin-card"><div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{k}</div><div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{money(Number(v))}</div></div>
          ))}
        </div>

        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <h3>Affiliate accounts ({affiliates.length})</h3>
          {loading ? <p>Loading…</p> : affiliates.length === 0 ? <p style={{ color: 'var(--muted)' }}>No affiliates yet.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th align="left">Name</th><th align="left">Email</th><th align="left">Code</th><th align="right">Rate</th><th align="left">Status</th><th align="left">Last sign-in</th></tr></thead>
              <tbody>{affiliates.map((a) => (
                <tr key={a.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td>{a.name}</td><td>{a.email}</td><td><code>{a.code}</code></td><td align="right">{a.commissionRate}%</td><td>{a.status}</td><td>{a.lastLoginAt ? a.lastLoginAt.slice(0, 10) : '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>

        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
            <h3>Commissions</h3>
            <select className="form-input" style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
              {['all', 'pending', 'approved', 'paid', 'reversed'].map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          {shown.length === 0 ? <p style={{ color: 'var(--muted)' }}>Nothing here yet.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '.75rem' }}>
              <thead><tr><th align="left">Order</th><th align="left">Affiliate</th><th align="left">Date</th><th align="right">Order total</th><th align="right">Commission</th><th align="left">Status</th><th align="left">Actions</th></tr></thead>
              <tbody>{shown.map((c) => (
                <tr key={c.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td>{c.orderNumber}</td><td>{c.affiliateName}</td><td>{c.createdAt.slice(0, 10)}</td>
                  <td align="right">{money(c.orderTotal)}</td><td align="right">{money(c.amount)}</td><td style={{ textTransform: 'capitalize' }}>{c.status}</td>
                  <td style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', padding: '.3rem 0' }}>
                    {(NEXT_ACTIONS[c.status] ?? []).map((a) => <button key={a.to} className="admin-btn" onClick={() => act(c.id, a.to)}>{a.label}</button>)}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
