'use client'

import { useEffect, useState } from 'react'

interface PortfolioItem {
  id: string
  title: string
  category: string
  clientName?: string
  featured: boolean
  published: boolean
}

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPortfolio()
  }, [])

  const loadPortfolio = async () => {
    try {
      const res = await fetch('/api/admin/portfolio')
      if (res.ok) {
        const data = await res.json()
        setItems(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['web_design', 'branding', 'mobile_app', 'other']

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Portfolio & Case Studies</h1>
        <button className="admin-btn admin-btn-primary">+ Add Project</button>
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
                  Total Projects
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{items.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Published
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {items.filter((i) => i.published).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Featured
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  {items.filter((i) => i.featured).length}
                </div>
              </div>
            </div>

            {/* Portfolio Grid */}
            <div className="admin-card">
              {items.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No portfolio items yet.</p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      {/* Placeholder Image */}
                      <div
                        style={{
                          background: 'var(--bg-secondary)',
                          height: '150px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--muted)',
                        }}
                      >
                        📁 No Image
                      </div>

                      <div style={{ padding: '1rem' }}>
                        <h4 style={{ fontWeight: '700', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                          {item.title}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                          {item.clientName || 'Internal Project'}
                        </p>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              background: 'var(--bg-secondary)',
                              borderRadius: '3px',
                            }}
                          >
                            {item.category}
                          </span>
                          {item.featured && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.5rem',
                                background: '#F59E0B40',
                                color: '#F59E0B',
                                borderRadius: '3px',
                              }}
                            >
                              ⭐ Featured
                            </span>
                          )}
                        </div>

                        <button
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          View
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
