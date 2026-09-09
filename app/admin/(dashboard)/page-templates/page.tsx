'use client'

import { useEffect, useState } from 'react'

interface PageTemplate {
  id: string
  name: string
  category: string
  useCount: number
  featured: boolean
  active: boolean
  createdAt: string
}

export default function AdminPageTemplatesPage() {
  const [templates, setTemplates] = useState<PageTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/admin/page-templates?limit=50')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const categoryIcons: any = {
    landing: '🚀',
    blog: '📝',
    portfolio: '🎨',
    contact: '📧',
    pricing: '💰',
    general: '📄',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Page Templates</h1>
        <button className="admin-btn admin-btn-primary">+ Create Template</button>
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
                  Total Templates
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{templates.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Featured
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  {templates.filter((t) => t.featured).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Uses
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {templates.reduce((sum, t) => sum + t.useCount, 0)}
                </div>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="admin-card">
              {templates.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No templates yet. Create your first template!</p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '120px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          position: 'relative',
                        }}
                      >
                        <div style={{ padding: '0.5rem', color: 'white', fontSize: '2rem' }}>
                          {categoryIcons[template.category] || '📄'}
                        </div>
                        {template.featured && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '0.5rem',
                              right: '0.5rem',
                              background: '#F59E0B',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                            }}
                          >
                            ⭐ Featured
                          </div>
                        )}
                      </div>

                      <div style={{ padding: '1rem' }}>
                        <h4 style={{ fontWeight: '700', margin: 0, marginBottom: '0.25rem' }}>
                          {template.name}
                        </h4>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--muted)',
                            marginBottom: '0.75rem',
                            textTransform: 'capitalize',
                          }}
                        >
                          {template.category}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.8rem',
                            color: 'var(--muted)',
                            borderTop: '1px solid var(--border)',
                            paddingTop: '0.75rem',
                          }}
                        >
                          <span>Used {template.useCount} times</span>
                          <span
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: template.active ? '#10B98140' : '#EF444440',
                              color: template.active ? '#10B981' : '#EF4444',
                              borderRadius: '4px',
                            }}
                          >
                            {template.active ? '✓' : '✗'}
                          </span>
                        </div>

                        <button
                          style={{
                            width: '100%',
                            marginTop: '1rem',
                            padding: '0.5rem',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          Edit
                        </button>
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
