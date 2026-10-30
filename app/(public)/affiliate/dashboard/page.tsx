'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'


interface Me {
  name: string; code: string; commissionRate: number; referralLink: string
  totals: { pending: number; approved: number; paid: number; reversed: number; orders: number; payable: number; counted: number }
  commissions: { orderNumber: string; orderTotal: number; amount: number; status: string; createdAt: string }[]
}
const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// Real numbers for the signed-in affiliate (from /api/affiliate/me). Nothing here is sample data.
export default function AffiliateDashboardPage() {
  const [me, setMe] = useState<Me | null>(null)
  const [state, setState] = useState<'loading' | 'signed-out' | 'ready' | 'error'>('loading')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/affiliate/me').then(async (r) => {
      if (r.status === 401) { setState('signed-out'); return }
      if (!r.ok) { setState('error'); return }
      setMe((await r.json()).data); setState('ready')
    }).catch(() => setState('error'))
  }, [])

  async function logout() {
    await fetch('/api/affiliate/logout', { method: 'POST' })
    setState('signed-out'); setMe(null)
  }

  if (state === 'loading') return <main className="section-py"><div className="container">Loading…</div></main>
  if (state === 'signed-out') return (
    <main className="section-py"><div className="container" style={{ maxWidth: 520 }}>
      <h1 className="page-banner-title">Affiliate dashboard</h1>
      <p style={{ margin: '1rem 0' }}>Please sign in to see your earnings.</p>
      <Link className="btn btn-primary" href="/affiliate/login">Sign in</Link>
    </div></main>
  )
  if (state === 'error' || !me) return <main className="section-py"><div className="container">Could not load your dashboard. Please refresh.</div></main>

  const link = typeof window !== 'undefined' ? `${window.location.origin}${me.referralLink}` : me.referralLink
  return (
    <main className="section-py">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="page-banner-title">Hi {me.name}</h1>
          <button className="btn" onClick={logout}>Sign out</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', margin: '2rem 0' }}>
          {[['Payable (approved)', money(me.totals.payable)], ['Pending', money(me.totals.pending)], ['Paid out', money(me.totals.paid)], ['Referred orders', String(me.totals.counted)]].map(([k, v]) => (
            <div key={k} className="admin-card"><div style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>{k}</div><div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{v}</div></div>
          ))}
        </div>

        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <h2>Your referral link</h2>
          <p style={{ color: 'var(--text-muted)' }}>Commission: {me.commissionRate}% of each referred order's subtotal (after discounts). Commissions move from pending to approved when payment is confirmed.</p>
          <code style={{ display: 'block', wordBreak: 'break-all', margin: '.75rem 0' }}>{link}</code>
          <button className="btn btn-primary" onClick={() => { navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>{copied ? 'Copied' : 'Copy link'}</button>
        </div>

        <div className="admin-card">
          <h2>Commissions</h2>
          {me.commissions.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No referred orders yet.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th align="left">Order</th><th align="left">Date</th><th align="right">Order total</th><th align="right">Commission</th><th align="left">Status</th></tr></thead>
              <tbody>{me.commissions.map((c) => (
                <tr key={c.orderNumber + c.createdAt} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td>{c.orderNumber}</td><td>{c.createdAt.slice(0, 10)}</td><td align="right">{money(c.orderTotal)}</td><td align="right">{money(c.amount)}</td><td style={{ textTransform: 'capitalize' }}>{c.status}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
