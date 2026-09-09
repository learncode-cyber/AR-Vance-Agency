'use client'

import { useEffect, useState } from 'react'

interface Client {
  id: string
  name: string
  email: string
  companyName?: string
  industry?: string
  status: string
  totalProjects: number
  totalSpent: number
  published: boolean
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const res = await fetch('/api/admin/clients?limit=50')
      if (res.ok) {
        const data = await res.json()
        setClients(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: any = {
    active: '#10B981',
    inactive: '#F59E0B',
    prospect: '#3B82F6',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Client Management</h1>
        <button className="admin-btn admin-btn-primary">+ Add Client</button>
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
                  Total Clients
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{clients.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Active
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {clients.filter((c) => c.status === 'active').length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Projects
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {clients.reduce((sum, c) => sum + c.totalProjects, 0)}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Revenue
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  ${clients.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(0)}
                </div>
              </div>
            </div>

            {/* Clients List */}
            <div className="admin-card">
              {clients.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No clients yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Email</th>
                      <th>Industry</th>
                      <th>Status</th>
                      <th>Projects</th>
                      <th>Revenue</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id}>
                        <td className="font-medium">{client.companyName || client.name}</td>
                        <td className="font-mono text-sm">{client.email}</td>
                        <td>{client.industry || '—'}</td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              background: statusColors[client.status] + '20',
                              color: statusColors[client.status],
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                            }}
                          >
                            {client.status}
                          </span>
                        </td>
                        <td className="text-center">{client.totalProjects}</td>
                        <td className="font-mono">${client.totalSpent.toFixed(2)}</td>
                        <td>
                          <div className="admin-actions">
                            <button
                              className="admin-btn admin-btn-secondary"
                              style={{ fontSize: '0.8rem' }}
                            >
                              Edit
                            </button>
                          </div>
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
