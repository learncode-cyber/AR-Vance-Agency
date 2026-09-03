'use client'

import { useState } from 'react'

const blockTypes = [
  { type: 'hero', name: 'Hero Section', icon: '🎯' },
  { type: 'text', name: 'Text', icon: '📝' },
  { type: 'image', name: 'Image', icon: '🖼️' },
  { type: 'video', name: 'Video', icon: '🎥' },
  { type: 'cta', name: 'Call to Action', icon: '🔘' },
  { type: 'gallery', name: 'Gallery', icon: '🎨' },
  { type: 'pricing', name: 'Pricing Table', icon: '💰' },
  { type: 'testimonial', name: 'Testimonials', icon: '💬' },
  { type: 'form', name: 'Form', icon: '📋' },
  { type: 'faq', name: 'FAQ', icon: '❓' },
]

export default function AdminPageBuilderPage() {
  const [blocks, setBlocks] = useState<any[]>([])
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null)

  const addBlock = (type: string) => {
    const newBlock = {
      id: Math.random().toString(36).substring(7),
      type,
      content: {},
      settings: {},
    }
    setBlocks([...blocks, newBlock])
  }

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index))
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newBlocks = [...blocks]
      ;[newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]]
      setBlocks(newBlocks)
    } else if (direction === 'down' && index < blocks.length - 1) {
      const newBlocks = [...blocks]
      ;[newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]]
      setBlocks(newBlocks)
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 320px',
        gap: '1rem',
        height: 'calc(100vh - 80px)',
        padding: '1rem',
      }}
    >
      {/* Left: Block Library */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          padding: '1rem',
          overflowY: 'auto',
          border: '1px solid var(--border)',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Blocks</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {blockTypes.map((block) => (
            <button
              key={block.type}
              onClick={() => addBlock(block.type)}
              style={{
                padding: '0.75rem',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.9rem',
              }}
            >
              <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{block.icon}</div>
              <div style={{ fontWeight: '600' }}>{block.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Center: Canvas */}
      <div
        style={{
          background: 'white',
          borderRadius: '8px',
          padding: '2rem',
          overflowY: 'auto',
          border: '1px solid var(--border)',
          minHeight: 'calc(100vh - 120px)',
        }}
      >
        {blocks.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--muted)',
              padding: '3rem',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏗️</div>
            <p>Add blocks from the left panel to build your page</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {blocks.map((block, index) => (
              <div
                key={block.id}
                onClick={() => setSelectedBlock(index)}
                style={{
                  padding: '1rem',
                  border: selectedBlock === index ? '2px solid #3B82F6' : '1px solid var(--border)',
                  borderRadius: '8px',
                  background: selectedBlock === index ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                    {block.type} Block
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveBlock(index, 'up')
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                      }}
                      disabled={index === 0}
                    >
                      ⬆️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveBlock(index, 'down')
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                      }}
                      disabled={index === blocks.length - 1}
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeBlock(index)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#EF4444',
                        fontSize: '1rem',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Settings */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid var(--border)',
          overflowY: 'auto',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Settings</h3>
        {selectedBlock !== null ? (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Block Type
              </label>
              <div style={{ padding: '0.5rem', background: 'var(--bg)', borderRadius: '4px' }}>
                {blocks[selectedBlock].type}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Block ID
              </label>
              <input
                type="text"
                value={blocks[selectedBlock].id}
                disabled
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <button
              onClick={() => removeBlock(selectedBlock)}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Delete Block
            </button>
          </div>
        ) : (
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Select a block to edit its settings
          </p>
        )}
      </div>
    </div>
  )
}
