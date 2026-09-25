'use client'

import { useState } from 'react'
import BlockEditor from '@/components/BlockEditor'

interface Block {
  id: string
  type: string
  content?: string
  [key: string]: any
}

export default function BlogEditorPage() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [blocks, setBlocks] = useState<Block[]>([])
  const [status, setStatus] = useState('draft')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle))
    }
  }

  const handleSavePost = async (updatedBlocks: Block[]) => {
    if (!title.trim()) {
      setMessage('❌ Please enter a title')
      return
    }

    if (!slug.trim()) {
      setMessage('❌ Please enter a slug')
      return
    }

    setSaving(true)
    setMessage('💾 Saving...')

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          content: JSON.stringify(updatedBlocks),
          status,
          featured: false
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ Post saved successfully!')
        setBlocks(updatedBlocks)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error: ${(error as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-blog-editor">
      <div className="editor-header">
        <h1>Create Blog Post</h1>
        <p>Write and publish your blog post with our powerful block editor</p>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'info'}`}>
          {message}
        </div>
      )}

      <div className="editor-container">
        <div className="editor-sidebar">
          <div className="sidebar-section">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter post title..."
              className="input-field"
            />
          </div>

          <div className="sidebar-section">
            <label>Slug *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-url-slug"
              className="input-field"
            />
          </div>

          <div className="sidebar-section">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for SEO..."
              rows={3}
              className="input-field"
            />
          </div>

          <div className="sidebar-section">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <button onClick={() => handleSavePost(blocks)} disabled={saving} className="btn-primary">
            {saving ? '💾 Saving...' : '📤 Save & Publish'}
          </button>
        </div>

        <div className="editor-main">
          <BlockEditor
            initialBlocks={blocks}
            onChange={setBlocks}
            onSave={handleSavePost}
          />
        </div>
      </div>

      <style jsx>{`
        .admin-blog-editor {
          padding: 24px;
          background: #f9fafb;
          min-height: 100vh;
        }

        .editor-header {
          margin-bottom: 24px;
        }

        .editor-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .editor-header p {
          color: #6b7280;
          margin: 0;
        }

        .message {
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 16px;
          font-weight: 500;
        }

        .message.success {
          background: #d1fae5;
          color: #065f46;
        }

        .message.error {
          background: #fee2e2;
          color: #7f1d1d;
        }

        .message.info {
          background: #dbeafe;
          color: #1e40af;
        }

        .editor-container {
          display: flex;
          gap: 24px;
        }

        .editor-sidebar {
          width: 300px;
          padding: 20px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          height: fit-content;
          position: sticky;
          top: 24px;
        }

        .sidebar-section {
          margin-bottom: 16px;
        }

        .sidebar-section label {
          display: block;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .input-field {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        .input-field:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .btn-primary {
          width: 100%;
          padding: 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .editor-main {
          flex: 1;
          min-width: 0;
        }

        @media (max-width: 1024px) {
          .editor-container {
            flex-direction: column;
          }

          .editor-sidebar {
            width: 100%;
            position: static;
          }
        }
      `}</style>
    </div>
  )
}
