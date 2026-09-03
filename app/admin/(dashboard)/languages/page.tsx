'use client'

import { useEffect, useState } from 'react'

interface Language {
  id: string
  name: string
  code: string
  nativeName: string
  direction: string
  active: boolean
  default: boolean
  translated: number
  createdAt: string
}

export default function AdminLanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLanguages()
  }, [])

  const loadLanguages = async () => {
    try {
      const res = await fetch('/api/admin/languages')
      if (res.ok) {
        const data = await res.json()
        setLanguages(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load languages:', error)
    } finally {
      setLoading(false)
    }
  }

  const languageFlags: any = {
    en: '🇺🇸',
    bn: '🇧🇩',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    ar: '🇸🇦',
    zh: '🇨🇳',
    ja: '🇯🇵',
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Languages</h1>
        <button className="admin-btn admin-btn-primary">+ Add Language</button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : (
          <>
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
                  Total Languages
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{languages.length}</div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Active
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                  {languages.filter((l) => l.active).length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  RTL Languages
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {languages.filter((l) => l.direction === 'rtl').length}
                </div>
              </div>

              <div className="admin-card">
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Avg Translated
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  {languages.length > 0
                    ? Math.round(languages.reduce((sum, l) => sum + l.translated, 0) / languages.length)
                    : 0}
                  %
                </div>
              </div>
            </div>

            {/* Languages Table */}
            <div className="admin-card">
              {languages.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No languages configured yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Language</th>
                      <th>Code</th>
                      <th>Native Name</th>
                      <th>Direction</th>
                      <th>Translated</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {languages.map((lang) => (
                      <tr key={lang.id}>
                        <td style={{ fontWeight: '600' }}>
                          {languageFlags[lang.code as keyof typeof languageFlags] || '🌐'} {lang.name}
                        </td>
                        <td>
                          <code style={{ background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                            {lang.code}
                          </code>
                        </td>
                        <td>{lang.nativeName}</td>
                        <td
                          style={{
                            textAlign: 'center',
                            background: lang.direction === 'rtl' ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
                            borderRadius: '4px',
                          }}
                        >
                          {lang.direction === 'rtl' ? '↔️ RTL' : '→ LTR'}
                        </td>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <div
                              style={{
                                width: '60px',
                                height: '8px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${lang.translated}%`,
                                  background: '#10B981',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.8rem', minWidth: '30px' }}>{lang.translated}%</span>
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.5rem',
                            }}
                          >
                            <span
                              style={{
                                padding: '0.25rem 0.75rem',
                                background: lang.active ? '#10B98140' : '#EF444440',
                                color: lang.active ? '#10B981' : '#EF4444',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                              }}
                            >
                              {lang.active ? '✓ Active' : '✗ Inactive'}
                            </span>
                            {lang.default && (
                              <span
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  background: '#3B82F640',
                                  color: '#3B82F6',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                }}
                              >
                                ⭐ Default
                              </span>
                            )}
                          </div>
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
                            ⚙️
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
