'use client'

import { useEffect, useState } from 'react'

interface Page {
  id: string
  title: string
  slug: string
  status: string
  category: string
  viewCount: number
  featured: boolean
  publishedAt?: string
  createdAt: string
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = async () => {
    try {
      const res = await fetch('/api/admin/pages?limit=50')
      if (res.ok) {
        const data = await res.json()
        setPages(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusIcons: any = {
    draft: '📝',
    published: '✅',
    archived: '📦',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Pages</h1>
        <button className="admin-btn admin-btn-primary">+ New Page</button>
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
                  Total Pages
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{pages.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Published
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {pages.filter((p) => p.status === 'published').length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Drafts
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  {pages.filter((p) => p.status === 'draft').length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Views
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {pages.reduce((sum, p) => sum + p.viewCount, 0)}
                </div>
              </div>
            </div>

            {/* Pages Table */}
            <div className="admin-card">
              {pages.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No pages yet. Create your first page!</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Slug</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Views</th>
                      <th>Published</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((page) => (
                      <tr key={page.id}>
                        <td style={{ fontWeight: '600' }}>
                          {page.featured && '⭐ '}
                          {page.title}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--muted)' }}>
                          /{page.slug}
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.25rem 0.75rem',
                              background:
                                page.status === 'published'
                                  ? '#10B98140'
                                  : page.status === 'draft'
                                    ? '#F59E0B40'
                                    : '#EF444440',
                              color:
                                page.status === 'published'
                                  ? '#10B981'
                                  : page.status === 'draft'
                                    ? '#F59E0B'
                                    : '#EF4444',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                            }}
                          >
                            {statusIcons[page.status]} {page.status}
                          </span>
                        </td>
                        <td style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>{page.category}</td>
                        <td className="text-right">{page.viewCount}</td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                          {page.publishedAt ? new Date(page.publishedAt).toLocaleDateString() : '—'}
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
