'use client'

import { useEffect, useState } from 'react'

interface ChurnPrediction {
  id: string
  userEmail: string
  riskScore: number
  riskLevel: string
  daysInactive: number
  orderFrequencyDecline: number
  recommendedAction: string
  actionTaken: boolean
  churned: boolean
}

export default function AdminChurnPredictionPage() {
  const [predictions, setPredictions] = useState<ChurnPrediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPredictions()
  }, [])

  const loadPredictions = async () => {
    try {
      const res = await fetch('/api/admin/analytics/churn-predictions?riskLevel=high')
      if (res.ok) {
        const data = await res.json()
        setPredictions(data.data)
      }
    } catch (error) {
      console.error('Failed to load predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  const riskColors: any = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    critical: '#8B5CF6',
  }

  const actionButtons: any = {
    discount: 'Offer Discount',
    vip_offer: 'VIP Offer',
    support_call: 'Contact Support',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Churn Prediction & Prevention</h1>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : predictions.length === 0 ? (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>No high-risk customers at the moment</p>
          </div>
        ) : (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer Email</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Days Inactive</th>
                  <th>Frequency Decline</th>
                  <th>Recommended Action</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred) => (
                  <tr key={pred.id}>
                    <td className="font-mono text-sm">{pred.userEmail.substring(0, 20)}...</td>
                    <td>
                      <div
                        style={{
                          width: `${pred.riskScore}px`,
                          height: '24px',
                          background: riskColors[pred.riskLevel],
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '4px',
                          color: '#fff',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                        }}
                      >
                        {pred.riskScore}%
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: riskColors[pred.riskLevel],
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                        }}
                      >
                        {pred.riskLevel}
                      </span>
                    </td>
                    <td>{pred.daysInactive}</td>
                    <td>{(pred.orderFrequencyDecline * 100).toFixed(0)}%</td>
                    <td>{actionButtons[pred.recommendedAction] || pred.recommendedAction}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn admin-btn-secondary"
                          style={{ fontSize: '0.8rem' }}
                        >
                          {pred.actionTaken ? '✓ Actioned' : 'Take Action'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Info Card */}
        <div className="admin-card" style={{ marginTop: '1rem' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>How Churn Prediction Works</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            Our AI analyzes customer behavior to identify those at risk of churning. We track:
          </p>
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.5rem' }}>
            <li>Days since last purchase (inactivity)</li>
            <li>Decline in purchase frequency</li>
            <li>Cart abandonment patterns</li>
            <li>Support ticket volume</li>
          </ul>
          <p style={{ color: 'var(--muted)', marginTop: '1rem' }}>
            <strong>Recommended Actions:</strong> Offer discounts, provide exclusive VIP offers, or
            reach out via support call.
          </p>
        </div>
      </div>
    </>
  )
}
