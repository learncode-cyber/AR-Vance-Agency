'use client'
import { useState } from 'react'
import Link from 'next/link'


export default function AffiliateRegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null)
    try {
      const res = await fetch('/api/affiliate/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email }) })
      const json = await res.json().catch(() => ({}))
      setMsg(res.ok ? { ok: true, text: json.message ?? 'Check your email for a verification link.' } : { ok: false, text: json.error ?? 'Something went wrong. Please try again.' })
    } catch { setMsg({ ok: false, text: 'Network error. Please try again.' }) } finally { setBusy(false) }
  }

  return (
    <main className="section-py">
      <div className="container" style={{ maxWidth: 520 }}>
        <h1 className="page-banner-title">Become an affiliate</h1>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>Earn a commission on every sale you refer. Sign up, confirm your email, then sign in to see your link and earnings.</p>
        <form onSubmit={submit} style={{ display: 'grid', gap: '.75rem' }}>
          <input className="form-input" required minLength={2} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="form-input" required type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Sign up'}</button>
        </form>
        {msg && <p role="status" style={{ marginTop: '1rem', color: msg.ok ? '#047857' : '#B91C1C' }}>{msg.text}</p>}
        <p style={{ marginTop: '2rem' }}>Already an affiliate? <Link href="/affiliate/login">Sign in</Link></p>
      </div>
    </main>
  )
}
