'use client'

import { useEffect, useState } from 'react'

interface Article {
  id: string
  title: string
  category: string
  published: boolean
  viewCount: number
  helpfulCount: number
  createdAt: string
}

export default function AdminKnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      const res = await fetch('/api/admin/knowledge-base')
      if (res.ok) {
        const data = await res.json()
        setArticles(data.data)
      }
    } catch (error) {
      console.error('Failed to load articles:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Knowledge Base</h1>
        <button className="admin-btn admin-btn-primary">+ Add Article</button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : articles.length === 0 ? (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>No articles yet</p>
          </div>
        ) : (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Views</th>
                  <th>Helpful</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td className="font-medium">{article.title}</td>
                    <td>{article.category}</td>
                    <td>{article.viewCount}</td>
                    <td>{article.helpfulCount}</td>
                    <td>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: article.published ? '#10B98140' : '#EF444440',
                          color: article.published ? '#10B981' : '#EF4444',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                        }}
                      >
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
