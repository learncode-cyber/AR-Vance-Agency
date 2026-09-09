'use client'

import { useEffect, useState } from 'react'

interface AuditTrail {
  id: string
  action: string
  entityType: string
  entityId: string
  userName: string
  description: string
  status: string
  ipAddress: string
  createdAt: string
}

export default function AdminAuditLogsPage() {
  const [trails, setTrails] = useState<AuditTrail[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrails()
  }, [])

  const loadTrails = async () => {
    try {
      const res = await fetch('/api/admin/audit-trails?limit=100')
      if (res.ok) {
        const data = await res.json()
        setTrails(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load audit trails:', error)
    } finally {
      setLoading(false)
    }
  }

  const actionIcons: any = {
    create: '➕',
    read: '👁️',
    update: '✏️',
    delete: '🗑️',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Audit Logs</h1>
        <button className="admin-btn admin-btn-primary">Export Logs</button>
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
                  Total Logs
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{trails.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Success Rate
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {trails.length > 0
                    ? Math.round((trails.filter((t) => t.status === 'success').length / trails.length) * 100)
                    : 0}
                  %
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Failed Operations
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#EF4444' }}>
                  {trails.filter((t) => t.status === 'failure').length}
                </div>
              </div>
            </div>

            {/* Audit Table */}
            <div className="admin-card">
              {trails.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No audit logs yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>User</th>
                      <th>Entity</th>
                      <th>IP Address</th>
                      <th>Status</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trails.map((trail) => (
                      <tr key={trail.id}>
                        <td>
                          <span style={{ marginRight: '0.5rem' }}>
                            {actionIcons[trail.action] || '📋'}
                          </span>
                          {trail.action.toUpperCase()}
                        </td>
                        <td style={{ fontWeight: '600' }}>{trail.userName}</td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                          {trail.entityType} ({trail.entityId})
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {trail.ipAddress}
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              background:
                                trail.status === 'success'
                                  ? '#10B98140'
                                  : '#EF444440',
                              color:
                                trail.status === 'success'
                                  ? '#10B981'
                                  : '#EF4444',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                            }}
                          >
                            {trail.status === 'success' ? '✓' : '✗'} {trail.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                          {new Date(trail.createdAt).toLocaleString()}
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
