'use client'

import { useEffect, useState } from 'react'

interface Integration {
  id: string
  name: string
  type: string
  category: string
  active: boolean
  connected: boolean
  connectedAt?: string
  requestCount: number
  createdAt: string
}

export default function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      const res = await fetch('/api/admin/integrations?limit=100')
      if (res.ok) {
        const data = await res.json()
        setIntegrations(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const typeColors: any = {
    slack: '#36C5F0',
    discord: '#5865F2',
    'google-ads': '#4285F4',
    facebook: '#1877F2',
    zapier: '#FF5C35',
    webhook: '#666666',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Integrations Hub</h1>
        <button className="admin-btn admin-btn-primary">+ Add Integration</button>
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
                  Total Integrations
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{integrations.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Connected
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {integrations.filter((i) => i.connected).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Active
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {integrations.filter((i) => i.active).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Requests
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  {integrations.reduce((sum, i) => sum + i.requestCount, 0)}
                </div>
              </div>
            </div>

            {/* Integrations Grid */}
            <div className="admin-card">
              {integrations.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No integrations configured yet.</p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {integrations.map((integration) => (
                    <div
                      key={integration.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        borderTop: `4px solid ${typeColors[integration.type] || '#666'}`,
                      }}
                    >
                      <div style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              background: `${typeColors[integration.type] || '#666'}40`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                            }}
                          >
                            🔌
                          </div>
                          <div>
                            <h3 style={{ fontWeight: '700', margin: 0, textTransform: 'capitalize' }}>
                              {integration.name}
                            </h3>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                              {integration.type}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            marginBottom: '1rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: integration.active ? '#10B98140' : '#EF444440',
                              color: integration.active ? '#10B981' : '#EF4444',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                            }}
                          >
                            {integration.active ? '✓ Active' : '✗ Inactive'}
                          </span>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: integration.connected ? '#3B82F640' : '#F59E0B40',
                              color: integration.connected ? '#3B82F6' : '#F59E0B',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                            }}
                          >
                            {integration.connected ? '✓ Connected' : '⏳ Pending'}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: '0.9rem',
                            color: 'var(--muted)',
                            borderTop: '1px solid var(--border)',
                            paddingTop: '0.75rem',
                            marginTop: '0.75rem',
                          }}
                        >
                          <div>📊 {integration.requestCount} requests</div>
                          <div>📅 {new Date(integration.createdAt).toLocaleDateString()}</div>
                        </div>

                        <button
                          style={{
                            width: '100%',
                            marginTop: '1rem',
                            padding: '0.5rem',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          Configure
                        </button>
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
