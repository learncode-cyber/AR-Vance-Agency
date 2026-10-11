'use client'

import { useState, useRef } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  minHeight?: number
}

export default function RichTextEditor({
  value,
  onChange,
  label = 'Content',
  placeholder = 'Drag images here or paste content...',
  minHeight = 220,
}: RichTextEditorProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files are supported')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      const imageMarkdown = `\n![${file.name}](${data.url})\n`

      // Insert image markdown at cursor position
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart
        const end = textareaRef.current.selectionEnd
        const newValue =
          value.substring(0, start) + imageMarkdown + value.substring(end)
        onChange(newValue)
        
        // Restore cursor position after image
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus()
            textareaRef.current.selectionStart =
              textareaRef.current.selectionEnd =
              start + imageMarkdown.length
          }
        }, 0)
      }
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        await uploadImage(files[i])
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          uploadImage(files[i])
        }
      }
    }
    // Reset input
    e.currentTarget.value = ''
  }

  const insertMarkdown = (before: string, after: string = '') => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      const selectedText = value.substring(start, end)
      const newValue =
        value.substring(0, start) +
        before +
        selectedText +
        after +
        value.substring(end)
      onChange(newValue)

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = start + before.length
        }
      }, 0)
    }
  }

  return (
    <div className="form-group">
      <label className="form-label">{label} *</label>

      {/* Toolbar */}
      <div className="rich-text-toolbar">
        <div className="rich-text-toolbar-group">
          <button
            type="button"
            className="rich-text-btn"
            title="Bold (Ctrl+B)"
            onClick={() => insertMarkdown('**', '**')}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className="rich-text-btn"
            title="Italic (Ctrl+I)"
            onClick={() => insertMarkdown('_', '_')}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className="rich-text-btn"
            title="Heading"
            onClick={() => insertMarkdown('## ', '')}
          >
            H
          </button>
          <button
            type="button"
            className="rich-text-btn"
            title="Link"
            onClick={() => insertMarkdown('[', '](url)')}
          >
            🔗
          </button>
        </div>

        <div className="rich-text-toolbar-group">
          <button
            type="button"
            className="rich-text-btn"
            title="Upload Image"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? '⏳' : '🖼️'} {uploading ? 'Uploading...' : 'Image'}
          </button>
          <button
            type="button"
            className="rich-text-btn"
            title="Bulleted List"
            onClick={() => insertMarkdown('- ', '')}
          >
            • List
          </button>
          <button
            type="button"
            className="rich-text-btn"
            title="Quote"
            onClick={() => insertMarkdown('> ', '')}
          >
            " "
          </button>
          <button
            type="button"
            className="rich-text-btn"
            title="Code Block"
            onClick={() => insertMarkdown('```\n', '\n```')}
          >
            {'<>'}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div
        className={`rich-text-editor ${isDragging ? 'dragging' : ''} ${
          uploading ? 'uploading' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="rich-text-drag-overlay">
            <div className="rich-text-drag-content">
              <div className="text-3xl mb-2">📸</div>
              <p>Drop images here</p>
            </div>
          </div>
        )}

        <textarea
          ref={textareaRef}
          className="rich-text-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight: `${minHeight}px` }}
        />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Help Text */}
        <div className="rich-text-help">
          <p>
            <strong>Markdown supported:</strong> **bold** · _italic_ · ## headings · [links](url) · ![alt](image.jpg)
          </p>
          <p>
            💡 Drag & drop images directly, or click the Image button to upload. Supports PNG, JPG, GIF (max 5MB)
          </p>
        </div>
      </div>
    </div>
  )
}
