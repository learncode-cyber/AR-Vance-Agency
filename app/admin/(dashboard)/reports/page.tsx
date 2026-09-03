'use client'

import { useEffect, useState } from 'react'

interface Report {
  id: string
  name: string
  type: string
  dataSource: string
  viewCount: number
  scheduled: boolean
  active: boolean
  lastGeneratedAt?: string
  createdAt: string
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      const res = await fetch('/api/admin/reports?limit=50')
      if (res.ok) {
        const data = await res.json()
        setReports(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const typeIcons: any = {
    sales: '💰',
    analytics: '📊',
    customers: '👥',
    revenue: '📈',
    operations: '⚙️',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Reports</h1>
        <button className="admin-btn admin-btn-primary">+ Create Report</button>
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
                  Total Reports
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{reports.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Active
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {reports.filter((r) => r.active).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Scheduled
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {reports.filter((r) => r.scheduled).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Views
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  {reports.reduce((sum, r) => sum + r.viewCount, 0)}
                </div>
              </div>
            </div>

            {/* Reports Table */}
            <div className="admin-card">
              {reports.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No reports yet. Create your first report!</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Source</th>
                      <th>Views</th>
                      <th>Status</th>
                      <th>Last Generated</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td style={{ fontWeight: '600' }}>
                          {typeIcons[report.type as keyof typeof typeIcons] || '📋'} {report.name}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{report.type}</td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{report.dataSource}</td>
                        <td className="text-center">{report.viewCount}</td>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.25rem',
                              fontSize: '0.8rem',
                            }}
                          >
                            <span
                              style={{
                                padding: '0.25rem 0.5rem',
                                background: report.active ? '#10B98140' : '#EF444440',
                                color: report.active ? '#10B981' : '#EF4444',
                                borderRadius: '4px',
                              }}
                            >
                              {report.active ? '✓' : '✗'}
                            </span>
                            {report.scheduled && (
                              <span
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  background: '#3B82F640',
                                  color: '#3B82F6',
                                  borderRadius: '4px',
                                }}
                              >
                                📅
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                          {report.lastGeneratedAt
                            ? new Date(report.lastGeneratedAt).toLocaleDateString()
                            : 'Never'}
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
                            👁️
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
