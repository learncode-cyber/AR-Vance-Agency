'use client'

import { useEffect, useState } from 'react'

interface Consultation {
  id: string
  title: string
  clientName: string
  clientEmail: string
  date: string
  startTime: string
  status: string
  meetingType: string
  meetingLink: string
  rating: number
  createdAt: string
}

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        const url = statusFilter === 'all'
          ? '/api/admin/consultations?limit=50'
          : `/api/admin/consultations?limit=50&status=${statusFilter}`
        
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setConsultations(data.data ?? [])
        }
      } catch (error) {
        console.error('Load error:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [statusFilter])

  const statusColors: any = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    completed: '#10B981',
    cancelled: '#EF4444',
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Consultations</h1>
      </div>

      <div className="admin-content">
        {/* Filter */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className={`admin-btn ${statusFilter === 'all' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({consultations.length})
          </button>
          <button
            className={`admin-btn ${statusFilter === 'confirmed' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => setStatusFilter('confirmed')}
          >
            Confirmed
          </button>
          <button
            className={`admin-btn ${statusFilter === 'completed' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`admin-btn ${statusFilter === 'cancelled' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : consultations.length === 0 ? (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>No consultations found</p>
          </div>
        ) : (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Email</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium">{c.clientName}</td>
                    <td>
                      <a href={`mailto:${c.clientEmail}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                        {c.clientEmail}
                      </a>
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>
                      {formatDate(c.date)}
                    </td>
                    <td>
                      {c.meetingType === 'zoom' && '🎥'}
                      {c.meetingType === 'google-meet' && '📹'}
                      {c.meetingType === 'phone' && '☎️'}
                      {' '}
                      {c.meetingType}
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: statusColors[c.status],
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>
                      {c.rating > 0 ? '⭐'.repeat(Math.round(c.rating)) : '—'}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button 
                          className="admin-btn admin-btn-secondary"
                          onClick={() => {
                            if (c.meetingLink) window.open(c.meetingLink, '_blank')
                          }}
                        >
                          Join
                        </button>
                        <button className="admin-btn admin-btn-secondary">
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
