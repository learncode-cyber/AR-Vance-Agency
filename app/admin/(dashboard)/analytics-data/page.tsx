'use client'

import { useEffect, useState } from 'react'

interface Analytics {
  id: string
  metric: string
  value: number
  period: string
  date: string
  trend: string
  percentChange: number
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics?limit=100')
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Analytics</h1>
        <button className="admin-btn admin-btn-primary">+ Track Metric</button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : (
          <>
            {/* Metrics Summary */}
            <div className="admin-card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>Tracked Metrics</h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                {[...new Set(analytics.map((a) => a.metric))].map((metric) => {
                  const metricData = analytics.filter((a) => a.metric === metric)
                  const latest = metricData[0]
                  const total = metricData.reduce((sum, a) => sum + a.value, 0)
                  const avg = total / metricData.length

                  return (
                    <div
                      key={metric}
                      style={{
                        padding: '1rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                        {metric}
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        {avg.toFixed(2)}
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span
                          style={{
                            color: latest?.trend === 'up' ? '#10B981' : '#EF4444',
                          }}
                        >
                          {latest?.trend === 'up' ? '📈' : '📉'}
                        </span>
                        <span style={{ color: latest?.trend === 'up' ? '#10B981' : '#EF4444' }}>
                          {latest?.percentChange > 0 ? '+' : ''}{latest?.percentChange.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Analytics Data Table */}
            <div className="admin-card">
              {analytics.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No analytics data yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                      <th>Period</th>
                      <th>Change</th>
                      <th>Trend</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.slice(0, 50).map((a) => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: '600' }}>{a.metric}</td>
                        <td className="text-right">{a.value.toFixed(2)}</td>
                        <td style={{ textTransform: 'capitalize' }}>{a.period}</td>
                        <td
                          style={{
                            color: a.percentChange > 0 ? '#10B981' : '#EF4444',
                            fontWeight: '600',
                          }}
                        >
                          {a.percentChange > 0 ? '+' : ''}{a.percentChange.toFixed(1)}%
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '1rem',
                            }}
                          >
                            {a.trend === 'up' ? '📈' : a.trend === 'down' ? '📉' : '➡️'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                          {new Date(a.date).toLocaleDateString()}
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
