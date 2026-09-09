'use client'

import { useEffect, useState } from 'react'

interface ActivityLog {
  id: string
  userName: string
  userEmail: string
  action: string
  actionType: string
  resourceName: string
  createdAt: string
}

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      const res = await fetch('/api/admin/activity-logs?limit=50')
      if (res.ok) {
        const data = await res.json()
        setLogs(data.data)
      }
    } catch (error) {
      console.error('Failed to load logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const actionColors: any = {
    page_updated: '#3B82F6',
    page_created: '#10B981',
    page_deleted: '#EF4444',
    content_updated: '#8B5CF6',
    user_created: '#10B981',
    user_updated: '#3B82F6',
    user_deleted: '#EF4444',
    role_assigned: '#F59E0B',
    role_removed: '#F59E0B',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Activity Logs & Audit Trail</h1>
      </div>

      <div className="admin-content">
        <div className="admin-card">
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading...</p>
          ) : logs.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No activity logged yet</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Type</th>
                  <th>Resource</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div>
                        <strong>{log.userName}</strong>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                          {log.userEmail}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: (actionColors[log.action] || '#3B82F6') + '20',
                          color: actionColors[log.action] || '#3B82F6',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="font-mono text-sm">{log.actionType}</td>
                    <td className="font-medium">{log.resourceName}</td>
                    <td style={{ fontSize: '0.9rem' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Info Card */}
        <div className="admin-card" style={{ marginTop: '1rem' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Activity Tracking</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            All user actions are logged automatically for security and accountability:
          </p>
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.5rem' }}>
            <li>Page creation and updates</li>
            <li>Content modifications</li>
            <li>User role assignments</li>
            <li>Permission changes</li>
            <li>Team member actions</li>
            <li>Settings modifications</li>
          </ul>
        </div>
      </div>
    </>
  )
}
