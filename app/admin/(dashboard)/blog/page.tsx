'use client'

import { useEffect, useState } from 'react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  published: boolean
  featured: boolean
  viewCount: number
  publishedAt?: string
  category: { name: string }
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const res = await fetch('/api/admin/blog?limit=50')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Blog & Articles</h1>
        <button className="admin-btn admin-btn-primary">+ Write Post</button>
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
                  Total Posts
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{posts.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Published
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {posts.filter((p) => p.published).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Views
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {posts.reduce((sum, p) => sum + p.viewCount, 0)}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Featured
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  {posts.filter((p) => p.featured).length}
                </div>
              </div>
            </div>

            {/* Blog List */}
            <div className="admin-card">
              {posts.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No blog posts yet. Start writing!</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Published</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id}>
                        <td>
                          <div>
                            <strong>{post.title}</strong>
                            {post.featured && (
                              <span style={{ marginLeft: '0.5rem', color: '#F59E0B' }}>⭐</span>
                            )}
                          </div>
                        </td>
                        <td className="font-mono text-sm">{post.category.name}</td>
                        <td>
                          <span
                            style={{
                              color: post.published ? '#10B981' : '#F59E0B',
                            }}
                          >
                            {post.published ? '✓ Published' : '⏳ Draft'}
                          </span>
                        </td>
                        <td className="text-center">{post.viewCount} views</td>
                        <td style={{ fontSize: '0.9rem' }}>
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '—'}
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button
                              className="admin-btn admin-btn-secondary"
                              style={{ fontSize: '0.8rem' }}
                            >
                              Edit
                            </button>
                          </div>
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
