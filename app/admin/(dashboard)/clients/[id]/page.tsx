'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Project {
  id: string
  name: string
  status: string
  budget: number
  category: string
  startDate?: string
}

interface ClientData {
  id: string
  name: string
  email: string
  phone: string
  company: string
  logo: string
  industry: string
  status: string
  priority: string
  rating: number
  budget: number
  totalSpent: number
  businessNeeds: string
  notes: string
  projects: Project[]
  createdAt: string
  updatedAt: string
}

export default function ClientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/clients/${clientId}`)
        if (res.ok) {
          const json = await res.json()
          setClient(json.data)
        }
      } catch (error) {
        console.error('Load error:', error)
      }
      setLoading(false)
    }

    load()
  }, [clientId])

  if (loading) {
    return <div className="admin-content">Loading…</div>
  }

  if (!client) {
    return <div className="admin-content">Client not found</div>
  }

  const priorityColor: any = {
    low: '#999',
    medium: '#FFB800',
    high: '#FF6B35',
    vip: '#FF1744',
  }

  const statusColor: any = {
    active: '#10B981',
    prospect: '#3B82F6',
    inactive: '#EF4444',
  }

  return (
    <>
      <div className="admin-topbar">
        <button onClick={() => router.back()} style={{ marginRight: '1rem' }}>
          ← Back
        </button>
        <h1 className="admin-topbar-title">{client.name}</h1>
      </div>

      <div className="admin-content">
        {/* Header Card */}
        <div
          className="admin-card"
          style={{
            display: 'grid',
            gridTemplateColumns: '150px 1fr',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          {client.logo && (
            <img
              src={client.logo}
              alt={client.name}
              style={{
                width: '150px',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          )}

          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{client.name}</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
              {client.company} • {client.industry}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Status</p>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    background: statusColor[client.status],
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                  }}
                >
                  {client.status}
                </span>
              </div>

              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Priority</p>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    background: priorityColor[client.priority],
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                  }}
                >
                  {client.priority}
                </span>
              </div>

              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Rating</p>
                <p style={{ fontSize: '1.1rem' }}>
                  {client.rating > 0 ? '⭐'.repeat(Math.round(client.rating)) : '—'}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Total Spent</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  ${client.totalSpent.toLocaleString()}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Avg Budget</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  ${client.budget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>Contact Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Email</p>
              <a href={`mailto:${client.email}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                {client.email}
              </a>
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Phone</p>
              <a href={`tel:${client.phone}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                {client.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="admin-card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>
            Projects ({client.projects.length})
          </h3>

          {client.projects.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No projects yet</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Budget</th>
                  <th>Started</th>
                </tr>
              </thead>
              <tbody>
                {client.projects.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name}</td>
                    <td>{p.category}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          background: p.status === 'completed' ? '#10B981' : '#F59E0B',
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td>${p.budget.toLocaleString()}</td>
                    <td>{p.startDate ? new Date(p.startDate).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Business Needs */}
        {client.businessNeeds && (
          <div className="admin-card" style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: '700' }}>Business Needs</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{client.businessNeeds}</p>
          </div>
        )}

        {/* Internal Notes */}
        {client.notes && (
          <div className="admin-card" style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: '700' }}>Internal Notes</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--muted)' }}>{client.notes}</p>
          </div>
        )}

        {/* Edit Button */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => router.push(`/admin/clients`)}
          >
            ← Back to Clients
          </button>
        </div>
      </div>
    </>
  )
}
