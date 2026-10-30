'use client'
import { useState } from 'react'

export default function SeoAuditForm({ auditType = 'seo' }: { auditType?: 'seo' | 'marketing' | 'business' }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true); setMsg(null)
    const f = new FormData(e.currentTarget)
    const body = { ...Object.fromEntries(f.entries()), auditType }
    try {
      const res = await fetch('/api/seo-audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json().catch(() => ({}))
      if (res.ok) { setMsg({ ok: true, text: json.message }); e.currentTarget.reset() }
      else setMsg({ ok: false, text: json.error ?? 'Something went wrong.' })
    } catch {
      setMsg({ ok: false, text: 'Network error. Please try again.' })
    } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: '.85rem' }} noValidate={false}>
      <input className="form-input" name="name" required minLength={2} placeholder="Your name" />
      <input className="form-input" name="email" type="email" required placeholder="Email address" />
      <input className="form-input" name="phone" placeholder="Phone (optional)" />
      <input className="form-input" name="website" required placeholder="Your website, e.g. example.com" />
      <input className="form-input" name="company" placeholder="Company (optional)" />
      <textarea className="form-input" name="goal" rows={3} placeholder="What do you want more of? (optional)" />
      <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Sending…' : 'Request my free audit'}</button>
      {msg && <p role="status" style={{ color: msg.ok ? '#047857' : '#B91C1C' }}>{msg.text}</p>}
    </form>
  )
}
