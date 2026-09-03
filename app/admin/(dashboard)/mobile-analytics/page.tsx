'use client'

import { useEffect, useState } from 'react'

export default function AdminMobileAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/mobile/analytics?days=30')
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="admin-content">Loading...</div>
  }

  if (!analytics) {
    return <div className="admin-content">No data available</div>
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Mobile Analytics</h1>
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
              Active Devices
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
              {analytics.activeDevices}
            </div>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Total Sessions
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
              {analytics.totalSessions}
            </div>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              iOS Users
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8B5CF6' }}>
              {analytics.platformBreakdown.ios}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              Apple devices
            </div>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Android Users
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
              {analytics.platformBreakdown.android}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              Android devices
            </div>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="admin-card">
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Platform Breakdown</h3>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <div style={{ color: 'var(--muted)', marginBottom: '0.5rem' }}>iOS</div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#8B5CF6',
                  marginBottom: '0.25rem',
                }}
              >
                {analytics.platformBreakdown.ios}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                {analytics.activeDevices > 0
                  ? ((analytics.platformBreakdown.ios / analytics.activeDevices) * 100).toFixed(1)
                  : 0}
                %
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--muted)', marginBottom: '0.5rem' }}>Android</div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#10B981',
                  marginBottom: '0.25rem',
                }}
              >
                {analytics.platformBreakdown.android}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                {analytics.activeDevices > 0
                  ? ((analytics.platformBreakdown.android / analytics.activeDevices) * 100).toFixed(1)
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="admin-card" style={{ marginTop: '1rem' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Mobile Performance</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            Track your mobile app usage and performance across iOS and Android platforms.
          </p>
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.5rem' }}>
            <li>Monitor active device count</li>
            <li>Track user sessions</li>
            <li>Analyze platform distribution</li>
            <li>Measure app engagement</li>
          </ul>
        </div>
      </div>
    </>
  )
}
