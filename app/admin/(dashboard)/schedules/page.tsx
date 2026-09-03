'use client'

import { useEffect, useState } from 'react'

interface Schedule {
  id: string
  name: string
  action: string
  frequency: string
  enabled: boolean
  running: boolean
  execCount: number
  successCount: number
  failureCount: number
  nextRunAt: string
  lastRunAt?: string
}

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    try {
      const res = await fetch('/api/admin/schedules?limit=50')
      if (res.ok) {
        const data = await res.json()
        setSchedules(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const frequencyIcons: any = {
    once: '⏱️',
    daily: '📅',
    weekly: '📆',
    monthly: '📊',
    custom: '⚙️',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Scheduled Tasks</h1>
        <button className="admin-btn admin-btn-primary">+ Create Schedule</button>
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
                  Total Schedules
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{schedules.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Success Rate
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {schedules.length > 0
                    ? Math.round(
                        (schedules.reduce((sum, s) => sum + s.successCount, 0) /
                          schedules.reduce((sum, s) => sum + s.execCount, 0)) *
                          100
                      ) || 0
                    : 0}
                  %
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Executions
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {schedules.reduce((sum, s) => sum + s.execCount, 0)}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Failed
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#EF4444' }}>
                  {schedules.reduce((sum, s) => sum + s.failureCount, 0)}
                </div>
              </div>
            </div>

            {/* Schedules Table */}
            <div className="admin-card">
              {schedules.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No scheduled tasks yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Frequency</th>
                      <th>Status</th>
                      <th>Success / Failed</th>
                      <th>Next Run</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule) => (
                      <tr key={schedule.id}>
                        <td style={{ fontWeight: '600' }}>
                          {frequencyIcons[schedule.frequency] || '⚙️'} {schedule.name}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{schedule.frequency}</td>
                        <td>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: schedule.enabled ? '#10B98140' : '#EF444440',
                              color: schedule.enabled ? '#10B981' : '#EF4444',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                            }}
                          >
                            {schedule.enabled ? '✓ Enabled' : '✗ Disabled'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                            <span style={{ color: '#10B981' }}>✓ {schedule.successCount}</span>
                            <span style={{ color: '#EF4444' }}>✗ {schedule.failureCount}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                          {new Date(schedule.nextRunAt).toLocaleString()}
                        </td>
                        <td>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#3B82F6',
                              marginRight: '0.5rem',
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#EF4444',
                            }}
                          >
                            🗑️
                          </button>
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
