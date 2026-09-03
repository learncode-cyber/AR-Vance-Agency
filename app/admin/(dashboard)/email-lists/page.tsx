'use client'

import { useEffect, useState } from 'react'

interface EmailList {
  id: string
  name: string
  slug: string
  fromEmail: string
  subscriberCount: number
  unsubscriberCount: number
  active: boolean
}

export default function AdminEmailListsPage() {
  const [lists, setLists] = useState<EmailList[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLists()
  }, [])

  const loadLists = async () => {
    try {
      const res = await fetch('/api/admin/email-lists')
      if (res.ok) {
        const data = await res.json()
        setLists(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load lists:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Email Lists</h1>
        <button className="admin-btn admin-btn-primary">+ Create List</button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem',
            }}
          >
            {lists.map((list) => (
              <div key={list.id} className="admin-card">
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontWeight: '700', margin: 0, marginBottom: '0.25rem' }}>
                    {list.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>
                    {list.fromEmail}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Subscribers</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10B981' }}>
                      {list.subscriberCount}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Unsubscribed</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#EF4444' }}>
                      {list.unsubscriberCount}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="admin-btn admin-btn-primary"
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  >
                    View
                  </button>
                  <button
                    className="admin-btn admin-btn-secondary"
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
