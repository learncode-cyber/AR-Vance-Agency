'use client'

import { useEffect, useState } from 'react'

interface SecurityPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecial: boolean
  expiryDays: number
  sessionTimeout: number
  twoFactorRequired: boolean
}

export default function AdminSecurityPage() {
  const [policy, setPolicy] = useState<SecurityPolicy | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPolicy()
  }, [])

  const loadPolicy = async () => {
    try {
      const res = await fetch('/api/admin/security-policies')
      if (res.ok) {
        const data = await res.json()
        setPolicy(data.data)
      }
    } catch (error) {
      console.error('Failed to load security policy:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Security Settings</h1>
        <button className="admin-btn admin-btn-primary">Save Changes</button>
      </div>

      <div className="admin-content">
        {loading || !policy ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Password Policy */}
            <div className="admin-card">
              <h3>🔐 Password Policy</h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Minimum Length
                </label>
                <input
                  type="number"
                  defaultValue={policy.minLength}
                  min="8"
                  max="32"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={policy.requireUppercase} />
                  <span>Require uppercase letters</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={policy.requireLowercase} />
                  <span>Require lowercase letters</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={policy.requireNumbers} />
                  <span>Require numbers</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={policy.requireSpecial} />
                  <span>Require special characters</span>
                </label>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Password Expiry (days)
                </label>
                <input
                  type="number"
                  defaultValue={policy.expiryDays}
                  min="0"
                  max="365"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            </div>

            {/* Session Policy */}
            <div className="admin-card">
              <h3>👤 Session & Access Policy</h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Session Timeout (seconds)
                </label>
                <input
                  type="number"
                  defaultValue={policy.sessionTimeout}
                  min="300"
                  max="86400"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={policy.twoFactorRequired} />
                  <span>Require 2-Factor Authentication</span>
                </label>
              </div>

              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid #10B981',
                  borderRadius: '4px',
                  marginTop: '1rem',
                }}
              >
                <strong style={{ color: '#10B981' }}>✓ Current Status:</strong>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
                  {policy.twoFactorRequired ? '2FA Required' : '2FA Optional'}
                </p>
              </div>
            </div>

            {/* Security Alerts */}
            <div className="admin-card">
              <h3>🚨 Security Alerts</h3>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    padding: '1rem',
                    background: '#EF444440',
                    border: '1px solid #EF4444',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#EF4444', marginBottom: '0.5rem' }}>
                    ⚠️ Critical
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Failed login attempts: 3 in last hour</p>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    background: '#F59E0B40',
                    border: '1px solid #F59E0B',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#F59E0B', marginBottom: '0.5rem' }}>
                    ⚠️ Warning
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>1 account locked due to failed attempts</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
