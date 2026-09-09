'use client'

import { useEffect, useState } from 'react'

interface Post {
  id: string
  title: string
  author: { displayName: string; avatar: string }
  category: string
  viewCount: number
  likesCount: number
  commentsCount: number
  featured: boolean
  published: boolean
  createdAt: string
}

export default function AdminCommunityFeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const res = await fetch('/api/admin/community-posts?limit=50')
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
        <h1 className="admin-topbar-title">Community Feed</h1>
        <button className="admin-btn admin-btn-primary">+ New Post</button>
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
                  Total Views
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {posts.reduce((sum, p) => sum + p.viewCount, 0)}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Likes
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#EF4444' }}>
                  {posts.reduce((sum, p) => sum + p.likesCount, 0)}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Comments
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {posts.reduce((sum, p) => sum + p.commentsCount, 0)}
                </div>
              </div>
            </div>

            {/* Posts List */}
            <div className="admin-card">
              {posts.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No posts yet in community.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        borderLeft: post.featured ? '4px solid #F59E0B' : '4px solid var(--border)',
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
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontWeight: '700', margin: 0, marginBottom: '0.25rem' }}>
                            {post.title}
                            {post.featured && (
                              <span style={{ marginLeft: '0.5rem', color: '#F59E0B' }}>⭐</span>
                            )}
                          </h4>
                          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                            by {post.author.displayName}
                          </div>
                        </div>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: post.published ? '#10B98140' : '#F59E0B40',
                            color: post.published ? '#10B981' : '#F59E0B',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {post.published ? '✓ Published' : '⏳ Draft'}
                        </span>
                      </div>

                      {/* Engagement Stats */}
                      <div
                        style={{
                          display: 'flex',
                          gap: '1.5rem',
                          fontSize: '0.85rem',
                          color: 'var(--muted)',
                          borderTop: '1px solid var(--border)',
                          paddingTop: '0.75rem',
                        }}
                      >
                        <div>👁️ {post.viewCount} views</div>
                        <div>❤️ {post.likesCount} likes</div>
                        <div>💬 {post.commentsCount} comments</div>
                        <div style={{ marginLeft: 'auto' }}>
                          {new Date(post.createdAt).toLocaleDateString()}
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
