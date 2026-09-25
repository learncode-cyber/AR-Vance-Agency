'use client'

import { useEffect, useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const [botId, setBotId] = useState('') // Will be set from query params or default
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [started, setStarted] = useState(false)

  const handleStartChat = () => {
    if (!email || !name) {
      alert('Please enter your email and name')
      return
    }
    setStarted(true)
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    setLoading(true)
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId,
          conversationId,
          visitorEmail: email,
          visitorName: name,
          message: input,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.response,
        }

        setMessages((prev) => [...prev, assistantMessage])
        setConversationId(data.data.conversationId)

        if (data.data.needsEscalation) {
          alert('Your issue has been escalated to a human agent. Someone will respond shortly.')
        }
      } else {
        alert('Failed to send message')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error sending message')
    }

    setLoading(false)
  }

  if (!started) {
    return (
      <main className="section-py">
        <div className="container max-w-md">
          <div className="admin-card" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
              💬 Chat with Us
            </h1>
            <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
              Get instant answers to your questions. Our AI chatbot is here to help!
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Your Name</label>
              <input
                className="form-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label className="form-label">Your Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <button
              onClick={handleStartChat}
              className="admin-btn admin-btn-primary"
              style={{ width: '100%' }}
            >
              Start Chat
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="section-py">
      <div className="container max-w-2xl">
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
          {/* Header */}
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid var(--border)',
              marginBottom: '1rem',
            }}
          >
            <h2 style={{ fontWeight: '700', marginBottom: '0.25rem' }}>Chat Support</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              👋 Hi {name}! How can we help you today?
            </p>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: '1rem',
              padding: '1rem',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
            }}
          >
            {messages.length === 0 ? (
              <p style={{ color: 'var(--muted)', textAlign: 'center' }}>
                No messages yet. Send one to get started!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg)',
                        color: msg.role === 'user' ? '#fff' : 'var(--text)',
                        border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="form-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              disabled={loading}
              style={{ flex: 1 }}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="admin-btn admin-btn-primary"
            >
              {loading ? '⏳' : '📤'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
