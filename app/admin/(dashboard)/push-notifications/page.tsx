'use client'

import { useEffect, useState } from 'react'

interface PushNotification {
  id: string
  title: string
  body: string
  status: string
  sentCount: number
  readCount: number
  sentAt: string | null
  createdAt: string
}

export default function AdminPushNotificationsPage() {
  const [notifications, setNotifications] = useState<PushNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/admin/push-notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.data)
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async () => {
    if (!title || !body) {
      alert('Please fill in title and body')
      return
    }

    setSending(true)

    try {
      const res = await fetch('/api/admin/push-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          deviceIds: 'all',
        }),
      })

      if (res.ok) {
        alert('Notification queued successfully!')
        setTitle('')
        setBody('')
        loadNotifications()
      } else {
        alert('Failed to send notification')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error sending notification')
    }

    setSending(false)
  }

  const statusColors: any = {
    pending: '#F59E0B',
    sending: '#3B82F6',
    sent: '#10B981',
    failed: '#EF4444',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Push Notifications</h1>
      </div>

      <div className="admin-content">
        {/* Send Notification Form */}
        <div className="admin-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Send Notification</h3>

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Title</label>
            <input
              className="form-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Message</label>
            <textarea
              className="form-input"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Notification message"
              rows={4}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <button
            onClick={handleSendNotification}
            disabled={sending}
            className="admin-btn admin-btn-primary"
          >
            {sending ? '⏳ Sending...' : '📤 Send to All Devices'}
          </button>
        </div>

        {/* Notification History */}
        <div className="admin-card">
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Recent Notifications</h3>

          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading...</p>
          ) : notifications.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No notifications sent yet</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Read</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notif) => (
                  <tr key={notif.id}>
                    <td className="font-medium">{notif.title}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: statusColors[notif.status],
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                        }}
                      >
                        {notif.status}
                      </span>
                    </td>
                    <td>{notif.sentCount}</td>
                    <td>{notif.readCount}</td>
                    <td style={{ fontSize: '0.9rem' }}>
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
