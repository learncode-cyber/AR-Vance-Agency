'use client'

import { useEffect, useState } from 'react'

interface Campaign {
  id: string
  name: string
  subject: string
  status: string
  list: { name: string }
  totalRecipients: number
  sentCount: number
  openCount: number
  clickCount: number
  sentAt?: string
}

export default function AdminEmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      const res = await fetch('/api/admin/email-campaigns?limit=50')
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: any = {
    draft: '#F59E0B',
    scheduled: '#3B82F6',
    sending: '#8B5CF6',
    sent: '#10B981',
    paused: '#EF4444',
  }

  const getOpenRate = (campaign: Campaign) => {
    if (campaign.sentCount === 0) return '—'
    return ((campaign.openCount / campaign.sentCount) * 100).toFixed(1) + '%'
  }

  const getClickRate = (campaign: Campaign) => {
    if (campaign.openCount === 0) return '—'
    return ((campaign.clickCount / campaign.openCount) * 100).toFixed(1) + '%'
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Email Campaigns</h1>
        <button className="admin-btn admin-btn-primary">+ Create Campaign</button>
      </div>

      <div className="admin-content">
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
              Total Campaigns
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{campaigns.length}</div>
          </div>

          <div className="admin-card">
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Sent
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
              {campaigns.filter((c) => c.status === 'sent').length}
            </div>
          </div>

          <div className="admin-card">
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Total Emails Sent
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
              {campaigns.reduce((sum, c) => sum + c.sentCount, 0)}
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="admin-card">
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading...</p>
          ) : campaigns.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No campaigns yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>List</th>
                  <th>Status</th>
                  <th>Sent / Recipients</th>
                  <th>Open Rate</th>
                  <th>Click Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="font-medium">{campaign.name}</td>
                    <td className="text-sm">{campaign.list.name}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: statusColors[campaign.status] + '20',
                          color: statusColors[campaign.status],
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                        }}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="text-center">
                      {campaign.sentCount} / {campaign.totalRecipients}
                    </td>
                    <td className="text-center">{getOpenRate(campaign)}</td>
                    <td className="text-center">{getClickRate(campaign)}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn admin-btn-secondary"
                          style={{ fontSize: '0.8rem' }}
                        >
                          View
                        </button>
                      </div>
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
