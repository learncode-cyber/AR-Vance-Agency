'use client'

import { useEffect, useState } from 'react'

interface EmailAutomation {
  id: string
  name: string
  subject: string
  triggerType: string
  enabled: boolean
  sentCount: number
  openCount: number
  clickCount: number
  createdAt: string
}

export default function AdminEmailAutomationPage() {
  const [automations, setAutomations] = useState<EmailAutomation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAutomations()
  }, [])

  const loadAutomations = async () => {
    try {
      const res = await fetch('/api/admin/email-automation?limit=50')
      if (res.ok) {
        const data = await res.json()
        setAutomations(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load automations:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerIcons: any = {
    signup: '👤',
    abandoned_cart: '🛒',
    purchase: '💳',
    welcome: '👋',
    follow_up: '📧',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Email Automation</h1>
        <button className="admin-btn admin-btn-primary">+ Create Automation</button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : (
          <>
            {/* Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Automations
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{automations.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Sent
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {automations.reduce((sum, a) => sum + a.sentCount, 0)}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Avg Open Rate
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {automations.length > 0
                    ? Math.round(
                        (automations.reduce((sum, a) => sum + (a.openCount / a.sentCount || 0), 0) /
                          automations.length) *
                          100
                      ) || 0
                    : 0}
                  %
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Avg Click Rate
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  {automations.length > 0
                    ? Math.round(
                        (automations.reduce((sum, a) => sum + (a.clickCount / a.sentCount || 0), 0) /
                          automations.length) *
                          100
                      ) || 0
                    : 0}
                  %
                </div>
              </div>
            </div>

            {/* Automations Table */}
            <div className="admin-card">
              {automations.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No email automations yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Trigger</th>
                      <th>Status</th>
                      <th>Sent / Opened / Clicked</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {automations.map((automation) => (
                      <tr key={automation.id}>
                        <td style={{ fontWeight: '600' }}>
                          {triggerIcons[automation.triggerType as keyof typeof triggerIcons] || '📧'}{' '}
                          {automation.name}
                        </td>
                        <td style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>
                          {automation.triggerType.replace(/_/g, ' ')}
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: automation.enabled ? '#10B98140' : '#EF444440',
                              color: automation.enabled ? '#10B981' : '#EF4444',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                            }}
                          >
                            {automation.enabled ? '✓ Active' : '✗ Inactive'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                            <span>{automation.sentCount}</span>
                            <span style={{ color: '#3B82F6' }}>👁️ {automation.openCount}</span>
                            <span style={{ color: '#F59E0B' }}>🔗 {automation.clickCount}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                          {new Date(automation.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#3B82F6',
                              marginRight: '0.5rem',
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#EF4444',
                            }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
