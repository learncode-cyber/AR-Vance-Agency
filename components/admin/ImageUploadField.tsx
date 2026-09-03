'use client'
import { useRef, useState } from 'react'

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  hint?: string
}

export default function ImageUploadField({ label, value, onChange, hint }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  async function uploadFile(file: File) {
    setError('')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (res.ok) {
        onChange(json.data.url)
      } else {
        setError(json.error ?? 'Upload failed.')
      }
    } catch {
      setError('Network error during upload.')
    } finally {
      setUploading(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = '' // allow re-selecting the same file later
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          display: 'flex',
          gap: '.9rem',
          alignItems: 'center',
          padding: '.75rem',
          border: `1.5px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 10,
          background: dragOver ? 'color-mix(in srgb, var(--primary) 6%, transparent)' : 'var(--surface)',
          transition: 'border-color .2s, background .2s',
        }}
      >
        {/* Live preview */}
        <div style={{
          width: 64, height: 64, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
          background: 'var(--card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {value ? (
            <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
          )}
        </div>

        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileSelect} style={{ display: 'none' }} />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : '📤 Upload Image'}
            </button>
            {value && (
              <button type="button" className="admin-btn admin-btn-delete" onClick={() => onChange('')}>
                Remove
              </button>
            )}
          </div>
          <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.4rem' }}>
            Drag & drop, click to browse, or paste a URL below. JPG/PNG/WEBP/GIF, max 5MB.
          </p>
        </div>
      </div>

      {error && <p style={{ fontSize: '.75rem', color: '#ef4444', marginTop: '.4rem' }}>{error}</p>}

      {/* Fallback: manual URL entry (e.g. for external/CDN images) */}
      <input
        className="form-input"
        style={{ marginTop: '.5rem' }}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="https://... (or upload above)"
      />
      {hint && <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.3rem' }}>{hint}</p>}
    </div>
  )
}
