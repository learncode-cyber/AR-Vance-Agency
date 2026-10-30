'use client'

import { useEffect, useState } from 'react'

interface Workflow {
  id: string
  name: string
  description: string
  enabled: boolean
  active: boolean
  category: string
  execCount: number
  lastExecAt?: string
  createdAt: string
}

export default function AdminWorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkflows()
  }, [])

  const loadWorkflows = async () => {
    try {
      const res = await fetch('/api/admin/workflows?limit=50')
      if (res.ok) {
        const data = await res.json()
        setWorkflows(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  const categoryIcons: any = {
    email: '📧',
    lead: '🎯',
    sales: '💼',
    general: '⚙️',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Workflows</h1>
        <button className="admin-btn admin-btn-primary">+ Create Workflow</button>
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
                  Total Workflows
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{workflows.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Active
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {workflows.filter((w) => w.active).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Executions
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {workflows.reduce((sum, w) => sum + w.execCount, 0)}
                </div>
              </div>
            </div>

            {/* Workflows Table */}
            <div className="admin-card">
              {workflows.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No workflows yet. Create your first workflow!</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Executions</th>
                      <th>Last Run</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflows.map((workflow) => (
                      <tr key={workflow.id}>
                        <td style={{ fontWeight: '600' }}>
                          {categoryIcons[workflow.category] || '⚙️'} {workflow.name}
                        </td>
                        <td style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>{workflow.category}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span
                              style={{
                                padding: '0.25rem 0.75rem',
                                background: workflow.enabled ? '#10B98140' : '#EF444440',
                                color: workflow.enabled ? '#10B981' : '#EF4444',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                              }}
                            >
                              {workflow.enabled ? '✓ Enabled' : '✗ Disabled'}
                            </span>
                            {workflow.active && (
                              <span
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  background: '#3B82F640',
                                  color: '#3B82F6',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                }}
                              >
                                🔄 Running
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-right">{workflow.execCount}</td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                          {workflow.lastExecAt
                            ? new Date(workflow.lastExecAt).toLocaleDateString()
                            : 'Never'}
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
          </>
        )}
      </div>
    </>
  )
}
