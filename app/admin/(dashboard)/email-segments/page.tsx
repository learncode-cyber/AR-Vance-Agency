'use client'

import { useEffect, useState } from 'react'

interface Segment {
  id: string
  name: string
  slug: string
  description: string
  subscriberCount: number
  active: boolean
}

export default function AdminEmailSegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSegments()
  }, [])

  const loadSegments = async () => {
    try {
      const res = await fetch('/api/admin/email-segments')
      if (res.ok) {
        const data = await res.json()
        setSegments(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load segments:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Email Segments</h1>
        <button className="admin-btn admin-btn-primary">+ Create Segment</button>
      </div>

      <div className="admin-content">
        <div className="admin-card">
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading...</p>
          ) : segments.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>
              No segments yet. Create one to target specific subscribers!
            </p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Segment Name</th>
                  <th>Description</th>
                  <th>Subscribers</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((segment) => (
                  <tr key={segment.id}>
                    <td className="font-medium">{segment.name}</td>
                    <td className="text-sm" style={{ color: 'var(--muted)' }}>
                      {segment.description || '—'}
                    </td>
                    <td className="text-center font-mono">{segment.subscriberCount}</td>
                    <td>
                      <span
                        style={{
                          color: segment.active ? '#10B981' : '#F59E0B',
                        }}
                      >
                        {segment.active ? '✓ Active' : '⏸ Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
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

        {/* Info Card */}
        <div className="admin-card" style={{ marginTop: '1rem' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Segment Examples</h3>
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.5rem' }}>
            <li>
              <strong>Active Users:</strong> Subscribers who opened emails in the last 30 days
            </li>
            <li>
              <strong>High Engagement:</strong> Top 20% of subscribers by email interaction
            </li>
            <li>
              <strong>Inactive Users:</strong> No engagement in 60+ days
            </li>
            <li>
              <strong>Converters:</strong> Subscribers who made a purchase
            </li>
            <li>
              <strong>By Location:</strong> Subscribers in specific regions
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
