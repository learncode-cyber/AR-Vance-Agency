'use client'

import { useEffect, useState } from 'react'

interface LocalizationConfig {
  id: string
  defaultLanguage: string
  supportedLanguages: string
  detectBrowser: boolean
  rtlLanguages: string
  translationService: string
  fallbackLanguage: string
  cacheTranslations: boolean
  autoTranslate: boolean
}

export default function AdminLocalizationPage() {
  const [config, setConfig] = useState<LocalizationConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/admin/localization')
      if (res.ok) {
        const data = await res.json()
        setConfig(data.data)
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Localization Settings</h1>
        <button className="admin-btn admin-btn-primary">Save Changes</button>
      </div>

      <div className="admin-content">
        {loading || !config ? (
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        ) : (
          <div className="admin-card">
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h3>Language Configuration</h3>

              {/* Default Language */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Default Language
                </label>
                <select
                  defaultValue={config.defaultLanguage}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                  }}
                >
                  <option value="en">English</option>
                  <option value="bn">Bangla</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ar">العربية</option>
                </select>
              </div>

              {/* Fallback Language */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Fallback Language
                </label>
                <select
                  defaultValue={config.fallbackLanguage}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                  }}
                >
                  <option value="en">English</option>
                  <option value="bn">Bangla</option>
                </select>
              </div>

              {/* Translation Service */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Translation Service
                </label>
                <select
                  defaultValue={config.translationService}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                  }}
                >
                  <option value="none">None</option>
                  <option value="google">Google Translate</option>
                  <option value="deepl">DeepL</option>
                  <option value="openai">OpenAI</option>
                </select>
              </div>

              {/* Options */}
              <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={config.detectBrowser} />
                  <span>Detect browser language</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={config.cacheTranslations} />
                  <span>Cache translations</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={config.autoTranslate} />
                  <span>Auto-translate missing keys</span>
                </label>
              </div>

              {/* Info */}
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid #3B82F6',
                  borderRadius: '4px',
                  marginTop: '1rem',
                  fontSize: '0.85rem',
                  color: 'var(--text)',
                }}
              >
                <strong>💡 Tip:</strong> Enable "Detect browser language" to automatically show content in the user's
                preferred language.
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
