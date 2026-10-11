'use client'

import { useEffect, useState } from 'react'

interface KPI {
  id: string
  name: string
  metricType: string
  targetValue: number
  currentValue: number
  achievedPercent: number
  status: string
}

export default function AdminKPITrackingPage() {
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadKPIs()
  }, [])

  const loadKPIs = async () => {
    try {
      const res = await fetch('/api/admin/analytics/kpis')
      if (res.ok) {
        const data = await res.json()
        setKpis(data.data)
      }
    } catch (error) {
      console.error('Failed to load KPIs:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: any = {
    on_track: '#10B981',
    at_risk: '#F59E0B',
    missed: '#EF4444',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">KPI Tracking & Goals</h1>
        <button className="admin-btn admin-btn-primary">+ Create KPI</button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : kpis.length === 0 ? (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>No KPIs created yet. Create one to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {kpis.map((kpi) => (
              <div key={kpi.id} className="admin-card">
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{kpi.name}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>
                    {kpi.metricType}
                  </p>
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    height: '8px',
                    background: 'var(--border)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(kpi.achievedPercent, 100)}%`,
                      background: statusColors[kpi.status],
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Current</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{kpi.currentValue}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Target</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{kpi.targetValue}</div>
                  </div>
                </div>

                {/* Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: statusColors[kpi.status],
                      color: '#fff',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}
                  >
                    {kpi.status.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                    {kpi.achievedPercent.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
