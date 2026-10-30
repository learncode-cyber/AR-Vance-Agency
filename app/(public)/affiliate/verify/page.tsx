'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'


function VerifyInner() {
  const token = useSearchParams().get('token') ?? ''
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (!token) { setState({ ok: false, text: 'This link is missing its token.' }); return }
    fetch('/api/affiliate/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(async (r) => { const j = await r.json().catch(() => ({})); setState(r.ok ? { ok: true, text: `Your account is confirmed. Your referral code is ${j.data?.code}.` } : { ok: false, text: j.error ?? 'This link is invalid or has expired.' }) })
      .catch(() => setState({ ok: false, text: 'Network error. Please try again.' }))
  }, [token])

  return (
    <main className="section-py">
      <div className="container" style={{ maxWidth: 520 }}>
        <h1 className="page-banner-title">Confirm your email</h1>
        <p role="status" style={{ margin: '1.5rem 0', color: state ? (state.ok ? '#047857' : '#B91C1C') : 'var(--text-muted)' }}>{state?.text ?? 'Confirming…'}</p>
        {state?.ok && <Link className="btn btn-primary" href="/affiliate/login">Sign in to your dashboard</Link>}
      </div>
    </main>
  )
}

export default function AffiliateVerifyPage() {
  return <Suspense fallback={null}><VerifyInner /></Suspense>
}
