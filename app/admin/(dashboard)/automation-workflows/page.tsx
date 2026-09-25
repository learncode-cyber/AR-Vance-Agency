'use client'

import { useEffect, useState } from 'react'

interface Workflow {
  id: string
  name: string
  triggerType: string
  active: boolean
  createdAt: string
}

export default function AdminAutomationWorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkflows()
  }, [])

  const loadWorkflows = async () => {
    try {
      const res = await fetch('/api/admin/automation-workflows')
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

  const triggerIcons: any = {
    new_subscriber: '👤',
    tag_added: '🏷️',
    purchase: '🛒',
    custom: '⚙️',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Automation Workflows</h1>
        <button className="admin-btn admin-btn-primary">+ Create Workflow</button>
      </div>

      <div className="admin-content">
        <div className="admin-card">
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading...</p>
          ) : workflows.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No workflows yet. Create one to automate your email!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <h4 style={{ fontWeight: '700', margin: 0, marginBottom: '0.25rem' }}>
                      {workflow.name}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>
                      {triggerIcons[workflow.triggerType]} Trigger: {workflow.triggerType.replace(/_/g, ' ')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: workflow.active ? '#10B98140' : '#F59E0B40',
                        color: workflow.active ? '#10B981' : '#F59E0B',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                      }}
                    >
                      {workflow.active ? '✓ Active' : '⏸ Inactive'}
                    </span>
                    <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="admin-card" style={{ marginTop: '1rem' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Workflow Types</h3>
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.5rem' }}>
            <li>
              <strong>New Subscriber:</strong> Send welcome email automatically
            </li>
            <li>
              <strong>Tag Added:</strong> Trigger when subscriber gets a tag
            </li>
            <li>
              <strong>Purchase:</strong> Send order confirmation automatically
            </li>
            <li>
              <strong>Custom:</strong> Create your own automation logic
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
