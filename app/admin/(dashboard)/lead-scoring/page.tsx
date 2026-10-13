'use client'

import { useEffect, useState } from 'react'

interface ScoringRule {
  id: string
  name: string
  triggerType: string
  scoreValue: number
  active: boolean
  createdAt: string
}

export default function AdminLeadScoringPage() {
  const [rules, setRules] = useState<ScoringRule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    try {
      const res = await fetch('/api/admin/lead-scoring?limit=50')
      if (res.ok) {
        const data = await res.json()
        setRules(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerIcons: any = {
    email_open: '👁️',
    link_click: '🔗',
    page_visit: '📄',
    form_submit: '📋',
    download: '⬇️',
    purchase: '💳',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Lead Scoring Rules</h1>
        <button className="admin-btn admin-btn-primary">+ Add Rule</button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : (
          <>
            {/* Info Box */}
            <div
              style={{
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid #3B82F6',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              <strong>💡 How Lead Scoring Works:</strong>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--text)' }}>
                Each rule assigns points based on lead behavior. Leads with higher scores are more likely to
                convert.
              </p>
            </div>

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
                  Total Rules
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{rules.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Points
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {rules.reduce((sum, r) => sum + r.scoreValue, 0)}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Active Rules
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {rules.filter((r) => r.active).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Avg Score
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  {rules.length > 0 ? Math.round(rules.reduce((sum, r) => sum + r.scoreValue, 0) / rules.length) : 0}
                </div>
              </div>
            </div>

            {/* Rules Table */}
            <div className="admin-card">
              {rules.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No scoring rules yet. Create your first rule!</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Rule Name</th>
                      <th>Trigger</th>
                      <th>Points</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule.id}>
                        <td style={{ fontWeight: '600' }}>
                          {triggerIcons[rule.triggerType as keyof typeof triggerIcons] || '🎯'} {rule.name}
                        </td>
                        <td style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>
                          {rule.triggerType.replace(/_/g, ' ')}
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: rule.scoreValue > 0 ? '#10B98140' : '#F59E0B40',
                              color: rule.scoreValue > 0 ? '#10B981' : '#F59E0B',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontWeight: '700',
                            }}
                          >
                            +{rule.scoreValue} pts
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: rule.active ? '#10B98140' : '#EF444440',
                              color: rule.active ? '#10B981' : '#EF4444',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                            }}
                          >
                            {rule.active ? '✓ Active' : '✗ Inactive'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                          {new Date(rule.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#3B82F6',
                              marginRight: '0.5rem',
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#EF4444',
                            }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Scoring Stages */}
            <div className="admin-card" style={{ marginTop: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>Lead Scoring Stages</h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    padding: '1rem',
                    background: '#3B82F640',
                    borderRadius: '8px',
                    border: '1px solid #3B82F6',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❄️</div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Cold Lead</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>0-25 points</div>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    background: '#F59E0B40',
                    borderRadius: '8px',
                    border: '1px solid #F59E0B',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌡️</div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Warm Lead</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>25-75 points</div>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    background: '#EF444440',
                    borderRadius: '8px',
                    border: '1px solid #EF4444',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Hot Lead</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>75+ points</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
