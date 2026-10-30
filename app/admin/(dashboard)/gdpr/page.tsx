'use client'

import { useEffect, useState } from 'react'

interface GDPRRequest {
  id: string
  email: string
  type: string
  status: string
  deadline: string
  createdAt: string
}

export default function AdminGDPRPage() {
  const [requests, setRequests] = useState<GDPRRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const res = await fetch('/api/admin/gdpr-requests?limit=50')
      if (res.ok) {
        const data = await res.json()
        setRequests(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load GDPR requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const typeIcons: any = {
    access: '👁️',
    deletion: '🗑️',
    portability: '📦',
    rectification: '✏️',
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">GDPR Requests</h1>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : (
          <>
            {/* Info Box */}
            <div
              style={{
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid #3B82F6',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              <strong>📋 GDPR Data Requests:</strong>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--text)' }}>
                All requests must be processed within 30 days. Track status and ensure compliance.
              </p>
            </div>

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
                  Total Requests
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{requests.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Pending
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  {requests.filter((r) => r.status === 'pending').length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Completed
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {requests.filter((r) => r.status === 'completed').length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Overdue
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#EF4444' }}>
                  {requests.filter((r) => isOverdue(r.deadline)).length}
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="admin-card">
              {requests.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No GDPR requests.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Deadline</th>
                      <th>Days Left</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => {
                      const daysLeft = Math.ceil(
                        (new Date(request.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      )

                      return (
                        <tr key={request.id}>
                          <td>
                            <span style={{ marginRight: '0.5rem' }}>
                              {typeIcons[request.type] || '📋'}
                            </span>
                            {request.type}
                          </td>
                          <td>{request.email}</td>
                          <td>
                            <span
                              style={{
                                padding: '0.25rem 0.75rem',
                                background:
                                  request.status === 'completed'
                                    ? '#10B98140'
                                    : request.status === 'pending'
                                      ? '#F59E0B40'
                                      : '#EF444440',
                                color:
                                  request.status === 'completed'
                                    ? '#10B981'
                                    : request.status === 'pending'
                                      ? '#F59E0B'
                                      : '#EF4444',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                              }}
                            >
                              {request.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                            {new Date(request.deadline).toLocaleDateString()}
                          </td>
                          <td>
                            <span
                              style={{
                                padding: '0.25rem 0.75rem',
                                background: daysLeft < 0 ? '#EF444440' : '#10B98140',
                                color: daysLeft < 0 ? '#EF4444' : '#10B981',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                              }}
                            >
                              {daysLeft < 0 ? `⚠️ ${Math.abs(daysLeft)} overdue` : `✓ ${daysLeft} days`}
                            </span>
                          </td>
                          <td>
                            <button
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#3B82F6',
                              }}
                            >
                              ✏️
                            </button>
                          </td>
                        </tr>
                      )
                    })}
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
