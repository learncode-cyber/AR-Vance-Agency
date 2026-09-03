'use client'

import { useEffect, useState } from 'react'

interface ChatBot {
  id: string
  name: string
  description: string
  active: boolean
  aiModel: string
  _count: { conversations: number; responses: number }
  createdAt: string
}

export default function AdminChatsBotsPage() {
  const [bots, setBots] = useState<ChatBot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBots()
  }, [])

  const loadBots = async () => {
    try {
      const res = await fetch('/api/admin/chatbots')
      if (res.ok) {
        const data = await res.json()
        setBots(data.data)
      }
    } catch (error) {
      console.error('Failed to load bots:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">AI Chatbots</h1>
        <button className="admin-btn admin-btn-primary">+ Create Bot</button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : bots.length === 0 ? (
          <div className="admin-card">
            <p style={{ color: 'var(--muted)' }}>No chatbots yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Model</th>
                  <th>Conversations</th>
                  <th>Responses</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bots.map((bot) => (
                  <tr key={bot.id}>
                    <td className="font-medium">{bot.name}</td>
                    <td className="font-mono text-sm">{bot.aiModel}</td>
                    <td>{bot._count.conversations}</td>
                    <td>{bot._count.responses}</td>
                    <td>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: bot.active ? '#10B98140' : '#EF444440',
                          color: bot.active ? '#10B981' : '#EF4444',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                        }}
                      >
                        {bot.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                          Edit
                        </button>
                        <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                          Analytics
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
