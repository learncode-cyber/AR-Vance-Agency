'use client'

import { useEffect, useState } from 'react'

interface Campaign {
  id: string
  name: string
  subject: string
  status: string
  sentCount: number
  openCount: number
  clickCount: number
  sentAt: string | null
  createdAt: string
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      const res = await fetch('/api/admin/campaigns')
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data.data)
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: any = {
    draft: '#6B7280',
    scheduled: '#F59E0B',
    sending: '#3B82F6',
    sent: '#10B981',
    paused: '#EF4444',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Email Campaigns</h1>
        <button className="admin-btn admin-btn-primary">+ Create Campaign</button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : campaigns.length === 0 ? (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>No campaigns yet</p>
          </div>
        ) : (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Opened</th>
                  <th>Clicked</th>
                  <th>Open Rate</th>
                  <th>Click Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const openRate = campaign.sentCount > 0 ? ((campaign.openCount / campaign.sentCount) * 100).toFixed(1) : '0'
                  const clickRate = campaign.openCount > 0 ? ((campaign.clickCount / campaign.openCount) * 100).toFixed(1) : '0'

                  return (
                    <tr key={campaign.id}>
                      <td className="font-medium">{campaign.name}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            background: statusColors[campaign.status],
                            color: '#fff',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                          }}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td>{campaign.sentCount}</td>
                      <td>{campaign.openCount}</td>
                      <td>{campaign.clickCount}</td>
                      <td>{openRate}%</td>
                      <td>{clickRate}%</td>
                      <td>
                        <div className="admin-actions">
                          <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
