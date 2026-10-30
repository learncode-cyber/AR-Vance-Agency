'use client'

import { useEffect, useState } from 'react'

interface Dashboard {
  id: string
  name: string
  type: string
  theme: string
  isPublic: boolean
  viewCount: number
  active: boolean
  lastViewedAt?: string
  createdAt: string
}

export default function AdminDashboardsPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboards()
  }, [])

  const loadDashboards = async () => {
    try {
      const res = await fetch('/api/admin/dashboards?limit=50')
      if (res.ok) {
        const data = await res.json()
        setDashboards(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load dashboards:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Dashboards</h1>
        <button className="admin-btn admin-btn-primary">+ New Dashboard</button>
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
                  Total Dashboards
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{dashboards.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Public
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {dashboards.filter((d) => d.isPublic).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Views
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {dashboards.reduce((sum, d) => sum + d.viewCount, 0)}
                </div>
              </div>
            </div>

            {/* Dashboards Grid */}
            <div className="admin-card">
              {dashboards.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No dashboards yet. Create your first dashboard!</p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {dashboards.map((dashboard) => (
                    <div
                      key={dashboard.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            background: dashboard.isPublic ? '#10B981' : '#666',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                          }}
                        >
                          {dashboard.isPublic ? '🌐 Public' : '🔒 Private'}
                        </div>
                      </div>

                      <div style={{ padding: '1rem' }}>
                        <h3 style={{ fontWeight: '700', margin: 0, marginBottom: '0.25rem' }}>
                          {dashboard.name}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                          {dashboard.type} • {dashboard.viewCount} views
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            fontSize: '0.8rem',
                            color: 'var(--muted)',
                            borderTop: '1px solid var(--border)',
                            paddingTop: '0.75rem',
                          }}
                        >
                          <span>{dashboard.active ? '✓ Active' : '✗ Inactive'}</span>
                          {dashboard.lastViewedAt && (
                            <span style={{ marginLeft: 'auto' }}>
                              {new Date(dashboard.lastViewedAt).toLocaleDateString()}
                            </span>
                          )}
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
                          Open
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
