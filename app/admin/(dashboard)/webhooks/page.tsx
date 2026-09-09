'use client'

import { useEffect, useState } from 'react'

interface Webhook {
  id: string
  url: string
  event: string
  active: boolean
  deliveredCount: number
  failedCount: number
  lastTriggeredAt?: string
  createdAt: string
}

export default function AdminWebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWebhooks()
  }, [])

  const loadWebhooks = async () => {
    try {
      const res = await fetch('/api/admin/webhooks?limit=50')
      if (res.ok) {
        const data = await res.json()
        setWebhooks(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load webhooks:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Webhooks</h1>
        <button className="admin-btn admin-btn-primary">+ Add Webhook</button>
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
                  Total Webhooks
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{webhooks.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Active
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {webhooks.filter((w) => w.active).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Delivered
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {webhooks.reduce((sum, w) => sum + w.deliveredCount, 0)}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Failed
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#EF4444' }}>
                  {webhooks.reduce((sum, w) => sum + w.failedCount, 0)}
                </div>
              </div>
            </div>

            {/* Webhooks List */}
            <div className="admin-card">
              {webhooks.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No webhooks configured yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {webhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        borderLeft: webhook.active ? '4px solid #10B981' : '4px solid #EF4444',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div>
                          <h4 style={{ fontWeight: '700', margin: 0, marginBottom: '0.25rem' }}>
                            {webhook.event}
                          </h4>
                          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', wordBreak: 'break-all' }}>
                            {webhook.url}
                          </div>
                        </div>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: webhook.active ? '#10B98140' : '#EF444440',
                            color: webhook.active ? '#10B981' : '#EF4444',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {webhook.active ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </div>

                      {/* Stats */}
                      <div
                        style={{
                          display: 'flex',
                          gap: '1.5rem',
                          fontSize: '0.85rem',
                          color: 'var(--muted)',
                          borderTop: '1px solid var(--border)',
                          paddingTop: '0.75rem',
                        }}
                      >
                        <div>✅ {webhook.deliveredCount} delivered</div>
                        <div>❌ {webhook.failedCount} failed</div>
                        <div>
                          Success Rate:{' '}
                          {webhook.deliveredCount + webhook.failedCount > 0
                            ? Math.round(
                                (webhook.deliveredCount / (webhook.deliveredCount + webhook.failedCount)) * 100
                              )
                            : 0}
                          %
                        </div>
                        {webhook.lastTriggeredAt && (
                          <div style={{ marginLeft: 'auto' }}>
                            Last: {new Date(webhook.lastTriggeredAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
