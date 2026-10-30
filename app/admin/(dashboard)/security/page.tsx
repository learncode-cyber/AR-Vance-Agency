'use client'
import { useState } from 'react';

// Minimal 2FA management. Authenticator apps accept the secret via
// "enter a setup key" — no QR library needed.
export default function AdminSecurityPage() {
  const [setup, setSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null)
  const [code, setCode] = useState('')
  const [backup, setBackup] = useState<string[] | null>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [password, setPassword] = useState('')
  const [disableCode, setDisableCode] = useState('')

  async function call(url: string, body?: unknown) {
    setBusy(true); setMsg('')
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
      const d = await res.json()
      if (!res.ok) { setMsg(d.error ?? 'Request failed'); return null }
      return d
    } catch { setMsg('Network error'); return null } finally { setBusy(false) }
  }

  return (
    <>
      <div className="admin-topbar"><h1 className="admin-topbar-title">Security — Two-Factor Authentication</h1></div>
      <div className="admin-content" style={{ maxWidth: 560 }}>
        {msg && <div className="form-msg form-error-msg" style={{ marginBottom: '1rem' }}>⚠️ {msg}</div>}

        {backup ? (
          <div className="admin-card">
            <h3>2FA enabled ✅</h3>
            <p style={{ color: 'var(--muted)' }}>Save these backup codes now. Each works once and they will not be shown again.</p>
            <pre style={{ fontFamily: 'monospace', lineHeight: 1.8 }}>{backup.join('\n')}</pre>
          </div>
        ) : setup ? (
          <div className="admin-card">
            <p>1. In your authenticator app choose <b>Enter a setup key</b> and paste:</p>
            <code style={{ wordBreak: 'break-all' }}>{setup.secret}</code>
            <p style={{ marginTop: '1rem' }}>2. Enter the 6-digit code it shows:</p>
            <input className="form-input" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
            <button className="admin-btn admin-btn-primary" disabled={busy} style={{ marginTop: '.75rem' }}
              onClick={async () => { const d = await call('/api/admin/2fa/enable', { code }); if (d) setBackup(d.backupCodes) }}>
              Verify & enable
            </button>
          </div>
        ) : (
          <>
            <div className="admin-card" style={{ marginBottom: '1rem' }}>
              <p style={{ color: 'var(--muted)' }}>Add a second step (authenticator app) to your admin login.</p>
              <button className="admin-btn admin-btn-primary" disabled={busy}
                onClick={async () => { const d = await call('/api/admin/2fa/setup'); if (d) setSetup(d) }}>Set up 2FA</button>
            </div>
            <div className="admin-card">
              <h3>Disable 2FA</h3>
              <input className="form-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: '.5rem' }} />
              <input className="form-input" placeholder="Authenticator or backup code" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} />
              <button className="admin-btn" disabled={busy} style={{ marginTop: '.75rem' }}
                onClick={async () => { const d = await call('/api/admin/2fa/disable', { password, code: disableCode }); if (d) setMsg('2FA disabled.') }}>Disable</button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
