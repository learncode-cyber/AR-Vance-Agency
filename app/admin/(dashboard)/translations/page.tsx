'use client'

import { useEffect, useState } from 'react'

interface Translation {
  id: string
  key: string
  namespace: string
  value: string
  translated: boolean
  reviewed: boolean
  machineTranslated: boolean
}

export default function AdminTranslationsPage() {
  const [translations, setTranslations] = useState<Translation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNamespace, setSelectedNamespace] = useState('common')

  useEffect(() => {
    loadTranslations()
  }, [selectedNamespace])

  const loadTranslations = async () => {
    try {
      const res = await fetch(`/api/admin/translations?namespace=${selectedNamespace}&limit=100`)
      if (res.ok) {
        const data = await res.json()
        setTranslations(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load translations:', error)
    } finally {
      setLoading(false)
    }
  }

  const namespaces = ['common', 'pages', 'errors', 'settings', 'emails']

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Translations</h1>
        <button className="admin-btn admin-btn-primary">+ Add Key</button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : (
          <>
            {/* Namespace Filter */}
            <div className="admin-card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {namespaces.map((ns) => (
                  <button
                    key={ns}
                    onClick={() => setSelectedNamespace(ns)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      background: selectedNamespace === ns ? '#3B82F6' : 'var(--bg-secondary)',
                      color: selectedNamespace === ns ? 'white' : 'var(--text)',
                      cursor: 'pointer',
                    }}
                  >
                    {ns}
                  </button>
                ))}
              </div>
            </div>

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
                  Total Keys
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{translations.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Translated
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {translations.filter((t) => t.translated).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Reviewed
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {translations.filter((t) => t.reviewed).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Machine Translated
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  {translations.filter((t) => t.machineTranslated).length}
                </div>
              </div>
            </div>

            {/* Translations Table */}
            <div className="admin-card">
              {translations.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No translations for this namespace.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Value</th>
                      <th>Status</th>
                      <th>Reviewed</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {translations.map((t) => (
                      <tr key={t.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{t.key}</td>
                        <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t.value}
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: t.translated ? '#10B98140' : '#F59E0B40',
                              color: t.translated ? '#10B981' : '#F59E0B',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                            }}
                          >
                            {t.translated ? '✓ Translated' : '⏳ Pending'}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: t.reviewed ? '#10B98140' : '#EF444440',
                              color: t.reviewed ? '#10B981' : '#EF4444',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                            }}
                          >
                            {t.reviewed ? '✓' : '✗'}
                          </span>
                        </td>
                        <td>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#3B82F6',
                            }}
                          >
                            ✏️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
