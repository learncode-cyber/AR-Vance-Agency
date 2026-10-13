'use client'

import { useEffect, useState } from 'react'

export default function AdminMarketingAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/marketing-analytics?days=30')
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

  const { totals } = analytics

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Marketing Analytics</h1>
      </div>

      <div className="admin-content">
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Emails Sent
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
              {totals.emailsSent}
            </div>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Open Rate
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
              {totals.openRate}%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              {totals.emailsOpened} opened
            </div>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Click Rate
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
              {totals.clickRate}%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              {totals.emailsClicked} clicked
            </div>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Conversions
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
              {totals.conversions}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              ${totals.conversionValue.toFixed(2)} value
            </div>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Referral Conversions
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
              {totals.referralConversions}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              ${totals.referralValue.toFixed(2)} value
            </div>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Bounce Rate
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#EF4444' }}>
              {totals.bounceRate}%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              {totals.emailsBounced} bounced
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="admin-card">
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>30-Day Summary</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            Track your email marketing performance over the last 30 days.
          </p>
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.5rem' }}>
            <li>Monitor email delivery and engagement rates</li>
            <li>Track conversions from email campaigns</li>
            <li>Measure referral program effectiveness</li>
            <li>Identify trends in customer engagement</li>
          </ul>
        </div>
      </div>
    </>
  )
}
