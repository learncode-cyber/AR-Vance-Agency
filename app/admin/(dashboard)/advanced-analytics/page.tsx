'use client'

import { useEffect, useState } from 'react'

export default function AdminAdvancedAnalyticsPage() {
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    try {
      const res = await fetch('/api/admin/analytics/insights?limit=10')
      if (res.ok) {
        const data = await res.json()
        setInsights(data.data)
      }
    } catch (error) {
      console.error('Failed to load insights:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Advanced Analytics & AI Insights</h1>
      </div>

      <div className="admin-content">
        {/* KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              AI Insights Generated
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
              {insights.length}
            </div>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Critical Alerts
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#EF4444' }}>
              {insights.filter((i) => i.severity === 'critical').length}
            </div>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Actionable Insights
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
              {insights.filter((i) => i.actionable).length}
            </div>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Acknowledged
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
              {insights.filter((i) => i.acknowledged).length}
            </div>
          </div>
        </div>

        {/* Insights List */}
        <div className="admin-card">
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Latest AI Insights</h3>

          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading...</p>
          ) : insights.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No insights generated yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${
                      insight.severity === 'critical'
                        ? '#EF4444'
                        : insight.severity === 'warning'
                          ? '#F59E0B'
                          : '#3B82F6'
                    }`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontWeight: '700', margin: 0 }}>{insight.title}</h4>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        background:
                          insight.severity === 'critical'
                            ? '#EF444440'
                            : insight.severity === 'warning'
                              ? '#F59E0B40'
                              : '#3B82F640',
                        color:
                          insight.severity === 'critical'
                            ? '#EF4444'
                            : insight.severity === 'warning'
                              ? '#F59E0B'
                              : '#3B82F6',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                      }}
                    >
                      {insight.severity}
                    </span>
                  </div>

                  <p style={{ margin: '0.5rem 0', color: 'var(--text)' }}>{insight.description}</p>

                  {insight.recommendation && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '4px',
                      }}
                    >
                      <strong>Recommendation:</strong>
                      <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text)' }}>
                        {insight.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="admin-card" style={{ marginTop: '1rem' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>AI Analytics Features</h3>
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.5rem' }}>
            <li>Automated anomaly detection in key metrics</li>
            <li>AI-powered business insights generation</li>
            <li>Predictive analytics for revenue and conversions</li>
            <li>Churn risk scoring for customers</li>
            <li>Product recommendation engine</li>
            <li>Trend forecasting and projections</li>
          </ul>
        </div>
      </div>
    </>
  )
}
