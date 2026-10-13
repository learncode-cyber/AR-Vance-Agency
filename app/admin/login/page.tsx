'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import PasswordInput from '@/components/ui/PasswordInput'

export default function AdminLoginPage() {
  const router = useRouter()
  const pathname = usePathname()
  // The browser is already on /{admin_path}/login when this page renders,
  // so the current URL's first segment IS that slug — deriving it here
  // avoids ever putting the configured admin path into client JS.
  const adminRoot = `/${pathname?.split('/')[1] || 'admin'}`
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [needsCode, setNeedsCode] = useState(false)
  const [totp, setTotp]         = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...(needsCode && totp ? { totp } : {}) }),
      })
      if (res.ok) {
        router.push(adminRoot)
        router.refresh()
      } else {
        const d = await res.json()
        if (d.twoFactorRequired) setNeedsCode(true)
        setError(d.twoFactorRequired && !totp ? '' : (d.error ?? 'Login failed.'))
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login" data-theme="dark">
      <div className="admin-login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display,Syne,sans-serif)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--fg)' }}>
            Digital<span style={{ color: 'var(--primary)' }}>Arch</span>
          </div>
          <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '.4rem' }}>Admin Panel</p>
        </div>

        {error && <div className="form-msg form-error-msg" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <PasswordInput value={password} onChange={setPassword} placeholder="••••••••" required />
          </div>
          {needsCode && (
            <div className="form-group">
              <label className="form-label">Authentication code</label>
              <input className="form-input" inputMode="numeric" autoComplete="one-time-code" required value={totp} onChange={e => setTotp(e.target.value)} placeholder="123456 or backup code" autoFocus />
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '.5rem' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
