'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'


function LoginInner() {
  const router = useRouter()
  const token = useSearchParams().get('token')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Arriving from the emailed link: exchange the one-time token for a session cookie.
  useEffect(() => {
    if (!token) return
    setBusy(true)
    fetch('/api/affiliate/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(async (r) => {
        if (r.ok) { router.replace('/affiliate/dashboard'); return }
        const j = await r.json().catch(() => ({}))
        setMsg({ ok: false, text: j.error ?? 'This sign-in link is invalid or has expired. Request a new one below.' })
      })
      .finally(() => setBusy(false))
  }, [token, router])

  async function request(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null)
    const res = await fetch('/api/affiliate/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    const j = await res.json().catch(() => ({}))
    setBusy(false)
    setMsg(res.ok ? { ok: true, text: j.message } : { ok: false, text: j.error ?? 'Something went wrong.' })
  }

  return (
    <main className="section-py">
      <div className="container" style={{ maxWidth: 520 }}>
        <h1 className="page-banner-title">Affiliate sign-in</h1>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>We email you a one-time sign-in link. No password needed.</p>
        <form onSubmit={request} style={{ display: 'grid', gap: '.75rem' }}>
          <input className="form-input" required type="email" placeholder="Your affiliate email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn btn-primary" disabled={busy}>Email me a sign-in link</button>
        </form>
        {msg && <p role="status" style={{ marginTop: '1rem', color: msg.ok ? '#047857' : '#B91C1C' }}>{msg.text}</p>}
      </div>
    </main>
  )
}

export default function AffiliateLoginPage() {
  return <Suspense fallback={null}><LoginInner /></Suspense>
}
