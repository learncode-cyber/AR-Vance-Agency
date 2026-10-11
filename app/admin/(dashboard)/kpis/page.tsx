'use client'

import { useEffect, useState } from 'react'

interface KPI {
  id: string
  name: string
  category: string
  targetValue: number
  currentValue: number
  progress: number
  status: string
  unit: string
  createdAt: string
}

export default function AdminKPIsPage() {
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadKPIs()
  }, [])

  const loadKPIs = async () => {
    try {
      const res = await fetch('/api/admin/kpi-metrics?limit=50')
      if (res.ok) {
        const data = await res.json()
        setKpis(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load KPIs:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: any = {
    'on-track': '#10B981',
    'at-risk': '#F59E0B',
    'off-track': '#EF4444',
  }

  const categoryIcons: any = {
    sales: '💰',
    marketing: '📢',
    customer: '👥',
    financial: '💸',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">KPI Metrics</h1>
        <button className="admin-btn admin-btn-primary">+ Create KPI</button>
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
                  Total KPIs
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{kpis.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  On Track
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {kpis.filter((k) => k.status === 'on-track').length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  At Risk
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  {kpis.filter((k) => k.status === 'at-risk').length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Off Track
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#EF4444' }}>
                  {kpis.filter((k) => k.status === 'off-track').length}
                </div>
              </div>
            </div>

            {/* KPIs List */}
            <div className="admin-card">
              {kpis.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No KPIs configured yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {kpis.map((kpi) => (
                    <div
                      key={kpi.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${statusColors[kpi.status]}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div>
                          <h4 style={{ fontWeight: '700', margin: 0, marginBottom: '0.25rem' }}>
                            {categoryIcons[kpi.category] || '📊'} {kpi.name}
                          </h4>
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            {kpi.category}
                          </div>
                        </div>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: `${statusColors[kpi.status]}40`,
                            color: statusColors[kpi.status],
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                          }}
                        >
                          {kpi.status}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div
                        style={{
                          marginBottom: '0.75rem',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          background: 'var(--bg-secondary)',
                          height: '8px',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(kpi.progress, 100)}%`,
                            background: statusColors[kpi.status],
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>

                      {/* Values */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.85rem',
                          color: 'var(--muted)',
                        }}
                      >
                        <div>
                          Current: {kpi.currentValue} {kpi.unit}
                        </div>
                        <div>
                          Target: {kpi.targetValue} {kpi.unit}
                        </div>
                        <div style={{ fontWeight: '600', color: 'var(--text)' }}>
                          {kpi.progress.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
