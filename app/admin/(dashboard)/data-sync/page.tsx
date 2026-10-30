'use client'

import { useEffect, useState } from 'react'

interface DataSync {
  id: string
  sourceType: string
  destinationType: string
  frequency: string
  status: string
  totalSynced: number
  lastSyncCount: number
  active: boolean
  createdAt: string
}

export default function AdminDataSyncPage() {
  const [syncs, setSyncs] = useState<DataSync[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSyncs()
  }, [])

  const loadSyncs = async () => {
    try {
      const res = await fetch('/api/admin/data-sync?limit=50')
      if (res.ok) {
        const data = await res.json()
        setSyncs(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load data syncs:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusIcons: any = {
    idle: '⏸️',
    syncing: '🔄',
    error: '❌',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Data Sync</h1>
        <button className="admin-btn admin-btn-primary">+ New Sync</button>
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
                  Total Syncs
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{syncs.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Active
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {syncs.filter((s) => s.active).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Records
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {syncs.reduce((sum, s) => sum + s.totalSynced, 0)}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Syncing
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  {syncs.filter((s) => s.status === 'syncing').length}
                </div>
              </div>
            </div>

            {/* Syncs List */}
            <div className="admin-card">
              {syncs.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No data syncs configured yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {syncs.map((sync) => (
                    <div
                      key={sync.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        borderLeft: sync.active ? '4px solid #10B981' : '4px solid #666',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <h4 style={{ fontWeight: '700', margin: 0, marginBottom: '0.25rem' }}>
                          {statusIcons[sync.status]} {sync.sourceType} → {sync.destinationType}
                        </h4>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: sync.active ? '#10B98140' : '#66666640',
                              color: sync.active ? '#10B981' : '#666',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                            }}
                          >
                            {sync.active ? '✓ Active' : '✗ Inactive'}
                          </span>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: '#F59E0B40',
                              color: '#F59E0B',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              textTransform: 'capitalize',
                            }}
                          >
                            {sync.frequency}
                          </span>
                        </div>
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
                        <div>📊 Total: {sync.totalSynced} records</div>
                        <div>Last: {sync.lastSyncCount} records</div>
                        <div>Status: {sync.status}</div>
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
