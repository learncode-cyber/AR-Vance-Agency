'use client'

import { useEffect, useState } from 'react'

interface Backup {
  id: string
  name: string
  backupType: string
  scope: string
  status: string
  sizeBytes: number
  encrypted: boolean
  createdAt: string
  completedAt?: string
}

export default function AdminBackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBackups()
  }, [])

  const loadBackups = async () => {
    try {
      const res = await fetch('/api/admin/backups?limit=50')
      if (res.ok) {
        const data = await res.json()
        setBackups(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load backups:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Backups</h1>
        <button className="admin-btn admin-btn-primary">+ Create Backup</button>
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
                  Total Backups
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{backups.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Size
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3B82F6' }}>
                  {formatBytes(backups.reduce((sum, b) => sum + b.sizeBytes, 0))}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Success Rate
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {backups.length > 0
                    ? Math.round((backups.filter((b) => b.status === 'success').length / backups.length) * 100)
                    : 0}
                  %
                </div>
              </div>
            </div>

            {/* Backups Table */}
            <div className="admin-card">
              {backups.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No backups yet. Create your first backup!</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Scope</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Encrypted</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((backup) => (
                      <tr key={backup.id}>
                        <td style={{ fontWeight: '600' }}>💾 {backup.name}</td>
                        <td style={{ textTransform: 'capitalize' }}>{backup.backupType}</td>
                        <td style={{ textTransform: 'capitalize' }}>{backup.scope}</td>
                        <td>{formatBytes(backup.sizeBytes)}</td>
                        <td>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              background:
                                backup.status === 'success'
                                  ? '#10B98140'
                                  : backup.status === 'running'
                                    ? '#3B82F640'
                                    : '#EF444440',
                              color:
                                backup.status === 'success'
                                  ? '#10B981'
                                  : backup.status === 'running'
                                    ? '#3B82F6'
                                    : '#EF4444',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                            }}
                          >
                            {backup.status === 'success' && '✓'}
                            {backup.status === 'running' && '⏳'}
                            {backup.status === 'failed' && '✗'} {backup.status}
                          </span>
                        </td>
                        <td>{backup.encrypted ? '🔒 Yes' : 'No'}</td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                          {new Date(backup.createdAt).toLocaleDateString()}
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
                            ↓
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
