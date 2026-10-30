'use client'

import { useEffect, useState } from 'react'

export default function AdminChatbotAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/chatbot-analytics?days=30')
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data.data.summary)
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
        <h1 className="admin-topbar-title">Chatbot Analytics</h1>
      </div>

      <div className="admin-content">
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Total Conversations
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
              {analytics.totalConversations}
            </div>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Resolved
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
              {analytics.resolvedConversations}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              {analytics.resolutionRate}% resolution rate
            </div>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Total Messages
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
              {analytics.totalMessages}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              {analytics.averageMessagesPerConversation} avg per chat
            </div>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Open Tickets
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
              {analytics.tickets.open}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              {analytics.tickets.total} total tickets
            </div>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Resolved Tickets
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
              {analytics.tickets.resolved}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="admin-card">
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>30-Day Performance</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            Track your chatbot performance and customer support metrics over the last 30 days.
          </p>
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.5rem' }}>
            <li>Monitor conversation volume and resolution rates</li>
            <li>Track message frequency and chat quality</li>
            <li>Manage support ticket workflow</li>
            <li>Identify escalation trends</li>
          </ul>
        </div>
      </div>
    </>
  )
}
