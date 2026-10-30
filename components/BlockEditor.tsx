'use client'

import { useState, useCallback } from 'react'

interface Block {
  id: string
  type: 'heading' | 'paragraph' | 'image' | 'quote' | 'code' | 'list' | 'divider'
  content?: string
  level?: number
  imageUrl?: string
  listItems?: string[]
  listType?: 'ordered' | 'unordered'
  language?: string
}

interface BlockEditorProps {
  initialBlocks?: Block[]
  onChange?: (blocks: Block[]) => void
  onSave?: (blocks: Block[]) => Promise<void>
}

export default function BlockEditor({ initialBlocks = [], onChange, onSave }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const addBlock = useCallback((type: Block['type']) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      level: type === 'heading' ? 2 : undefined,
      listType: 'unordered'
    }
    const newBlocks = [...blocks, newBlock]
    setBlocks(newBlocks)
    onChange?.(newBlocks)
  }, [blocks, onChange])

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, ...updates } : b)
    setBlocks(newBlocks)
    onChange?.(newBlocks)
  }, [blocks, onChange])

  const deleteBlock = useCallback((id: string) => {
    const newBlocks = blocks.filter(b => b.id !== id)
    setBlocks(newBlocks)
    onChange?.(newBlocks)
  }, [blocks, onChange])

  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id)
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) {
      return
    }

    const newBlocks = [...blocks]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]]
    
    setBlocks(newBlocks)
    onChange?.(newBlocks)
  }, [blocks, onChange])

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(blocks)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="block-editor-container">
      {/* Toolbar */}
      <div className="block-editor-toolbar">
        <div className="toolbar-section">
          <button onClick={() => addBlock('heading')} className="btn btn-sm">
            + Heading
          </button>
          <button onClick={() => addBlock('paragraph')} className="btn btn-sm">
            + Paragraph
          </button>
          <button onClick={() => addBlock('image')} className="btn btn-sm">
            + Image
          </button>
          <button onClick={() => addBlock('quote')} className="btn btn-sm">
            + Quote
          </button>
          <button onClick={() => addBlock('code')} className="btn btn-sm">
            + Code
          </button>
          <button onClick={() => addBlock('list')} className="btn btn-sm">
            + List
          </button>
          <button onClick={() => addBlock('divider')} className="btn btn-sm">
            + Divider
          </button>
        </div>
        {onSave && (
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

      {/* Editor Canvas */}
      <div className="block-editor-canvas">
        {blocks.length === 0 ? (
          <div className="empty-state">
            <p>Start creating content by adding a block above</p>
          </div>
        ) : (
          blocks.map((block) => (
            <BlockComponent
              key={block.id}
              block={block}
              isSelected={block.id === selectedBlockId}
              onSelect={() => setSelectedBlockId(block.id)}
              onUpdate={(updates) => updateBlock(block.id, updates)}
              onDelete={() => deleteBlock(block.id)}
              onMove={(direction) => moveBlock(block.id, direction)}
            />
          ))
        )}
      </div>

      <style jsx>{`
        .block-editor-container {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .block-editor-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          flex-wrap: wrap;
          gap: 8px;
        }

        .toolbar-section {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .block-editor-canvas {
          padding: 24px;
          min-height: 400px;
        }

        .empty-state {
          text-align: center;
          color: #9ca3af;
          padding: 48px 24px;
        }
      `}</style>
    </div>
  )
}

interface BlockComponentProps {
  block: Block
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<Block>) => void
  onDelete: () => void
  onMove: (direction: 'up' | 'down') => void
}

function BlockComponent({ block, isSelected, onSelect, onUpdate, onDelete, onMove }: BlockComponentProps) {
  switch (block.type) {
    case 'heading':
      return (
        <BlockWrapper isSelected={isSelected} onSelect={onSelect} onDelete={onDelete} onMove={onMove}>
          <select value={block.level || 2} onChange={(e) => onUpdate({ level: Number(e.target.value) })} style={{ marginBottom: '8px' }}>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
          </select>
          <input
            type="text"
            value={block.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Enter heading..."
            style={{ width: '100%', fontSize: '24px', fontWeight: 'bold', padding: '8px' }}
          />
        </BlockWrapper>
      )
    case 'paragraph':
      return (
        <BlockWrapper isSelected={isSelected} onSelect={onSelect} onDelete={onDelete} onMove={onMove}>
          <textarea
            value={block.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Enter paragraph text..."
            style={{ width: '100%', minHeight: '100px', padding: '8px', fontFamily: 'inherit' }}
          />
        </BlockWrapper>
      )
    case 'image':
      return (
        <BlockWrapper isSelected={isSelected} onSelect={onSelect} onDelete={onDelete} onMove={onMove}>
          <input
            type="text"
            value={block.imageUrl || ''}
            onChange={(e) => onUpdate({ imageUrl: e.target.value })}
            placeholder="Image URL..."
            style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
          />
          {block.imageUrl && <img src={block.imageUrl} alt="Block" style={{ maxWidth: '100%', borderRadius: '4px' }} />}
        </BlockWrapper>
      )
    case 'quote':
      return (
        <BlockWrapper isSelected={isSelected} onSelect={onSelect} onDelete={onDelete} onMove={onMove}>
          <blockquote style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '16px', fontStyle: 'italic', color: '#6b7280' }}>
            <textarea
              value={block.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Enter quote..."
              style={{ width: '100%', minHeight: '80px', padding: '8px', fontStyle: 'italic', fontFamily: 'inherit' }}
            />
          </blockquote>
        </BlockWrapper>
      )
    case 'code':
      return (
        <BlockWrapper isSelected={isSelected} onSelect={onSelect} onDelete={onDelete} onMove={onMove}>
          <select value={block.language || 'javascript'} onChange={(e) => onUpdate({ language: e.target.value })} style={{ marginBottom: '8px' }}>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
          <textarea
            value={block.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Enter code..."
            style={{ width: '100%', minHeight: '120px', padding: '8px', fontFamily: 'monospace', backgroundColor: '#1f2937', color: '#e5e7eb' }}
          />
        </BlockWrapper>
      )
    case 'list':
      return (
        <BlockWrapper isSelected={isSelected} onSelect={onSelect} onDelete={onDelete} onMove={onMove}>
          <select value={block.listType || 'unordered'} onChange={(e) => onUpdate({ listType: e.target.value as 'ordered' | 'unordered' })} style={{ marginBottom: '8px' }}>
            <option value="unordered">Bullet List</option>
            <option value="ordered">Numbered List</option>
          </select>
          <textarea
            value={(block.listItems || []).join('\n')}
            onChange={(e) => onUpdate({ listItems: e.target.value.split('\n') })}
            placeholder="One item per line..."
            style={{ width: '100%', minHeight: '100px', padding: '8px', fontFamily: 'inherit' }}
          />
        </BlockWrapper>
      )
    case 'divider':
      return (
        <BlockWrapper isSelected={isSelected} onSelect={onSelect} onDelete={onDelete} onMove={onMove}>
          <hr style={{ margin: '16px 0' }} />
        </BlockWrapper>
      )
    default:
      return null
  }
}

function BlockWrapper({ children, isSelected, onSelect, onDelete, onMove }: any) {
  return (
    <div
      onClick={onSelect}
      style={{
        border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: isSelected ? '#eff6ff' : '#fff',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      {children}
      {isSelected && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button onClick={() => onMove('up')} className="btn btn-sm">↑</button>
          <button onClick={() => onMove('down')} className="btn btn-sm">↓</button>
          <button onClick={onDelete} className="btn btn-sm btn-danger">Delete</button>
        </div>
      )}
      <style jsx>{`
        .btn-danger {
          color: #ef4444;
          border-color: #ef4444;
        }
        .btn-danger:hover {
          background: #fee2e2;
        }
      `}</style>
    </div>
  )
}
