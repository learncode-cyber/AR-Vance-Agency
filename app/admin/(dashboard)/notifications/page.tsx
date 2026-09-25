'use client'

import { useEffect, useState } from 'react'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    loadNotifications()
  }, [filter])

  const loadNotifications = async () => {
    try {
      const url = filter === 'unread' ? '/api/admin/notifications?unreadOnly=true' : '/api/admin/notifications'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const typeIcons: any = {
    like: '❤️',
    comment: '💬',
    follow: '👤',
    mention: '📢',
    message: '📧',
    system: '⚙️',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Notifications</h1>
      </div>

      <div className="admin-content">
        {/* Filter */}
        <div className="admin-card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.5rem 1rem',
                  background: filter === f ? 'var(--primary)' : 'var(--border)',
                  color: filter === f ? 'white' : 'var(--text)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: filter === f ? '700' : '400',
                }}
              >
                {f === 'all' ? 'All Notifications' : 'Unread Only'}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="admin-card">
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading...</p>
          ) : notifications.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    padding: '1rem',
                    background: notif.read ? 'transparent' : 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    borderLeft: notif.read ? '4px solid var(--border)' : '4px solid var(--primary)',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'start',
                  }}
                >
                  <div style={{ fontSize: '1.5rem' }}>
                    {typeIcons[notif.type] || '🔔'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: '700', margin: 0, marginBottom: '0.25rem' }}>
                      {notif.title}
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0, marginBottom: '0.5rem' }}>
                      {notif.message}
                    </p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {!notif.read && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          display: 'inline-block',
                        }}
                      />
                    )}
                    <button
                      className="admin-btn admin-btn-secondary"
                      style={{ fontSize: '0.8rem' }}
                    >
                      {notif.read ? 'Unmark' : 'Mark Read'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
