'use client'

import { useEffect, useState } from 'react'

interface APIKey {
  id: string
  name: string
  key: string
  lastUsedAt?: string
  callCount: number
  active: boolean
  createdAt: string
}

export default function AdminAPIKeysPage() {
  const [keys, setKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    loadKeys()
  }, [])

  const loadKeys = async () => {
    try {
      const res = await fetch('/api/admin/api-keys?limit=50')
      if (res.ok) {
        const data = await res.json()
        setKeys(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">API Keys</h1>
        <button className="admin-btn admin-btn-primary">+ Create New Key</button>
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
                  Total Keys
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{keys.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Active Keys
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {keys.filter((k) => k.active).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Calls
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {keys.reduce((sum, k) => sum + k.callCount, 0)}
                </div>
              </div>
            </div>

            {/* Keys Table */}
            <div className="admin-card">
              {keys.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No API keys yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Key</th>
                      <th>Calls</th>
                      <th>Status</th>
                      <th>Last Used</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((key) => (
                      <tr key={key.id}>
                        <td style={{ fontWeight: '600' }}>{key.name}</td>
                        <td className="font-mono" style={{ fontSize: '0.85rem', maxWidth: '200px' }}>
                          {key.key.substring(0, 20)}...
                          <button
                            onClick={() => copyKey(key.key)}
                            style={{
                              marginLeft: '0.5rem',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: copied === key.key ? '#10B981' : '#3B82F6',
                            }}
                          >
                            {copied === key.key ? '✓ Copied' : '📋'}
                          </button>
                        </td>
                        <td className="text-center">{key.callCount}</td>
                        <td>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: key.active ? '#10B98140' : '#EF444440',
                              color: key.active ? '#10B981' : '#EF4444',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                            }}
                          >
                            {key.active ? '✓ Active' : '✗ Inactive'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                          {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#EF4444',
                              fontSize: '1rem',
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
