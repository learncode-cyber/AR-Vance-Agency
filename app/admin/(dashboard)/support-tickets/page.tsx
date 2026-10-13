'use client'

import { useEffect, useState } from 'react'

interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  customerName: string
  customerEmail: string
  priority: string
  status: string
  createdAt: string
}

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      const res = await fetch('/api/admin/support-tickets')
      if (res.ok) {
        const data = await res.json()
        setTickets(data.data)
      }
    } catch (error) {
      console.error('Failed to load tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const priorityColors: any = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    urgent: '#8B5CF6',
  }

  const statusColors: any = {
    open: '#3B82F6',
    in_progress: '#F59E0B',
    waiting_customer: '#6B7280',
    resolved: '#10B981',
    closed: '#9CA3AF',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Support Tickets</h1>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : tickets.length === 0 ? (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>No support tickets yet</p>
          </div>
        ) : (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Subject</th>
                  <th>Customer</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="font-mono font-medium">{ticket.ticketNumber}</td>
                    <td>{ticket.subject}</td>
                    <td>{ticket.customerName}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: priorityColors[ticket.priority],
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                        }}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: statusColors[ticket.status],
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                        }}
                      >
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                          View
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
