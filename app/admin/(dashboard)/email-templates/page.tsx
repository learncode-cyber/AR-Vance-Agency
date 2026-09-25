'use client'

import { useEffect, useState } from 'react'

interface Template {
  id: string
  name: string
  subject: string
  templateType: string
  active: boolean
  createdAt: string
}

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/admin/email-templates')
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

  const typeIcons: any = {
    promotional: '🎯',
    newsletter: '📰',
    welcome: '👋',
    confirmation: '✅',
    reminder: '⏰',
    notification: '🔔',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Email Templates</h1>
        <button className="admin-btn admin-btn-primary">+ Create Template</button>
      </div>

      <div className="admin-content">
        <div className="admin-card">
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading...</p>
          ) : templates.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No templates yet. Create one to get started!</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Template Name</th>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id}>
                    <td className="font-medium">{template.name}</td>
                    <td>
                      {typeIcons[template.templateType]} {template.templateType}
                    </td>
                    <td className="text-sm" style={{ color: 'var(--muted)' }}>
                      {template.subject.substring(0, 40)}
                      {template.subject.length > 40 ? '...' : ''}
                    </td>
                    <td>
                      <span
                        style={{
                          color: template.active ? '#10B981' : '#F59E0B',
                        }}
                      >
                        {template.active ? '✓ Active' : '⏸ Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {new Date(template.createdAt).toLocaleDateString()}
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
          )}
        </div>

        {/* Template Type Info */}
        <div className="admin-card" style={{ marginTop: '1rem' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Template Types</h3>
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.5rem' }}>
            <li>
              <strong>Promotional:</strong> Special offers and promotions
            </li>
            <li>
              <strong>Newsletter:</strong> Regular newsletters and updates
            </li>
            <li>
              <strong>Welcome:</strong> New subscriber welcome emails
            </li>
            <li>
              <strong>Confirmation:</strong> Order and action confirmations
            </li>
            <li>
              <strong>Reminder:</strong> Follow-up and reminder emails
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
